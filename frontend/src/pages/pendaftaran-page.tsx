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
import { FieldLabel } from '../components/field-label'
import { formatNik, formatPhone } from '../lib/input-normalizers'
import { canCreatePendaftaran, getActionAccess } from '../lib/access'
import { confirmThemedAction } from '../lib/sweet-alert'
import { getAuthUser } from '../lib/storage'
import { useT } from '../i18n'

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
        headerName: 'Registrasi',
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
        headerName: 'Pasien',
        minWidth: 250,
        wrapText: true,
        autoHeight: true,
        cellRenderer: (params: { value?: string; data?: PendaftaranItem }) => (
          <GridEntityCell primary={getPatientDisplayName(params.data as unknown as Record<string, unknown>)} secondary={String(params.value ?? '-').trim() || '-'} kind="patient" />
        ),
      },
      { field: 'dokterNama', headerName: 'Dokter', minWidth: 180 },
      {
        field: 'status',
        headerName: 'Status',
        minWidth: 130,
        cellRenderer: (params: { value?: string }) => {
          const statusMeta = getStatusMeta(params.value)
          return <span className="status-cell"><span className={`status-pill ${statusMeta.className}`}>{statusMeta.label}</span></span>
        },
      },
      {
        colId: 'aksi',
        headerName: 'Aksi',
        minWidth: 170,
        pinned: 'right',
        sortable: false,
        filter: false,
        cellRenderer: (params: { data?: PendaftaranItem }) => {
          const row = params.data
          if (!row) return null
          return (
            <div className="top-actions row-actions">
              <button className="icon-btn row-action-single" title="Buka di Pelayanan" aria-label="Buka di Pelayanan" onClick={() => navigate(`/pelayanan?search=${encodeURIComponent(row.idRegistrasi ?? '')}`)}><ExternalLink size={14} /><span className="action-label-desktop">Ke Pelayanan</span></button>
            </div>
          )
        },
      },
    ],
    [navigate],
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
    { label: 'Nama Pasien', value: getPatientDisplayName(detailSource) },
    { label: 'Dokter', value: pickValue(detailSource, ['dokterNama', 'namaDokter', 'dokter']) || '-' },
    { label: 'Tanggal Kunjungan', value: formatHumanDate(visitDate) },
    { label: 'Penjamin', value: pickValue(detailSource, ['penjamin', 'tipePenjamin']) || '-' },
  ]
  const patientIdentifier = pickValue(detailSource, ['noRm', 'no_rm', 'nomorRm', 'nomor_rm', 'idPasien', 'pasienId']) || '-'
  const complaintText = pickValue(detailSource, ['keluhan', 'anamnesa', 'catatan']) || '-'
  const detailSystemInfo = [
    { label: 'No. Registrasi', value: pickValue(detailSource, ['idRegistrasi']) || '-' },
    { label: 'No. RM / ID Pasien', value: patientIdentifier },
    { label: 'Kode Dokter', value: pickValue(detailSource, ['kdDokter']) || '-' },
    { label: 'ID Internal', value: pickValue(detailSource, ['id']) || '-' },
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
      setFormError('ID pasien dan kode dokter wajib diisi.')
      return
    }
    const pasienValid = (pasienRef.data?.data.items ?? []).some((item) => item.idPasien === form.idPasien.trim())
    const dokterValid = (dokterRef.data?.data ?? []).some((item) => item.kdDokter === form.kdDokter.trim())
    if (!pasienValid || !dokterValid) {
      setFormError('ID pasien atau kode dokter tidak valid. Pilih dari daftar referensi.')
      return
    }
    const confirmed = await confirmThemedAction({
      title: 'Konfirmasi tambah pendaftaran',
      text: `Tambah pendaftaran untuk pasien ${form.idPasien.trim()}?`,
      confirmText: 'Ya, Simpan',
    })
    if (!confirmed) return
    setFormError(null)
    const result = await runActionWithFeedback(
      () => createMutation.mutateAsync({ idPasien: form.idPasien.trim(), kdDokter: form.kdDokter.trim(), keluhan: form.keluhan.trim() || undefined }),
      'Pendaftaran berhasil ditambahkan.',
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
      setPasienBaruError('Nama, NIK, dan kode dokter wajib diisi.')
      return
    }
    const dokterValid = (dokterRef.data?.data ?? []).some((item) => item.kdDokter === pasienBaruForm.kdDokter.trim())
    if (!dokterValid) {
      setPasienBaruError('Kode dokter tidak valid. Pilih dari daftar referensi.')
      return
    }
    const confirmed = await confirmThemedAction({
      title: 'Konfirmasi tambah pasien baru',
      text: `Tambah pendaftaran pasien baru atas nama ${pasienBaruForm.nama.trim()}?`,
      confirmText: 'Ya, Simpan',
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
      'Pendaftaran pasien baru berhasil ditambahkan.',
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
      {!canCreate ? <p><span className="readonly-badge">Mode Read-only</span></p> : null}

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
        {query.isFetching ? <span className="kbd-hint">Memuat data...</span> : null}
      </div>
      <div className="stats-grid">
        <article className="stat-card">
          <small>Total Pendaftaran</small>
          <strong>{statusFilter ? filteredItems.length : data?.total ?? 0}</strong>
        </article>
        <article className="stat-card">
          <small>Menunggu</small>
          <strong>{statusCounts.menunggu}</strong>
        </article>
        <article className="stat-card">
          <small>Dilayani / Checked-in</small>
          <strong>{statusCounts.dilayani + statusCounts.selesai}</strong>
        </article>
        <article className="stat-card">
          <small>Dibatalkan</small>
          <strong>{statusCounts.dibatalkan}</strong>
        </article>
      </div>

      <section className="registration-queue-card">
        <div className="registration-queue-head">
        <div>
            <h2>{t('pendaftaran.queue')}</h2>
            <p>Menampilkan {filteredItems.length} data pada halaman ini{selected ? `, terpilih ${selected.idRegistrasi}` : ''}.</p>
          </div>
          <div className="registration-queue-actions">
            <button className="icon-btn" onClick={() => { const today = new Date().toISOString().slice(0, 10); setSearch(today); setPage(1) }}><CalendarDays size={14} /> Hari Ini</button>
            <button className="icon-btn" onClick={async () => { await query.refetch(); toast.success('Data pendaftaran diperbarui.') }}><RefreshCw size={14} /> {t('common.refresh')}</button>
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
          {activeFilterCount > 0 ? <button className="icon-btn icon-only" title="Reset filter" aria-label="Reset filter" onClick={() => { setSearch(''); setStatusFilter(''); setPage(1) }}><RotateCcw size={14} /></button> : null}
        </div>
      ) : null}

      <div className="pager-row">
        <button className="icon-btn icon-only" title="Halaman sebelumnya" aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
          <ChevronLeft size={14} />
        </button>
        <span>
          {t('common.page')} {page} / {totalPage}
        </span>
        <button className="icon-btn icon-only" title="Halaman berikutnya" aria-label="Halaman berikutnya" disabled={page >= totalPage} onClick={() => setPage((prev) => prev + 1)}>
          <ChevronRight size={14} />
        </button>
      </div>
      </section>

      <FormModal
        open={createExistingModalOpen}
        title="Tambah Pendaftaran (Pasien Existing)"
        description="Pilih pasien dan dokter dari referensi. Konfirmasi akan muncul sebelum penyimpanan."
        icon={Users}
        size="sm"
        className="registration-modal"
        onClose={() => setCreateExistingModalOpen(false)}
      >
        <div className="registration-onboarding compact">
          <div className="registration-intro-panel">
            <div className="registration-intro-icon"><Users size={22} /></div>
            <div>
              <small>Existing Patient</small>
              <strong>Registrasi Pasien Lama</strong>
              <p>Cari pasien dari master, lalu tentukan dokter dan keluhan awal untuk kunjungan baru.</p>
            </div>
          </div>
          <div className="registration-stepper" aria-label="Alur pendaftaran pasien existing">
            <span className="registration-step active"><b>1</b> Pasien</span>
            <span className="registration-step active"><b>2</b> Dokter</span>
            <span className="registration-step"><b>3</b> Konfirmasi</span>
          </div>
          <div className="registration-form-panel form-grid">
            <FieldLabel text="ID Pasien (Master)" htmlFor="pendaftaran-existing-idpasien">
              <StrictMasterComboboxField
                inputId="pendaftaran-existing-idpasien"
                value={form.idPasien}
                onChange={(next) => {
                  setForm((p) => ({ ...p, idPasien: next }))
                  setFormError(null)
                }}
                placeholder="Cari atau pilih ID pasien"
                options={(pasienRef.data?.data.items ?? []).map((item) => ({ value: item.idPasien, label: item.nama }))}
                loading={pasienRef.isLoading || pasienRef.isFetching}
                recentKey="pendaftaran-idpasien"
                errorMessage="ID pasien harus dipilih dari daftar referensi."
                onStrictError={setFormError}
                disabled={!canCreate}
              />
            </FieldLabel>
            <FieldLabel text="Kode Dokter (Master)" htmlFor="pendaftaran-existing-kddokter">
              <StrictMasterComboboxField
                inputId="pendaftaran-existing-kddokter"
                value={form.kdDokter}
                onChange={(next) => {
                  setForm((p) => ({ ...p, kdDokter: next }))
                  setFormError(null)
                }}
                placeholder="Cari atau pilih kode dokter"
                options={(dokterRef.data?.data ?? []).map((item) => ({ value: item.kdDokter, label: item.namaDokter || item.kdDokter }))}
                loading={dokterRef.isLoading || dokterRef.isFetching}
                recentKey="pendaftaran-kddokter"
                errorMessage="Kode dokter harus dipilih dari daftar referensi."
                onStrictError={setFormError}
                disabled={!canCreate}
              />
            </FieldLabel>
            <FieldLabel text="Keluhan" htmlFor="pendaftaran-existing-keluhan">
              <input id="pendaftaran-existing-keluhan" className="search-input" placeholder="Contoh: demam 3 hari" value={form.keluhan} onChange={(e) => setForm((p) => ({ ...p, keluhan: e.target.value }))} disabled={!canCreate} />
            </FieldLabel>
          </div>
        </div>
        <FormFeedback errors={[formError]} />
        <div className="confirm-actions">
          <button className="btn-muted" onClick={() => setForm({ idPasien: '', kdDokter: '', keluhan: '' })}>Reset Form</button>
          <button className="btn-primary" disabled={createMutation.isPending || !canCreate} title={!canCreate ? createAccess.reason : undefined} onClick={submitCreateExisting}>
            {createMutation.isPending ? 'Menyimpan...' : 'Simpan Pendaftaran'}
          </button>
        </div>
      </FormModal>

      <FormModal
        open={createNewPatientModalOpen}
        title="Tambah Pendaftaran + Pasien Baru"
        description="Lengkapi identitas pasien baru. Konfirmasi akan muncul sebelum penyimpanan."
        icon={UserPlus}
        size="lg"
        className="registration-modal"
        footerNote="Data pasien baru akan disimpan permanen dan langsung dibuatkan pendaftaran kunjungan."
        onClose={() => setCreateNewPatientModalOpen(false)}
      >
        <div className="registration-onboarding">
          <aside className="registration-intro-panel">
            <div className="registration-intro-icon"><UserPlus size={22} /></div>
            <div>
              <small>New Patient</small>
              <strong>Onboarding Pasien Baru</strong>
              <p>Lengkapi data identitas, pilih dokter referensi, lalu sistem akan membuat pasien dan pendaftaran kunjungan sekaligus.</p>
            </div>
            <div className="registration-checklist">
              <span>Validasi NIK</span>
              <span>Dokter master wajib</span>
              <span>Konfirmasi sebelum simpan</span>
            </div>
          </aside>
          <div className="registration-form-panel">
            <div className="registration-stepper" aria-label="Alur pendaftaran pasien baru">
              <span className="registration-step active"><b>1</b> Identitas Pasien</span>
              <span className="registration-step active"><b>2</b> Dokter</span>
              <span className="registration-step"><b>3</b> Konfirmasi</span>
            </div>
            <div className="form-grid">
              <FieldLabel text="Nama Pasien" htmlFor="pendaftaran-baru-nama">
                <input id="pendaftaran-baru-nama" className="search-input" placeholder="Nama lengkap pasien" value={pasienBaruForm.nama} onChange={(e) => setPasienBaruForm((p) => ({ ...p, nama: e.target.value }))} disabled={!canCreate} />
              </FieldLabel>
              <FieldLabel text="NIK" htmlFor="pendaftaran-baru-nik">
                <input id="pendaftaran-baru-nik" className="search-input" placeholder="16 digit NIK" value={pasienBaruForm.nik} onChange={(e) => setPasienBaruForm((p) => ({ ...p, nik: formatNik(e.target.value) }))} disabled={!canCreate} />
              </FieldLabel>
              <FieldLabel text="Kode Dokter (Master)" htmlFor="pendaftaran-baru-kddokter">
                <StrictMasterComboboxField
                  inputId="pendaftaran-baru-kddokter"
                  value={pasienBaruForm.kdDokter}
                  onChange={(next) => {
                    setPasienBaruForm((p) => ({ ...p, kdDokter: next }))
                    setPasienBaruError(null)
                  }}
                  placeholder="Cari atau pilih kode dokter"
                  options={(dokterRef.data?.data ?? []).map((item) => ({ value: item.kdDokter, label: item.namaDokter || item.kdDokter }))}
                  loading={dokterRef.isLoading || dokterRef.isFetching}
                  recentKey="pendaftaran-baru-kddokter"
                  errorMessage="Kode dokter harus dipilih dari daftar referensi."
                  onStrictError={setPasienBaruError}
                  disabled={!canCreate}
                />
              </FieldLabel>
              <FieldLabel text="No. HP" htmlFor="pendaftaran-baru-nohp">
                <input id="pendaftaran-baru-nohp" className="search-input" placeholder="08xxxxxxxxxx" value={pasienBaruForm.noHp} onChange={(e) => setPasienBaruForm((p) => ({ ...p, noHp: formatPhone(e.target.value) }))} disabled={!canCreate} />
              </FieldLabel>
            </div>
          </div>
        </div>
        <FormFeedback errors={[pasienBaruError]} />
        <div className="confirm-actions">
          <button className="btn-muted" onClick={() => setPasienBaruForm({ nama: '', nik: '', kdDokter: '', noHp: '' })}>Reset Form</button>
          <button className="btn-primary" disabled={createPasienBaruMutation.isPending || !canCreate} title={!canCreate ? createAccess.reason : undefined} onClick={submitCreateNewPatient}>
            {createPasienBaruMutation.isPending ? 'Menyimpan...' : 'Simpan Pasien Baru'}
          </button>
        </div>
      </FormModal>

      <div className="detail-with-logs">
        <section className={`preview-box detail-soft ${selected ? 'glass-focus' : 'glass-strong'}`}>
          <h2>Detail Pendaftaran</h2>
          {selected ? <div className="selected-strip"><p>Dipilih: <strong>{selected.idRegistrasi}</strong> - {getPatientDisplayName(detailSource)}</p><div className="selected-strip-meta"><span className="detail-badge">{selected.idRegistrasi}</span><span className={`status-pill selected-status-pill ${detailStatus.className}`}>{detailStatus.label}</span></div></div> : null}
          {!selected ? (
            <p>Pilih baris pendaftaran untuk melihat detail lengkap.</p>
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
                <span><strong>No. Registrasi:</strong> {detailSystemInfo[0].value}</span>
                <span><strong>No. RM / ID Pasien:</strong> {detailSystemInfo[1].value}</span>
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
                <small className="detail-label">Keluhan</small>
                <strong className="detail-value">{complaintText}</strong>
              </article>
              </div>
              {showSystemInfo ? <details className="detail-system">
                <summary>Info Sistem (Admin/Dev)</summary>
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
          <h2>Status Pendaftaran</h2>
          <p className="empty-note">Gunakan panel detail untuk meninjau data pasien, dokter, dan metadata registrasi yang dipilih.</p>
          <div className="detail-meta-grid">
            <article><small>Baris Tampil</small><strong>{filteredItems.length}</strong></article>
            <article><small>Filter Aktif</small><strong>{activeFilterCount}</strong></article>
          </div>
        </aside>
      </div>
    </section>
  )
}
