import { useEffect, useMemo, useRef, useState } from 'react'
import type { ColDef, RowClickedEvent } from 'ag-grid-community'
import { useMutation } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, ClipboardList, Pencil, Plus, Stethoscope, Trash2, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import { DataGrid } from '../components/data-grid'
import { PageHeader } from '../components/page-header'
import { useMasterDiagnosa, useMasterDokter, useMasterJasa, useMasterPasien } from '../hooks/use-master'
import { FormFeedback } from '../components/form-feedback'
import { FormModal } from '../components/form-modal'
import {
  deleteMasterDiagnosa,
  deleteMasterDokter,
  deleteMasterJasa,
  type MasterDiagnosa,
  type MasterDokter,
  type MasterJasa,
  upsertMasterDiagnosa,
  upsertMasterDokter,
  upsertMasterJasa,
} from '../api/master'
import { runActionWithFeedback } from '../lib/action-feedback'
import { useDebouncedValue } from '../hooks/use-debounced-value'
import { confirmThemedAction } from '../lib/sweet-alert'
import { FieldLabel } from '../components/field-label'
import { useT, type TranslationKey } from '../i18n'

type MasterMode = 'dokter' | 'pasien' | 'jasa' | 'diagnosa'

function toNumber(value: string, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function formatMasterStatus(value: unknown, t: (key: TranslationKey) => string) {
  return String(value ?? '') === '1' ? t('master.status.active') : t('master.status.inactive')
}

export function MasterPage({ canFetch }: { canFetch: boolean }) {
  const { t } = useT()
  const msg = (key: TranslationKey, values: Record<string, string | number> = {}) => Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), t(key))
  const [searchParams, setSearchParams] = useSearchParams()
  const initialModeParam = searchParams.get('mode')
  const initialMode: MasterMode = initialModeParam === 'pasien' || initialModeParam === 'jasa' || initialModeParam === 'diagnosa' ? initialModeParam : 'dokter'
  const initialPage = Math.max(1, Number(searchParams.get('page') || '1') || 1)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [mode, setMode] = useState<MasterMode>(initialMode)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const debouncedSearch = useDebouncedValue(search)
  const [page, setPage] = useState(initialPage)
  const [selectedDokter, setSelectedDokter] = useState<MasterDokter | null>(null)
  const [selectedJasa, setSelectedJasa] = useState<MasterJasa | null>(null)
  const [selectedDiagnosa, setSelectedDiagnosa] = useState<MasterDiagnosa | null>(null)
  const [kdDokter, setKdDokter] = useState('')
  const [namaDokter, setNamaDokter] = useState('')
  const [icd9, setIcd9] = useState('')
  const [namaJasa, setNamaJasa] = useState('')
  const [keteranganJasa, setKeteranganJasa] = useState('')
  const [hargaJasa, setHargaJasa] = useState('0')
  const [statusJasa, setStatusJasa] = useState('1')
  const [kodeDiagnosa, setKodeDiagnosa] = useState('')
  const [kodeSnomed, setKodeSnomed] = useState('')
  const [namaDiagnosa, setNamaDiagnosa] = useState('')
  const [statusDiagnosa, setStatusDiagnosa] = useState('1')
  const [dokterModalOpen, setDokterModalOpen] = useState(false)
  const [jasaModalOpen, setJasaModalOpen] = useState(false)
  const [diagnosaModalOpen, setDiagnosaModalOpen] = useState(false)
  const [jasaErrors, setJasaErrors] = useState<{ namaJasa?: string; harga?: string; status?: string }>({})
  const [diagnosaErrors, setDiagnosaErrors] = useState<{ kodeDiagnosa?: string; namaDiagnosa?: string; status?: string }>({})

  const dokter = useMasterDokter(debouncedSearch, canFetch && mode === 'dokter')
  const pasien = useMasterPasien(page, 20, debouncedSearch, canFetch && mode === 'pasien')
  const jasa = useMasterJasa(page, 20, debouncedSearch, canFetch && mode === 'jasa')
  const diagnosa = useMasterDiagnosa(page, 20, debouncedSearch, canFetch && mode === 'diagnosa')

  const upsertDokterMutation = useMutation({
    mutationFn: upsertMasterDokter,
  })

  const deleteDokterMutation = useMutation({
    mutationFn: deleteMasterDokter,
  })

  const upsertJasaMutation = useMutation({
    mutationFn: upsertMasterJasa,
  })

  const deleteJasaMutation = useMutation({
    mutationFn: deleteMasterJasa,
  })

  const upsertDiagnosaMutation = useMutation({
    mutationFn: upsertMasterDiagnosa,
  })

  const deleteDiagnosaMutation = useMutation({
    mutationFn: deleteMasterDiagnosa,
  })

  const activeData = mode === 'dokter' ? dokter.data?.data : mode === 'pasien' ? pasien.data?.data.items : mode === 'jasa' ? jasa.data?.data.items : diagnosa.data?.data.items
  const activeLoading = mode === 'dokter' ? dokter.isLoading || dokter.isFetching : mode === 'pasien' ? pasien.isLoading || pasien.isFetching : mode === 'jasa' ? jasa.isLoading || jasa.isFetching : diagnosa.isLoading || diagnosa.isFetching
  const totalItem = mode === 'pasien' ? pasien.data?.data.total ?? 0 : mode === 'jasa' ? jasa.data?.data.total ?? 0 : mode === 'diagnosa' ? diagnosa.data?.data.total ?? 0 : dokter.data?.data.length ?? 0
  const totalPage = Math.max(1, Math.ceil(totalItem / 20))
  const activeFilterCount = search.trim() ? 1 : 0

  const columns = useMemo<ColDef<Record<string, unknown>>[]>(() => {
    if (mode === 'dokter') {
      return [
        { field: 'kdDokter', headerName: t('master.col.doctorCode'), minWidth: 140 },
        { field: 'namaDokter', headerName: t('master.col.doctorName'), minWidth: 220 },
      ]
    }
    if (mode === 'pasien') {
      return [
        { field: 'idPasien', headerName: t('master.col.patientCode'), minWidth: 130 },
        { field: 'nik', headerName: 'NIK', minWidth: 160 },
        { field: 'nama', headerName: t('master.col.name'), minWidth: 220 },
        { field: 'noHp', headerName: t('master.col.phone'), minWidth: 140 },
      ]
    }
    if (mode === 'jasa') {
      return [
        { field: 'icd9', headerName: 'ICD9', minWidth: 120 },
        { field: 'namaJasa', headerName: t('master.col.serviceName'), minWidth: 220 },
        { field: 'harga', headerName: t('master.col.price'), minWidth: 140 },
        { field: 'status', headerName: t('common.status'), minWidth: 120, valueFormatter: ({ value }) => formatMasterStatus(value, t) },
      ]
    }
    return [
      { field: 'kodeDiagnosa', headerName: t('master.col.diagnosisCode'), minWidth: 160 },
      { field: 'namaDiagnosa', headerName: t('master.col.diagnosisName'), minWidth: 260 },
      { field: 'status', headerName: t('common.status'), minWidth: 120, valueFormatter: ({ value }) => formatMasterStatus(value, t) },
    ]
  }, [mode, t])

  const onRowClicked = (event: RowClickedEvent<Record<string, unknown>>) => {
    if (!event.data) return
    if (mode === 'dokter') {
      const data = event.data as unknown as MasterDokter
      setSelectedDokter(data)
      setKdDokter(data.kdDokter ?? '')
      setNamaDokter(data.namaDokter ?? '')
      return
    }
    if (mode === 'jasa') {
      const data = event.data as unknown as MasterJasa
      setSelectedJasa(data)
      setIcd9(data.icd9 ?? '')
      setNamaJasa(data.namaJasa ?? '')
      setKeteranganJasa('')
      setHargaJasa(String(data.harga ?? 0))
      setStatusJasa(String(data.status ?? 1))
      return
    }
    if (mode === 'diagnosa') {
      const data = event.data as unknown as MasterDiagnosa
      setSelectedDiagnosa(data)
      setKodeDiagnosa(data.kodeDiagnosa ?? '')
      setKodeSnomed('')
      setNamaDiagnosa(data.namaDiagnosa ?? '')
      setStatusDiagnosa(String(data.status ?? 1))
    }
  }

  function resetDokterForm() {
    setSelectedDokter(null)
    setKdDokter('')
    setNamaDokter('')
  }

  function resetJasaForm() {
    setSelectedJasa(null)
    setIcd9('')
    setNamaJasa('')
    setKeteranganJasa('')
    setHargaJasa('0')
    setStatusJasa('1')
  }

  function resetDiagnosaForm() {
    setSelectedDiagnosa(null)
    setKodeDiagnosa('')
    setKodeSnomed('')
    setNamaDiagnosa('')
    setStatusDiagnosa('1')
  }

  function openCreateModal() {
    if (mode === 'dokter') {
      resetDokterForm()
      setDokterModalOpen(true)
      return
    }
    if (mode === 'jasa') {
      resetJasaForm()
      setJasaErrors({})
      setJasaModalOpen(true)
      return
    }
    if (mode === 'diagnosa') {
      resetDiagnosaForm()
      setDiagnosaErrors({})
      setDiagnosaModalOpen(true)
    }
  }

  function openEditModal() {
    if (mode === 'dokter' && selectedDokter) {
      setDokterModalOpen(true)
      return
    }
    if (mode === 'jasa' && selectedJasa) {
      setJasaErrors({})
      setJasaModalOpen(true)
      return
    }
    if (mode === 'diagnosa' && selectedDiagnosa) {
      setDiagnosaErrors({})
      setDiagnosaModalOpen(true)
      return
    }
    toast.error(t('master.toast.selectToEdit'))
  }

  async function saveDokter() {
    if (mode !== 'dokter') return
    if (!kdDokter.trim() || !namaDokter.trim()) {
      toast.error(t('master.toast.doctorRequired'))
      return
    }

    const confirmed = await confirmThemedAction({
      title: selectedDokter ? t('master.confirm.updateDoctor') : t('master.confirm.addDoctor'),
      text: selectedDokter ? msg('master.confirm.updateDoctorText', { name: namaDokter.trim() }) : msg('master.confirm.addDoctorText', { name: namaDokter.trim() }),
      confirmText: selectedDokter ? t('master.confirm.update') : t('master.confirm.add'),
    })
    if (!confirmed) return

    const result = await runActionWithFeedback(
      () =>
        upsertDokterMutation.mutateAsync({
          id: selectedDokter?.id,
          kdDokter: kdDokter.trim(),
          namaDokter: namaDokter.trim(),
        }),
      t('master.success.doctorSaved'),
    )

    if (result) {
      setDokterModalOpen(false)
      resetDokterForm()
      await dokter.refetch()
    }
  }

  async function saveJasa() {
    if (mode !== 'jasa') return
    const nextErrors: { namaJasa?: string; harga?: string; status?: string } = {}
    if (!namaJasa.trim()) {
      nextErrors.namaJasa = t('master.error.serviceNameRequired')
    }

    const harga = toNumber(hargaJasa, -1)
    const status = toNumber(statusJasa, -1)
    if (harga < 0) {
      nextErrors.harga = t('master.error.priceNegative')
    }
    if (status !== 0 && status !== 1) {
      nextErrors.status = t('master.error.serviceStatus')
    }

    setJasaErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      toast.error(t('master.toast.serviceInvalid'))
      return
    }

    const confirmed = await confirmThemedAction({
      title: selectedJasa ? t('master.confirm.updateService') : t('master.confirm.addService'),
      text: selectedJasa ? msg('master.confirm.updateServiceText', { name: namaJasa.trim() }) : msg('master.confirm.addServiceText', { name: namaJasa.trim() }),
      confirmText: selectedJasa ? t('master.confirm.update') : t('master.confirm.add'),
    })
    if (!confirmed) return

    const result = await runActionWithFeedback(
      () =>
        upsertJasaMutation.mutateAsync({
          id: selectedJasa?.id,
          icd9: icd9.trim() || undefined,
          namaJasa: namaJasa.trim(),
          keterangan: keteranganJasa.trim() || undefined,
          harga,
          status,
        }),
      t('master.success.serviceSaved'),
    )

    if (result) {
      setJasaModalOpen(false)
      resetJasaForm()
      await jasa.refetch()
    }
  }

  async function saveDiagnosa() {
    if (mode !== 'diagnosa') return
    const nextErrors: { kodeDiagnosa?: string; namaDiagnosa?: string; status?: string } = {}
    if (!kodeDiagnosa.trim()) {
      nextErrors.kodeDiagnosa = t('master.error.diagnosisCodeRequired')
    }
    if (!namaDiagnosa.trim()) {
      nextErrors.namaDiagnosa = t('master.error.diagnosisNameRequired')
    }

    const status = toNumber(statusDiagnosa, -1)
    if (status !== 0 && status !== 1) {
      nextErrors.status = t('master.error.diagnosisStatus')
    }

    setDiagnosaErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      toast.error(t('master.toast.diagnosisInvalid'))
      return
    }

    const confirmed = await confirmThemedAction({
      title: selectedDiagnosa ? t('master.confirm.updateDiagnosis') : t('master.confirm.addDiagnosis'),
      text: selectedDiagnosa ? msg('master.confirm.updateDiagnosisText', { name: namaDiagnosa.trim() }) : msg('master.confirm.addDiagnosisText', { name: namaDiagnosa.trim() }),
      confirmText: selectedDiagnosa ? t('master.confirm.update') : t('master.confirm.add'),
    })
    if (!confirmed) return

    const result = await runActionWithFeedback(
      () =>
        upsertDiagnosaMutation.mutateAsync({
          id: selectedDiagnosa?.id,
          kodeDiagnosa: kodeDiagnosa.trim(),
          kodeSnomed: kodeSnomed.trim() || undefined,
          namaDiagnosa: namaDiagnosa.trim(),
          status,
        }),
      t('master.success.diagnosisSaved'),
    )

    if (result) {
      setDiagnosaModalOpen(false)
      resetDiagnosaForm()
      await diagnosa.refetch()
    }
  }

  async function deleteSelectedData() {
    if (mode === 'dokter') {
      if (!selectedDokter) {
        toast.error(t('master.toast.selectDoctorDelete'))
        return
      }
      const confirmed = await confirmThemedAction({
        title: t('master.confirm.deleteDoctor'),
        text: msg('master.confirm.deleteDoctorText', { name: selectedDokter.namaDokter ?? '-' }),
        confirmText: t('master.confirm.delete'),
        danger: true,
      })
      if (!confirmed) return
      const result = await runActionWithFeedback(() => deleteDokterMutation.mutateAsync(selectedDokter.id), t('master.success.doctorDeleted'))
      if (result) {
        setDokterModalOpen(false)
        resetDokterForm()
        await dokter.refetch()
      }
      return
    }

    if (mode === 'jasa') {
      if (!selectedJasa) {
        toast.error(t('master.toast.selectServiceDelete'))
        return
      }
      const confirmed = await confirmThemedAction({
        title: t('master.confirm.deleteService'),
        text: msg('master.confirm.deleteServiceText', { name: selectedJasa.namaJasa ?? '-' }),
        confirmText: t('master.confirm.delete'),
        danger: true,
      })
      if (!confirmed) return
      const result = await runActionWithFeedback(() => deleteJasaMutation.mutateAsync(selectedJasa.id), t('master.success.serviceDeleted'))
      if (result) {
        setJasaModalOpen(false)
        resetJasaForm()
        await jasa.refetch()
      }
      return
    }

    if (!selectedDiagnosa) {
      toast.error(t('master.toast.selectDiagnosisDelete'))
      return
    }
    const confirmed = await confirmThemedAction({
      title: t('master.confirm.deleteDiagnosis'),
      text: msg('master.confirm.deleteDiagnosisText', { name: selectedDiagnosa.namaDiagnosa ?? '-' }),
      confirmText: t('master.confirm.delete'),
      danger: true,
    })
    if (!confirmed) return
    const result = await runActionWithFeedback(() => deleteDiagnosaMutation.mutateAsync(selectedDiagnosa.id), t('master.success.diagnosisDeleted'))
    if (result) {
      setDiagnosaModalOpen(false)
      resetDiagnosaForm()
      await diagnosa.refetch()
    }
  }

  useEffect(() => {
    const next = new URLSearchParams()
    next.set('mode', mode)
    next.set('page', String(page))
    if (search.trim()) next.set('search', search.trim())
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true })
    }
  }, [mode, page, search, searchParams, setSearchParams])

  useEffect(() => {
    if (mode !== 'dokter' && !activeLoading && page > totalPage) {
      const timer = window.setTimeout(() => setPage(totalPage), 0)
      return () => window.clearTimeout(timer)
    }
  }, [mode, activeLoading, page, totalPage])

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

  return (
    <section className="page-card">
      <PageHeader
        title={t('master.title')}
        description={t('nav.master.desc')}
        eyebrow={t('master.eyebrow')}
        actions={mode !== 'pasien' ? <button className="icon-btn btn-primary" onClick={openCreateModal}><Plus size={16} /> {t('master.addNew')}</button> : null}
      />

      <div className="stats-grid">
        <article className="stat-card">
          <small>{t('master.totalData')}</small>
          <strong>{totalItem}</strong>
        </article>
        <article className="stat-card">
          <small>{t('master.activePage')}</small>
          <strong>{mode === 'dokter' ? '1 / 1' : `${page} / ${totalPage}`}</strong>
        </article>
        <article className="stat-card">
          <small>{t('master.activeFilter')}</small>
          <strong>{activeFilterCount}</strong>
        </article>
        <article className="stat-card">
          <small>{t('master.activeTab')}</small>
          <strong>{mode}</strong>
        </article>
      </div>

      <section className="master-management-card">
        <div className="master-tabs">
          <button className={mode === 'dokter' ? 'active' : ''} onClick={() => setMode('dokter')}>{t('master.tab.doctors')}</button>
          <button className={mode === 'pasien' ? 'active' : ''} onClick={() => setMode('pasien')}>{t('master.tab.patients')}</button>
          <button className={mode === 'jasa' ? 'active' : ''} onClick={() => setMode('jasa')}>{t('master.tab.services')}</button>
          <button className={mode === 'diagnosa' ? 'active' : ''} onClick={() => setMode('diagnosa')}>{t('master.tab.diagnosis')}</button>
        </div>

        <div className="master-filter-row">
          <input
            ref={searchInputRef}
            className="search-input search-dominant"
            placeholder={t('master.search')}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
          <span>{msg('master.showingRecords', { shown: ((activeData ?? []) as Record<string, unknown>[]).length, total: totalItem })}</span>
        </div>

        <DataGrid
          storageKey={`master-${mode}`}
          rows={(activeData ?? []) as Record<string, unknown>[]}
          columns={columns}
          loading={activeLoading}
          onRowClicked={onRowClicked}
        />
        {!activeLoading && ((activeData ?? []) as Record<string, unknown>[]).length === 0 ? <p className="empty-note master-empty-note">{t('grid.empty')}</p> : null}

        {mode !== 'pasien' ? (
          <div className="master-action-row">
            <button className="icon-btn btn-primary-soft" title={t('master.action.addTitle')} onClick={openCreateModal}><Plus size={14} /> {t('master.action.add')}</button>
            <button className="icon-btn" title={t('master.action.editTitle')} onClick={openEditModal} disabled={mode === 'dokter' ? !selectedDokter : mode === 'jasa' ? !selectedJasa : !selectedDiagnosa}><Pencil size={14} /> {t('master.action.edit')}</button>
            <button className="icon-btn btn-critical" title={t('master.action.deleteTitle')} onClick={deleteSelectedData} disabled={mode === 'dokter' ? !selectedDokter || deleteDokterMutation.isPending : mode === 'jasa' ? !selectedJasa || deleteJasaMutation.isPending : !selectedDiagnosa || deleteDiagnosaMutation.isPending}><Trash2 size={14} /> {t('master.action.delete')}</button>
          </div>
        ) : null}

        {mode !== 'dokter' ? (
          <div className="pager-row">
            <button className="icon-btn icon-only" title={t('common.previousPage')} aria-label={t('common.previousPage')} disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}><ChevronLeft size={14} /></button>
            <span>{t('common.page')} {page} / {totalPage}</span>
            <button className="icon-btn icon-only" title={t('common.nextPage')} aria-label={t('common.nextPage')} disabled={page >= totalPage} onClick={() => setPage((prev) => prev + 1)}><ChevronRight size={14} /></button>
          </div>
        ) : null}
      </section>

      <FormModal
        open={dokterModalOpen}
        title={selectedDokter ? t('master.modal.editDoctor') : t('master.modal.addDoctor')}
        description={t('master.modal.doctorDesc')}
        icon={Stethoscope}
        size="sm"
        footerNote={t('master.modal.doctorFooter')}
        onClose={() => setDokterModalOpen(false)}
      >
        <div className="form-grid">
          <FieldLabel text={t('master.col.doctorCode')} htmlFor="master-dokter-kode">
            <input id="master-dokter-kode" className="search-input" placeholder={t('master.field.doctorCodePlaceholder')} value={kdDokter} onChange={(event) => setKdDokter(event.target.value)} />
          </FieldLabel>
          <FieldLabel text={t('master.col.doctorName')} htmlFor="master-dokter-nama">
            <input id="master-dokter-nama" className="search-input" placeholder={t('master.field.doctorNamePlaceholder')} value={namaDokter} onChange={(event) => setNamaDokter(event.target.value)} />
          </FieldLabel>
        </div>
        <div className="confirm-actions">
          <button className="btn-muted" disabled={upsertDokterMutation.isPending} onClick={resetDokterForm}>{t('common.reset')}</button>
          <button className="btn-primary" disabled={upsertDokterMutation.isPending} onClick={saveDokter}>
            {upsertDokterMutation.isPending ? t('master.button.saving') : selectedDokter ? t('master.button.updateDoctor') : t('master.button.saveDoctor')}
          </button>
        </div>
      </FormModal>

      <FormModal
        open={jasaModalOpen}
        title={selectedJasa ? t('master.modal.editService') : t('master.modal.addService')}
        description={t('master.modal.serviceDesc')}
        icon={Wrench}
        size="md"
        onClose={() => setJasaModalOpen(false)}
      >
        <div className="form-grid">
          <FieldLabel text="ICD9" htmlFor="master-jasa-icd9">
            <input id="master-jasa-icd9" className="search-input" placeholder={t('master.field.icd9Optional')} value={icd9} onChange={(event) => setIcd9(event.target.value)} />
          </FieldLabel>
          <FieldLabel text={t('master.col.serviceName')} htmlFor="master-jasa-nama">
            <input
              id="master-jasa-nama"
              className="search-input"
              placeholder={t('master.field.serviceNamePlaceholder')}
              value={namaJasa}
              onChange={(event) => setNamaJasa(event.target.value)}
              aria-invalid={Boolean(jasaErrors.namaJasa)}
              aria-describedby={jasaErrors.namaJasa ? 'master-jasa-nama-error' : undefined}
            />
          </FieldLabel>
          <FieldLabel text={t('master.col.price')} htmlFor="master-jasa-harga">
            <input
              id="master-jasa-harga"
              className="search-input"
              type="number"
              min={0}
              placeholder={t('master.field.pricePlaceholder')}
              value={hargaJasa}
              onChange={(event) => setHargaJasa(event.target.value)}
              aria-invalid={Boolean(jasaErrors.harga)}
              aria-describedby={jasaErrors.harga ? 'master-jasa-harga-error' : undefined}
            />
          </FieldLabel>
          <FieldLabel text={t('common.status')} htmlFor="master-jasa-status">
            <select
              id="master-jasa-status"
              className="search-input"
              value={statusJasa}
              onChange={(event) => setStatusJasa(event.target.value)}
              aria-invalid={Boolean(jasaErrors.status)}
              aria-describedby={jasaErrors.status ? 'master-jasa-status-error' : undefined}
            >
              <option value="1">{t('master.status.active')}</option>
              <option value="0">{t('master.status.inactive')}</option>
            </select>
          </FieldLabel>
          <FieldLabel text={t('settings.field.notes')} htmlFor="master-jasa-keterangan">
            <input id="master-jasa-keterangan" className="search-input" placeholder={t('master.field.notesPlaceholder')} value={keteranganJasa} onChange={(event) => setKeteranganJasa(event.target.value)} />
          </FieldLabel>
        </div>
        {jasaErrors.namaJasa ? <p id="master-jasa-nama-error" className="field-error">{jasaErrors.namaJasa}</p> : null}
        {jasaErrors.harga ? <p id="master-jasa-harga-error" className="field-error">{jasaErrors.harga}</p> : null}
        {jasaErrors.status ? <p id="master-jasa-status-error" className="field-error">{jasaErrors.status}</p> : null}
        <FormFeedback errors={[]} helperText={t('master.helper.service')} />
        <div className="confirm-actions">
          <button className="btn-muted" disabled={upsertJasaMutation.isPending} onClick={resetJasaForm}>{t('common.reset')}</button>
          <button className="btn-primary" disabled={upsertJasaMutation.isPending} onClick={saveJasa}>
            {upsertJasaMutation.isPending ? t('master.button.saving') : selectedJasa ? t('master.button.updateService') : t('master.button.saveService')}
          </button>
        </div>
      </FormModal>

      <FormModal
        open={diagnosaModalOpen}
        title={selectedDiagnosa ? t('master.modal.editDiagnosis') : t('master.modal.addDiagnosis')}
        description={t('master.modal.diagnosisDesc')}
        icon={ClipboardList}
        size="md"
        onClose={() => setDiagnosaModalOpen(false)}
      >
        <div className="form-grid">
          <FieldLabel text={t('master.col.diagnosisCode')} htmlFor="master-diagnosa-kode">
            <input
              id="master-diagnosa-kode"
              className="search-input"
              placeholder={t('master.field.diagnosisCodePlaceholder')}
              value={kodeDiagnosa}
              onChange={(event) => setKodeDiagnosa(event.target.value)}
              aria-invalid={Boolean(diagnosaErrors.kodeDiagnosa)}
              aria-describedby={diagnosaErrors.kodeDiagnosa ? 'master-diagnosa-kode-error' : undefined}
            />
          </FieldLabel>
          <FieldLabel text={t('master.col.diagnosisName')} htmlFor="master-diagnosa-nama">
            <input
              id="master-diagnosa-nama"
              className="search-input"
              placeholder={t('master.field.diagnosisNamePlaceholder')}
              value={namaDiagnosa}
              onChange={(event) => setNamaDiagnosa(event.target.value)}
              aria-invalid={Boolean(diagnosaErrors.namaDiagnosa)}
              aria-describedby={diagnosaErrors.namaDiagnosa ? 'master-diagnosa-nama-error' : undefined}
            />
          </FieldLabel>
          <FieldLabel text="Kode SNOMED" htmlFor="master-diagnosa-snomed">
            <input id="master-diagnosa-snomed" className="search-input" placeholder={t('master.field.snomedOptional')} value={kodeSnomed} onChange={(event) => setKodeSnomed(event.target.value)} />
          </FieldLabel>
          <FieldLabel text={t('common.status')} htmlFor="master-diagnosa-status">
            <select
              id="master-diagnosa-status"
              className="search-input"
              value={statusDiagnosa}
              onChange={(event) => setStatusDiagnosa(event.target.value)}
              aria-invalid={Boolean(diagnosaErrors.status)}
              aria-describedby={diagnosaErrors.status ? 'master-diagnosa-status-error' : undefined}
            >
              <option value="1">{t('master.status.active')}</option>
              <option value="0">{t('master.status.inactive')}</option>
            </select>
          </FieldLabel>
        </div>
        {diagnosaErrors.kodeDiagnosa ? <p id="master-diagnosa-kode-error" className="field-error">{diagnosaErrors.kodeDiagnosa}</p> : null}
        {diagnosaErrors.namaDiagnosa ? <p id="master-diagnosa-nama-error" className="field-error">{diagnosaErrors.namaDiagnosa}</p> : null}
        {diagnosaErrors.status ? <p id="master-diagnosa-status-error" className="field-error">{diagnosaErrors.status}</p> : null}
        <FormFeedback errors={[]} helperText={t('master.helper.diagnosis')} />
        <div className="confirm-actions">
          <button className="btn-muted" disabled={upsertDiagnosaMutation.isPending} onClick={resetDiagnosaForm}>{t('common.reset')}</button>
          <button className="btn-primary" disabled={upsertDiagnosaMutation.isPending} onClick={saveDiagnosa}>
            {upsertDiagnosaMutation.isPending ? t('master.button.saving') : selectedDiagnosa ? t('master.button.updateDiagnosis') : t('master.button.saveDiagnosis')}
          </button>
        </div>
      </FormModal>
    </section>
  )
}
