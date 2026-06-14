import { useEffect, useMemo, useRef, useState } from 'react'
import type { ColDef } from 'ag-grid-community'
import type { RowClickedEvent } from 'ag-grid-community'
import { useMutation, useQuery } from '@tanstack/react-query'
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, RefreshCw, RotateCcw, UserPlus, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DataGrid } from '../components/data-grid'
import { GridEntityCell } from '../components/grid-entity-cell'
import { PageHeader } from '../components/page-header'
import { usePendaftaran } from '../hooks/use-pendaftaran'
import type { PendaftaranItem } from '../api/pendaftaran'
import { FormModal } from '../components/form-modal'
import { createPendaftaran, createPendaftaranPasienBaru, getPendaftaranDetail } from '../api/pendaftaran'
import { FormFeedback } from '../components/form-feedback'
import { runActionWithFeedback } from '../lib/action-feedback'
import { useMasterDokter, useMasterPasien } from '../hooks/use-master'
import { useDebouncedValue } from '../hooks/use-debounced-value'
import { getStatusMeta } from '../lib/status-meta'
import { StrictMasterComboboxField } from '../components/strict-master-combobox-field'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { formatNik, formatPhone } from '../lib/input-normalizers'
import { canCreatePendaftaran, getActionAccess } from '../lib/access'
import { confirmThemedAction } from '../lib/confirm-action'
import { getAuthUser } from '../lib/storage'
import { useT, type TranslationKey } from '../i18n'

function getPatientDisplayName(data?: Record<string, unknown> | null) {
  const value = data?.namaPasien ?? data?.nama_pasien ?? data?.nama ?? data?.pasienNama ?? data?.namaPatient
  const text = String(value ?? '').trim()
  return text || '-'
}

function pickValue(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') return String(value)
  }
  return ''
}

function formatHumanDate(value: string) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(parsed)
}

export function PendaftaranPage({ canFetch }: { canFetch: boolean }) {
  const { t } = useT()
  const msg = (key: TranslationKey, values: Record<string, string | number> = {}) => Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), t(key))
  const canCreate = canCreatePendaftaran()
  const createAccess = getActionAccess('pendaftaranCreate')
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialPage = Math.max(1, Number(searchParams.get('page') || '1') || 1)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const debouncedSearch = useDebouncedValue(search)
  const [page, setPage] = useState(initialPage)
  const [selected, setSelected] = useState<PendaftaranItem | null>(null)
  const [createExistingModalOpen, setCreateExistingModalOpen] = useState(false)
  const [createNewPatientModalOpen, setCreateNewPatientModalOpen] = useState(false)
  const [form, setForm] = useState({ idPasien: '', kdDokter: '', keluhan: '' })
  const [pasienBaruForm, setPasienBaruForm] = useState({ nama: '', nik: '', kdDokter: '', noHp: '' })
  const [formError, setFormError] = useState<string | null>(null)
  const [pasienBaruError, setPasienBaruError] = useState<string | null>(null)
  const query = usePendaftaran({ page, pageSize: 20, search: debouncedSearch || undefined }, canFetch)
  const dokterRef = useMasterDokter('', canFetch)
  const pasienRef = useMasterPasien(1, 100, '', canFetch)
  const createMutation = useMutation({ mutationFn: createPendaftaran })
  const createPasienBaruMutation = useMutation({ mutationFn: createPendaftaranPasienBaru })
  const detailQuery = useQuery({
    queryKey: ['pendaftaran-detail', selected?.id],
    queryFn: () => getPendaftaranDetail(selected!.id),
    enabled: canFetch && Boolean(selected?.id),
  })

  const columns = useMemo<ColDef<PendaftaranItem>[]>(
    () => [
      {
        colId: 'select',
        headerName: '',
        width: 44,
        maxWidth: 44,
        minWidth: 44,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelection: false,
        sortable: false,
        filter: false,
        resizable: false,
      },
      {
        field: 'idRegistrasi',
        headerName: t('registration.detail.registrationNo'),
        minWidth: 190,
        pinned: 'left',
        wrapText: true,
        autoHeight: true,
        cellRenderer: (params: { value?: string; data?: PendaftaranItem }) => (
          <div>
            <div className="cell-primary">{String(params.value ?? '-')}</div>
            <div className="cell-subline registrasi-subline">{String(params.data?.tanggal ?? '-')}</div>
          </div>
        ),
      },
      {
        field: 'idPasien',
        headerName: t('registration.step.patient'),
        minWidth: 250,
        wrapText: true,
        autoHeight: true,
        cellRenderer: (params: { value?: string; data?: PendaftaranItem }) => (
          <GridEntityCell primary={getPatientDisplayName(params.data as unknown as Record<string, unknown>)} secondary={String(params.value ?? '-').trim() || '-'} kind="patient" />
        ),
      },
      { field: 'dokterNama', headerName: t('registration.detail.doctor'), minWidth: 180 },
      {
        field: 'status',
        headerName: t('common.status'),
        minWidth: 130,
        cellRenderer: (params: { value?: string }) => {
          const statusMeta = getStatusMeta(params.value)
          return <span className="status-cell"><span className={`status-pill ${statusMeta.className}`}>{statusMeta.label}</span></span>
        },
      },
      {
        colId: 'aksi',
        headerName: t('common.actions'),
        minWidth: 170,
        pinned: 'right',
        sortable: false,
        filter: false,
        cellRenderer: (params: { data?: PendaftaranItem }) => {
          const row = params.data
          if (!row) return null
          return (
            <div className="top-actions row-actions">
              <button className="icon-btn row-action-single" title={t('registration.openService')} aria-label={t('registration.openService')} onClick={() => navigate(`/pelayanan?search=${encodeURIComponent(row.idRegistrasi ?? '')}`)}><ExternalLink size={14} /><span className="action-label-desktop">{t('registration.toService')}</span></button>
            </div>
          )
        },
      },
    ],
    [navigate, t],
  )

  const data = query.data?.data
  const activeLoading = query.isLoading || query.isFetching
  const filteredItems = useMemo(() => {
    const rows = data?.items ?? []
    if (!statusFilter) return rows
    return rows.filter((item) => String(item.status ?? '') === statusFilter)
  }, [data?.items, statusFilter])
  const totalPage = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.pageSize ?? 20)))
  const activeFilterCount = (search.trim() ? 1 : 0) + (statusFilter ? 1 : 0)
  const detailData = (detailQuery.data?.data ?? {}) as Record<string, unknown>
  const detailSource = { ...(selected as unknown as Record<string, unknown> || {}), ...detailData }
  const detailStatus = getStatusMeta(pickValue(detailSource, ['status']) || String(selected?.status ?? ''))
  const role = String(getAuthUser()?.role || '').toLowerCase()
  const showSystemInfo = role === 'admin' || role === 'dev' || role === 'developer'
  const visitDate = pickValue(detailSource, ['tanggal', 'tglKunjungan', 'createdAt'])
  const detailOverview = [
    { label: t('registration.detail.patientName'), value: getPatientDisplayName(detailSource) },
    { label: t('registration.detail.doctor'), value: pickValue(detailSource, ['dokterNama', 'namaDokter', 'dokter']) || '-' },
    { label: t('registration.detail.visitDate'), value: formatHumanDate(visitDate) },
    { label: t('registration.detail.guarantor'), value: pickValue(detailSource, ['penjamin', 'tipePenjamin']) || '-' },
  ]
  const patientIdentifier = pickValue(detailSource, ['noRm', 'no_rm', 'nomorRm', 'nomor_rm', 'idPasien', 'pasienId']) || '-'
  const complaintText = pickValue(detailSource, ['keluhan', 'anamnesa', 'catatan']) || '-'
  const detailSystemInfo = [
    { label: t('registration.detail.registrationNo'), value: pickValue(detailSource, ['idRegistrasi']) || '-' },
    { label: t('registration.detail.patientNo'), value: patientIdentifier },
    { label: t('registration.detail.doctorCode'), value: pickValue(detailSource, ['kdDokter']) || '-' },
    { label: t('registration.detail.internalId'), value: pickValue(detailSource, ['id']) || '-' },
  ]
  const statusCounts = useMemo(() => ({
    menunggu: filteredItems.filter((item) => String(item.status ?? '') === '1').length,
    dilayani: filteredItems.filter((item) => String(item.status ?? '') === '2').length,
    selesai: filteredItems.filter((item) => String(item.status ?? '') === '3').length,
    dibatalkan: filteredItems.filter((item) => String(item.status ?? '') === '4').length,
  }), [filteredItems])
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return
      event.preventDefault()
      searchInputRef.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const next = new URLSearchParams()
    next.set('page', String(page))
    if (search.trim()) next.set('search', search.trim())
    if (statusFilter) next.set('status', statusFilter)
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true })
    }
  }, [page, search, statusFilter, searchParams, setSearchParams])

  useEffect(() => {
    if (!activeLoading && page > totalPage) {
      const timer = window.setTimeout(() => setPage(totalPage), 0)
      return () => window.clearTimeout(timer)
    }
  }, [activeLoading, page, totalPage])

  async function submitCreateExisting() {
    if (!canCreate || createMutation.isPending) return
    if (!form.idPasien.trim() || !form.kdDokter.trim()) {
      setFormError(t('registration.error.patientDoctorRequired'))
      return
    }
    const pasienValid = (pasienRef.data?.data.items ?? []).some((item) => item.idPasien === form.idPasien.trim())
    const dokterValid = (dokterRef.data?.data ?? []).some((item) => item.kdDokter === form.kdDokter.trim())
    if (!pasienValid || !dokterValid) {
      setFormError(t('registration.error.patientDoctorInvalid'))
      return
    }
    const confirmed = await confirmThemedAction({
      title: t('registration.confirm.existingTitle'),
      text: msg('registration.confirm.existingText', { id: form.idPasien.trim() }),
      confirmText: t('registration.confirm.save'),
    })
    if (!confirmed) return
    setFormError(null)
    const result = await runActionWithFeedback(
      () => createMutation.mutateAsync({ idPasien: form.idPasien.trim(), kdDokter: form.kdDokter.trim(), keluhan: form.keluhan.trim() || undefined }),
      t('registration.success.existing'),
    )
    if (result) {
      setCreateExistingModalOpen(false)
      setForm({ idPasien: '', kdDokter: '', keluhan: '' })
      await query.refetch()
    }
  }

  async function submitCreateNewPatient() {
    if (!canCreate || createPasienBaruMutation.isPending) return
    if (!pasienBaruForm.nama.trim() || !pasienBaruForm.nik.trim() || !pasienBaruForm.kdDokter.trim()) {
      setPasienBaruError(t('registration.error.newRequired'))
      return
    }
    const dokterValid = (dokterRef.data?.data ?? []).some((item) => item.kdDokter === pasienBaruForm.kdDokter.trim())
    if (!dokterValid) {
      setPasienBaruError(t('registration.error.doctorInvalid'))
      return
    }
    const confirmed = await confirmThemedAction({
      title: t('registration.confirm.newTitle'),
      text: msg('registration.confirm.newText', { name: pasienBaruForm.nama.trim() }),
      confirmText: t('registration.confirm.save'),
    })
    if (!confirmed) return
    setPasienBaruError(null)
    const result = await runActionWithFeedback(
      () =>
        createPasienBaruMutation.mutateAsync({
          nama: pasienBaruForm.nama.trim(),
          nik: pasienBaruForm.nik.trim(),
          kdDokter: pasienBaruForm.kdDokter.trim(),
          noHp: pasienBaruForm.noHp.trim() || undefined,
        }),
      t('registration.success.new'),
    )
    if (result) {
      setCreateNewPatientModalOpen(false)
      setPasienBaruForm({ nama: '', nik: '', kdDokter: '', noHp: '' })
      await query.refetch()
    }
  }

  return (
    <section className="page-card">
      <PageHeader
        title={t('pendaftaran.title')}
        description={t('nav.pendaftaran.desc')}
        eyebrow={t('pendaftaran.eyebrow')}
        actions={(
          <div className="registration-header-actions">
            <button className="icon-btn btn-primary" disabled={!canCreate} title={!canCreate ? createAccess.reason : t('pendaftaran.new')} onClick={() => setCreateNewPatientModalOpen(true)}><UserPlus size={16} /> {t('pendaftaran.new')}</button>
            <button className="icon-btn" disabled={!canCreate} title={!canCreate ? createAccess.reason : t('pendaftaran.existing')} onClick={() => setCreateExistingModalOpen(true)}><Users size={16} /> {t('pendaftaran.existing')}</button>
          </div>
        )}
      />
      {!canCreate ? <p><span className="readonly-badge">{t('registration.readonly')}</span></p> : null}

      <div className="toolbar-row toolbar-primary">
        <input
          ref={searchInputRef}
          className="search-input search-dominant"
          placeholder={t('pendaftaran.search')}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
        {query.isFetching ? <span className="kbd-hint">{t('registration.loading')}</span> : null}
      </div>
      <div className="stats-grid">
        <article className="stat-card">
          <small>{t('registration.total')}</small>
          <strong>{statusFilter ? filteredItems.length : data?.total ?? 0}</strong>
        </article>
        <article className="stat-card">
          <small>{t('registration.waiting')}</small>
          <strong>{statusCounts.menunggu}</strong>
        </article>
        <article className="stat-card">
          <small>{t('registration.servedCheckedIn')}</small>
          <strong>{statusCounts.dilayani + statusCounts.selesai}</strong>
        </article>
        <article className="stat-card">
          <small>{t('registration.cancelled')}</small>
          <strong>{statusCounts.dibatalkan}</strong>
        </article>
      </div>

      <section className="registration-queue-card">
        <div className="registration-queue-head">
        <div>
            <h2>{t('pendaftaran.queue')}</h2>
            <p>{msg('registration.queueShowing', { count: filteredItems.length, selected: selected ? msg('registration.queueSelected', { id: selected.idRegistrasi ?? '-' }) : '' })}</p>
          </div>
          <div className="registration-queue-actions">
            <button className="icon-btn" onClick={() => { const today = new Date().toISOString().slice(0, 10); setSearch(today); setPage(1) }}><CalendarDays size={14} /> {t('registration.today')}</button>
            <button className="icon-btn" onClick={async () => { await query.refetch(); toast.success(t('registration.refreshSuccess')) }}><RefreshCw size={14} /> {t('common.refresh')}</button>
          </div>
        </div>
        <div className="registration-filter-strip">
          <span>{t('pendaftaran.statusFilter')}</span>
          <div className="filter-chip-wrap">
            <button className={`filter-chip ${statusFilter === '1' ? 'active' : ''}`} onClick={() => { setStatusFilter('1'); setPage(1) }}>{t('status.waiting')}</button>
            <button className={`filter-chip ${statusFilter === '2' ? 'active' : ''}`} onClick={() => { setStatusFilter('2'); setPage(1) }}>{t('status.served')}</button>
            <button className={`filter-chip ${statusFilter === '3' ? 'active' : ''}`} onClick={() => { setStatusFilter('3'); setPage(1) }}>{t('status.done')}</button>
            <button className={`filter-chip ${statusFilter === '4' ? 'active' : ''}`} onClick={() => { setStatusFilter('4'); setPage(1) }}>{t('status.cancelled')}</button>
            <button className={`filter-chip ${statusFilter === '' ? 'active' : ''}`} onClick={() => { setStatusFilter(''); setPage(1) }}>{t('common.all')}</button>
          </div>
        </div>
      {activeLoading ? (
        <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
          <div className="skeleton-block" />
          <div className="skeleton-block" />
          <div className="skeleton-block" />
        </div>
      ) : null}

      <DataGrid
        storageKey="pendaftaran-main"
        rows={filteredItems}
        columns={columns}
        loading={activeLoading}
        rowSelection={{ mode: 'singleRow', checkboxes: false }}
        selectedRowId={selected?.idRegistrasi ?? null}
        selectedRowField="idRegistrasi"
        onRowClicked={(event: RowClickedEvent<PendaftaranItem>) => setSelected(event.data ?? null)}
      />
      {!activeLoading && filteredItems.length === 0 ? (
        <div className="empty-state">
          <p className="empty-note">{t('grid.empty')}</p>
          {activeFilterCount > 0 ? <button className="icon-btn icon-only" title={t('registration.resetFilter')} aria-label={t('registration.resetFilter')} onClick={() => { setSearch(''); setStatusFilter(''); setPage(1) }}><RotateCcw size={14} /></button> : null}
        </div>
      ) : null}

      <div className="pager-row">
        <button className="icon-btn icon-only" title={t('common.previousPage')} aria-label={t('common.previousPage')} disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
          <ChevronLeft size={14} />
        </button>
        <span>
          {t('common.page')} {page} / {totalPage}
        </span>
        <button className="icon-btn icon-only" title={t('common.nextPage')} aria-label={t('common.nextPage')} disabled={page >= totalPage} onClick={() => setPage((prev) => prev + 1)}>
          <ChevronRight size={14} />
        </button>
      </div>
      </section>

      <FormModal
        open={createExistingModalOpen}
        title={t('registration.modal.existingTitle')}
        description={t('registration.modal.existingDesc')}
        icon={Users}
        size="sm"
        className="registration-modal"
        onClose={() => setCreateExistingModalOpen(false)}
      >
        <div className="registration-onboarding compact">
          <div className="registration-intro-panel">
            <div className="registration-intro-head">
              <div className="registration-intro-icon"><Users size={22} /></div>
              <div>
                <small>{t('registration.modal.existingKicker')}</small>
                <strong>{t('registration.modal.existingHeading')}</strong>
              </div>
            </div>
            <p>{t('registration.modal.existingIntro')}</p>
          </div>
          <div className="registration-stepper" aria-label={t('registration.modal.existingFlow')}>
            <span className="registration-step active"><b>1</b> {t('registration.step.patient')}</span>
            <span className="registration-step active"><b>2</b> {t('registration.step.doctor')}</span>
            <span className="registration-step"><b>3</b> {t('registration.step.confirm')}</span>
          </div>
          <div className="registration-form-panel form-grid">
            <div className="grid gap-2">
              <Label htmlFor="pendaftaran-existing-idpasien">{t('registration.field.patientId')}</Label>
              <StrictMasterComboboxField
                inputId="pendaftaran-existing-idpasien"
                value={form.idPasien}
                onChange={(next) => {
                  setForm((p) => ({ ...p, idPasien: next }))
                  setFormError(null)
                }}
                placeholder={t('registration.field.patientIdPlaceholder')}
                options={(pasienRef.data?.data.items ?? []).map((item) => ({ value: item.idPasien, label: item.nama }))}
                loading={pasienRef.isLoading || pasienRef.isFetching}
                recentKey="pendaftaran-idpasien"
                errorMessage={t('registration.error.patientStrict')}
                onStrictError={setFormError}
                disabled={!canCreate}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pendaftaran-existing-kddokter">{t('registration.field.doctorCode')}</Label>
              <StrictMasterComboboxField
                inputId="pendaftaran-existing-kddokter"
                value={form.kdDokter}
                onChange={(next) => {
                  setForm((p) => ({ ...p, kdDokter: next }))
                  setFormError(null)
                }}
                placeholder={t('registration.field.doctorCodePlaceholder')}
                options={(dokterRef.data?.data ?? []).map((item) => ({ value: item.kdDokter, label: item.namaDokter || item.kdDokter }))}
                loading={dokterRef.isLoading || dokterRef.isFetching}
                recentKey="pendaftaran-kddokter"
                errorMessage={t('registration.error.doctorStrict')}
                onStrictError={setFormError}
                disabled={!canCreate}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pendaftaran-existing-keluhan">{t('registration.field.complaint')}</Label>
              <Input id="pendaftaran-existing-keluhan" placeholder={t('registration.field.complaintPlaceholder')} value={form.keluhan} onChange={(e) => setForm((p) => ({ ...p, keluhan: e.target.value }))} disabled={!canCreate} />
            </div>
          </div>
        </div>
        <FormFeedback errors={[formError]} />
        <div className="confirm-actions">
          <Button variant="secondary" onClick={() => setForm({ idPasien: '', kdDokter: '', keluhan: '' })}>{t('registration.button.resetForm')}</Button>
          <Button disabled={createMutation.isPending || !canCreate} title={!canCreate ? createAccess.reason : undefined} onClick={submitCreateExisting}>
            {createMutation.isPending ? t('registration.button.saving') : t('registration.button.saveRegistration')}
          </Button>
        </div>
      </FormModal>

      <FormModal
        open={createNewPatientModalOpen}
        title={t('registration.modal.newTitle')}
        description={t('registration.modal.newDesc')}
        icon={UserPlus}
        size="lg"
        className="registration-modal"
        footerNote={t('registration.modal.newFooter')}
        onClose={() => setCreateNewPatientModalOpen(false)}
      >
        <div className="registration-onboarding">
          <aside className="registration-intro-panel">
            <div className="registration-intro-head">
              <div className="registration-intro-icon"><UserPlus size={22} /></div>
              <div>
                <small>{t('registration.modal.newKicker')}</small>
                <strong>{t('registration.modal.newHeading')}</strong>
              </div>
            </div>
            <p>{t('registration.modal.newIntro')}</p>
            <div className="registration-checklist">
              <span>{t('registration.check.nik')}</span>
              <span>{t('registration.check.doctorRequired')}</span>
              <span>{t('registration.check.confirmBeforeSave')}</span>
            </div>
          </aside>
          <div className="registration-form-panel">
            <div className="registration-stepper" aria-label={t('registration.modal.newFlow')}>
              <span className="registration-step active"><b>1</b> {t('registration.step.patientIdentity')}</span>
              <span className="registration-step active"><b>2</b> {t('registration.step.doctor')}</span>
              <span className="registration-step"><b>3</b> {t('registration.step.confirm')}</span>
            </div>
            <div className="form-grid">
              <div className="grid gap-2">
                <Label htmlFor="pendaftaran-baru-nama">{t('registration.field.patientName')}</Label>
                <Input id="pendaftaran-baru-nama" placeholder={t('registration.field.patientNamePlaceholder')} value={pasienBaruForm.nama} onChange={(e) => setPasienBaruForm((p) => ({ ...p, nama: e.target.value }))} disabled={!canCreate} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pendaftaran-baru-nik">{t('registration.field.nik')}</Label>
                <Input id="pendaftaran-baru-nik" placeholder={t('registration.field.nikPlaceholder')} value={pasienBaruForm.nik} onChange={(e) => setPasienBaruForm((p) => ({ ...p, nik: formatNik(e.target.value) }))} disabled={!canCreate} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pendaftaran-baru-kddokter">{t('registration.field.doctorCode')}</Label>
                <StrictMasterComboboxField
                  inputId="pendaftaran-baru-kddokter"
                  value={pasienBaruForm.kdDokter}
                  onChange={(next) => {
                    setPasienBaruForm((p) => ({ ...p, kdDokter: next }))
                    setPasienBaruError(null)
                  }}
                  placeholder={t('registration.field.doctorCodePlaceholder')}
                  options={(dokterRef.data?.data ?? []).map((item) => ({ value: item.kdDokter, label: item.namaDokter || item.kdDokter }))}
                  loading={dokterRef.isLoading || dokterRef.isFetching}
                  recentKey="pendaftaran-baru-kddokter"
                  errorMessage={t('registration.error.doctorStrict')}
                  onStrictError={setPasienBaruError}
                  disabled={!canCreate}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pendaftaran-baru-nohp">{t('registration.field.phone')}</Label>
                <Input id="pendaftaran-baru-nohp" placeholder={t('registration.field.phonePlaceholder')} value={pasienBaruForm.noHp} onChange={(e) => setPasienBaruForm((p) => ({ ...p, noHp: formatPhone(e.target.value) }))} disabled={!canCreate} />
              </div>
            </div>
          </div>
        </div>
        <FormFeedback errors={[pasienBaruError]} />
        <div className="confirm-actions">
          <Button variant="secondary" onClick={() => setPasienBaruForm({ nama: '', nik: '', kdDokter: '', noHp: '' })}>{t('registration.button.resetForm')}</Button>
          <Button disabled={createPasienBaruMutation.isPending || !canCreate} title={!canCreate ? createAccess.reason : undefined} onClick={submitCreateNewPatient}>
            {createPasienBaruMutation.isPending ? t('registration.button.saving') : t('registration.button.saveNewPatient')}
          </Button>
        </div>
      </FormModal>

      <div className="detail-with-logs">
        <section className={`preview-box detail-soft ${selected ? 'glass-focus' : 'glass-strong'}`}>
          <h2>{t('registration.detail.title')}</h2>
          {selected ? <div className="selected-strip"><p>{t('registration.detail.selected')}: <strong>{selected.idRegistrasi}</strong> - {getPatientDisplayName(detailSource)}</p><div className="selected-strip-meta"><span className="detail-badge">{selected.idRegistrasi}</span><span className={`status-pill selected-status-pill ${detailStatus.className}`}>{detailStatus.label}</span></div></div> : null}
          {!selected ? (
            <p>{t('registration.detail.empty')}</p>
          ) : detailQuery.isLoading ? (
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              <div className="skeleton-block" />
              <div className="skeleton-block" />
              <div className="skeleton-block" />
            </div>
          ) : (
            <div className="detail-layout" style={{ marginTop: 10 }}>
              <div className="detail-main">
              <div className="detail-meta-strip">
                <span><strong>{t('registration.detail.registrationNo')}:</strong> {detailSystemInfo[0].value}</span>
                <span><strong>{t('registration.detail.patientNo')}:</strong> {detailSystemInfo[1].value}</span>
              </div>
                <div className="detail-facts">
                {detailOverview.map((item) => (
                  <div key={item.label} className="detail-fact">
                    <span className="detail-label">{item.label}</span>
                    <strong className="detail-value">{item.value}</strong>
                  </div>
                ))}
              </div>
              <article className="detail-item detail-complaint">
                <small className="detail-label">{t('registration.detail.complaint')}</small>
                <strong className="detail-value">{complaintText}</strong>
              </article>
              </div>
              {showSystemInfo ? <details className="detail-system">
                <summary>{t('registration.detail.systemInfo')}</summary>
                <div className="detail-grid-two detail-grid-compact" style={{ marginTop: 8 }}>
                  {detailSystemInfo.map((item) => (
                    <article key={item.label} className="detail-item">
                      <small className="detail-label">{item.label}</small>
                      <strong className="detail-value">{item.value}</strong>
                    </article>
                  ))}
                </div>
              </details>
              : null}
            </div>
          )}
        </section>
        <aside className="preview-box detail-soft glass-soft">
          <h2>{t('registration.status.title')}</h2>
          <p className="empty-note">{t('registration.status.desc')}</p>
          <div className="detail-meta-grid">
            <article><small>{t('registration.status.visibleRows')}</small><strong>{filteredItems.length}</strong></article>
            <article><small>{t('registration.status.activeFilters')}</small><strong>{activeFilterCount}</strong></article>
          </div>
        </aside>
      </div>
    </section>
  )
}
