import { useEffect, useMemo, useRef, useState } from 'react'
import type { ColDef, RowClickedEvent } from 'ag-grid-community'
import { useMutation, useQuery } from '@tanstack/react-query'
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, Plus, RefreshCw, RotateCcw, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DataGrid } from '../components/data-grid'
import { FormModal } from '../components/form-modal'
import { usePelayanan } from '../hooks/use-pelayanan'
import {
  createPelayananAlkes,
  createPelayananLaboratorium,
  createPelayananRadiologi,
  createPelayananResep,
  createPelayananTindakan,
  deletePelayananAlkes,
  deletePelayananLaboratorium,
  deletePelayananRadiologi,
  deletePelayananResep,
  deletePelayananTindakan,
  getPelayananAlkes,
  getPelayananDetail,
  getPelayananLaboratorium,
  getPelayananRadiologi,
  getPelayananResep,
  getPelayananTindakan,
  type PelayananItem,
} from '../api/pelayanan'
import { runActionWithFeedback } from '../lib/action-feedback'
import { FormFeedback } from '../components/form-feedback'
import { useDebouncedValue } from '../hooks/use-debounced-value'
import { useMasterJasa } from '../hooks/use-master'
import { getStatusMeta } from '../lib/status-meta'
import { canManagePelayananDetails, getActionAccess } from '../lib/access'
import { ActionAuditNote } from '../components/action-audit-note'
import { useActionAudit } from '../hooks/use-action-audit'
import { confirmThemedAction } from '../lib/sweet-alert'
import { getAuthUser } from '../lib/storage'
import { StrictMasterComboboxField } from '../components/strict-master-combobox-field'
import { FieldLabel } from '../components/field-label'

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

function getNumberHint(value: string, minimum: number) {
  if (!value.trim()) return { tone: 'var(--text-muted)', text: '[i] Isi nilai.' }
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return { tone: 'var(--danger-text)', text: '[!] Angka tidak valid.' }
  if (parsed < minimum) return { tone: 'var(--danger-text)', text: `[!] Nilai minimal ${minimum}.` }
  return { tone: 'var(--success-text)', text: '[OK] Nilai valid.' }
}

export function PelayananPage({ canFetch }: { canFetch: boolean }) {
  const navigate = useNavigate()
  const canManageDetail = canManagePelayananDetails()
  const detailAccess = getActionAccess('pelayananDetailsManage')
  const [searchParams, setSearchParams] = useSearchParams()
  const initialPage = Math.max(1, Number(searchParams.get('page') || '1') || 1)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const debouncedSearch = useDebouncedValue(search)
  const [page, setPage] = useState(initialPage)
  const [selected, setSelected] = useState<PelayananItem | null>(null)
  const [detailCreateModalOpen, setDetailCreateModalOpen] = useState(false)
  const [detailTab, setDetailTab] = useState<'tindakan' | 'resep' | 'alkes' | 'laboratorium' | 'radiologi'>('tindakan')
  const [tindakanForm, setTindakanForm] = useState({ nama: '', qty: '1', harga: '0' })
  const [resepForm, setResepForm] = useState({ namaObat: '', dosis: '', qty: '1' })
  const [alkesForm, setAlkesForm] = useState({ nama: '', qty: '1' })
  const [laboratoriumForm, setLaboratoriumForm] = useState({ nama: '', qty: '1' })
  const [radiologiForm, setRadiologiForm] = useState({ nama: '', qty: '1' })
  const [detailError, setDetailError] = useState<string | null>(null)
  const { lastAction, history, logAction, clearHistory, exportText, exportCsv, metrics } = useActionAudit('pelayanan')

  const query = usePelayanan({ page, pageSize: 20, search: debouncedSearch || undefined }, canFetch)
  const jasaRef = useMasterJasa(1, 100, '', canFetch)
  const data = query.data?.data
  const activeLoading = query.isLoading || query.isFetching
  const filteredItems = useMemo(() => {
    const rows = data?.items ?? []
    if (!statusFilter) return rows
    return rows.filter((item) => String(item.status ?? '') === statusFilter)
  }, [data?.items, statusFilter])
  const totalPage = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.pageSize ?? 20)))
  const activeFilterCount = (search.trim() ? 1 : 0) + (statusFilter ? 1 : 0)

  const detail = useQuery({
    queryKey: ['pelayanan-detail', selected?.idRegistrasi],
    queryFn: () => getPelayananDetail(selected!.idRegistrasi),
    enabled: canFetch && Boolean(selected?.idRegistrasi),
  })

  const tindakan = useQuery({
    queryKey: ['pelayanan-tindakan', selected?.idRegistrasi],
    queryFn: () => getPelayananTindakan(selected!.idRegistrasi),
    enabled: canFetch && Boolean(selected?.idRegistrasi),
  })

  const resep = useQuery({
    queryKey: ['pelayanan-resep', selected?.idRegistrasi],
    queryFn: () => getPelayananResep(selected!.idRegistrasi),
    enabled: canFetch && Boolean(selected?.idRegistrasi),
  })

  const alkes = useQuery({
    queryKey: ['pelayanan-alkes', selected?.idRegistrasi],
    queryFn: () => getPelayananAlkes(selected!.idRegistrasi),
    enabled: canFetch && Boolean(selected?.idRegistrasi),
  })

  const laboratorium = useQuery({
    queryKey: ['pelayanan-lab', selected?.idRegistrasi],
    queryFn: () => getPelayananLaboratorium(selected!.idRegistrasi),
    enabled: canFetch && Boolean(selected?.idRegistrasi),
  })

  const radiologi = useQuery({
    queryKey: ['pelayanan-rad', selected?.idRegistrasi],
    queryFn: () => getPelayananRadiologi(selected!.idRegistrasi),
    enabled: canFetch && Boolean(selected?.idRegistrasi),
  })

  const createTindakanMutation = useMutation({
    mutationFn: ({ idRegistrasi, payload }: { idRegistrasi: string; payload: Record<string, unknown> }) => createPelayananTindakan(idRegistrasi, payload),
  })

  const deleteTindakanMutation = useMutation({
    mutationFn: ({ idRegistrasi, detailId }: { idRegistrasi: string; detailId: number }) => deletePelayananTindakan(idRegistrasi, detailId),
  })

  const createResepMutation = useMutation({
    mutationFn: ({ idRegistrasi, payload }: { idRegistrasi: string; payload: Record<string, unknown> }) => createPelayananResep(idRegistrasi, payload),
  })

  const deleteResepMutation = useMutation({
    mutationFn: ({ idRegistrasi, detailId }: { idRegistrasi: string; detailId: number }) => deletePelayananResep(idRegistrasi, detailId),
  })

  const createAlkesMutation = useMutation({
    mutationFn: ({ idRegistrasi, payload }: { idRegistrasi: string; payload: Record<string, unknown> }) => createPelayananAlkes(idRegistrasi, payload),
  })
  const deleteAlkesMutation = useMutation({
    mutationFn: ({ idRegistrasi, detailId }: { idRegistrasi: string; detailId: number }) => deletePelayananAlkes(idRegistrasi, detailId),
  })

  const createLaboratoriumMutation = useMutation({
    mutationFn: ({ idRegistrasi, payload }: { idRegistrasi: string; payload: Record<string, unknown> }) => createPelayananLaboratorium(idRegistrasi, payload),
  })
  const deleteLaboratoriumMutation = useMutation({
    mutationFn: ({ idRegistrasi, detailId }: { idRegistrasi: string; detailId: number }) => deletePelayananLaboratorium(idRegistrasi, detailId),
  })

  const createRadiologiMutation = useMutation({
    mutationFn: ({ idRegistrasi, payload }: { idRegistrasi: string; payload: Record<string, unknown> }) => createPelayananRadiologi(idRegistrasi, payload),
  })
  const deleteRadiologiMutation = useMutation({
    mutationFn: ({ idRegistrasi, detailId }: { idRegistrasi: string; detailId: number }) => deletePelayananRadiologi(idRegistrasi, detailId),
  })

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
      setPage(totalPage)
    }
  }, [activeLoading, page, totalPage])

  async function submitDetailCreate() {
    if (!selected || !canManageDetail) return
    if (detailTab === 'tindakan') {
      if (!tindakanForm.nama.trim()) {
        setDetailError('Nama tindakan wajib diisi.')
        return
      }
      const jasaValid = (jasaRef.data?.data.items ?? []).some((item) => String(item.namaJasa ?? '').trim() === tindakanForm.nama.trim())
      if (!jasaValid) {
        setDetailError('Nama tindakan harus dipilih dari master jasa.')
        return
      }
      const confirmed = await confirmThemedAction({ title: 'Konfirmasi tambah tindakan', text: `Tambah tindakan untuk ${selected.idRegistrasi}?`, confirmText: 'Ya, Simpan' })
      if (!confirmed) return
      const result = await runActionWithFeedback(() => createTindakanMutation.mutateAsync({ idRegistrasi: selected.idRegistrasi, payload: { nama: tindakanForm.nama.trim(), qty: Number(tindakanForm.qty || 1), harga: Number(tindakanForm.harga || 0) } }), 'Tindakan berhasil ditambahkan.')
      if (result) {
        setTindakanForm({ nama: '', qty: '1', harga: '0' })
        setDetailCreateModalOpen(false)
        await tindakan.refetch()
      }
      return
    }
    if (detailTab === 'resep') {
      if (!resepForm.namaObat.trim()) {
        setDetailError('Nama obat wajib diisi.')
        return
      }
      const confirmed = await confirmThemedAction({ title: 'Konfirmasi tambah resep', text: `Tambah resep untuk ${selected.idRegistrasi}?`, confirmText: 'Ya, Simpan' })
      if (!confirmed) return
      const result = await runActionWithFeedback(() => createResepMutation.mutateAsync({ idRegistrasi: selected.idRegistrasi, payload: { namaObat: resepForm.namaObat.trim(), dosis: resepForm.dosis.trim() || '-', qty: Number(resepForm.qty || 1) } }), 'Resep berhasil ditambahkan.')
      if (result) {
        setResepForm({ namaObat: '', dosis: '', qty: '1' })
        setDetailCreateModalOpen(false)
        await resep.refetch()
      }
      return
    }
    if (detailTab === 'alkes') {
      if (!alkesForm.nama.trim()) {
        setDetailError('Nama alkes wajib diisi.')
        return
      }
      const confirmed = await confirmThemedAction({ title: 'Konfirmasi tambah alkes', text: `Tambah alkes untuk ${selected.idRegistrasi}?`, confirmText: 'Ya, Simpan' })
      if (!confirmed) return
      const result = await runActionWithFeedback(() => createAlkesMutation.mutateAsync({ idRegistrasi: selected.idRegistrasi, payload: { nama: alkesForm.nama.trim(), qty: Number(alkesForm.qty || 1) } }), 'Alkes berhasil ditambahkan.')
      if (result) {
        setAlkesForm({ nama: '', qty: '1' })
        setDetailCreateModalOpen(false)
        await alkes.refetch()
      }
      return
    }
    if (detailTab === 'laboratorium') {
      if (!laboratoriumForm.nama.trim()) {
        setDetailError('Nama pemeriksaan wajib diisi.')
        return
      }
      const confirmed = await confirmThemedAction({ title: 'Konfirmasi tambah laboratorium', text: `Tambah laboratorium untuk ${selected.idRegistrasi}?`, confirmText: 'Ya, Simpan' })
      if (!confirmed) return
      const result = await runActionWithFeedback(() => createLaboratoriumMutation.mutateAsync({ idRegistrasi: selected.idRegistrasi, payload: { nama: laboratoriumForm.nama.trim(), qty: Number(laboratoriumForm.qty || 1) } }), 'Laboratorium berhasil ditambahkan.')
      if (result) {
        setLaboratoriumForm({ nama: '', qty: '1' })
        setDetailCreateModalOpen(false)
        await laboratorium.refetch()
      }
      return
    }
    if (!radiologiForm.nama.trim()) {
      setDetailError('Nama radiologi wajib diisi.')
      return
    }
    const confirmed = await confirmThemedAction({ title: 'Konfirmasi tambah radiologi', text: `Tambah radiologi untuk ${selected.idRegistrasi}?`, confirmText: 'Ya, Simpan' })
    if (!confirmed) return
    const result = await runActionWithFeedback(() => createRadiologiMutation.mutateAsync({ idRegistrasi: selected.idRegistrasi, payload: { nama: radiologiForm.nama.trim(), qty: Number(radiologiForm.qty || 1) } }), 'Radiologi berhasil ditambahkan.')
    if (result) {
      setRadiologiForm({ nama: '', qty: '1' })
      setDetailCreateModalOpen(false)
      await radiologi.refetch()
    }
  }

  async function deleteDetailItem(kind: 'tindakan' | 'resep' | 'alkes' | 'laboratorium' | 'radiologi', detailId: number) {
    if (!selected) return
    const label = kind === 'tindakan' ? 'tindakan' : kind === 'resep' ? 'resep' : kind === 'alkes' ? 'alkes' : kind === 'laboratorium' ? 'laboratorium' : 'radiologi'
    const confirmed = await confirmThemedAction({
      title: `Konfirmasi hapus ${label}`,
      text: `Hapus ${label} #${detailId} dari ${selected.idRegistrasi}?`,
      confirmText: 'Ya, Hapus',
      danger: true,
    })
    if (!confirmed) return

    if (kind === 'tindakan') {
      const result = await runActionWithFeedback(() => deleteTindakanMutation.mutateAsync({ idRegistrasi: selected.idRegistrasi, detailId }), 'Tindakan berhasil dihapus.')
      if (result) {
        await tindakan.refetch()
        logAction(`Tindakan dihapus dari ${selected.idRegistrasi} (${new Date().toLocaleString('id-ID')}).`)
      }
      return
    }
    if (kind === 'resep') {
      const result = await runActionWithFeedback(() => deleteResepMutation.mutateAsync({ idRegistrasi: selected.idRegistrasi, detailId }), 'Resep berhasil dihapus.')
      if (result) {
        await resep.refetch()
        logAction(`Resep dihapus dari ${selected.idRegistrasi} (${new Date().toLocaleString('id-ID')}).`)
      }
      return
    }
    if (kind === 'alkes') {
      const result = await runActionWithFeedback(() => deleteAlkesMutation.mutateAsync({ idRegistrasi: selected.idRegistrasi, detailId }), 'Alkes berhasil dihapus.')
      if (result) {
        await alkes.refetch()
        logAction(`Alkes dihapus dari ${selected.idRegistrasi} (${new Date().toLocaleString('id-ID')}).`)
      }
      return
    }
    if (kind === 'laboratorium') {
      const result = await runActionWithFeedback(() => deleteLaboratoriumMutation.mutateAsync({ idRegistrasi: selected.idRegistrasi, detailId }), 'Laboratorium berhasil dihapus.')
      if (result) {
        await laboratorium.refetch()
        logAction(`Laboratorium dihapus dari ${selected.idRegistrasi} (${new Date().toLocaleString('id-ID')}).`)
      }
      return
    }
    const result = await runActionWithFeedback(() => deleteRadiologiMutation.mutateAsync({ idRegistrasi: selected.idRegistrasi, detailId }), 'Radiologi berhasil dihapus.')
    if (result) {
      await radiologi.refetch()
      logAction(`Radiologi dihapus dari ${selected.idRegistrasi} (${new Date().toLocaleString('id-ID')}).`)
    }
  }

  const columns = useMemo<ColDef<PelayananItem>[]>(
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
        cellRenderer: (params: { value?: string; data?: PelayananItem }) => (
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
        cellRenderer: (params: { value?: string; data?: PelayananItem }) => (
          <div>
            <div className="cell-primary">{getPatientDisplayName(params.data as unknown as Record<string, unknown>)}</div>
            <div className="cell-subline">{String(params.value ?? '-').trim() || '-'}</div>
          </div>
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
        cellRenderer: (params: { data?: PelayananItem }) => {
          const row = params.data
          if (!row) return null
          return (
            <div className="top-actions row-actions">
              <button className="icon-btn row-action-single" title="Buka di Kasir" aria-label="Buka di Kasir" onClick={() => navigate(`/kasir?search=${encodeURIComponent(row.idRegistrasi ?? '')}`)}><ExternalLink size={14} /><span className="action-label-desktop">Ke Kasir</span></button>
            </div>
          )
        },
      },
    ],
    [navigate],
  )

  const tindakanColumns = useMemo<ColDef<Record<string, unknown>>[]>(() => [
    { field: 'nama', headerName: 'Nama', minWidth: 220 },
    { field: 'qty', headerName: 'Qty', minWidth: 90 },
    { field: 'harga', headerName: 'Harga', minWidth: 130 },
    { colId: 'aksi', headerName: 'Aksi', minWidth: 90, sortable: false, filter: false, cellRenderer: (params: { data?: Record<string, unknown> }) => <button className="icon-btn icon-only btn-critical" disabled={!canManageDetail} title={!canManageDetail ? detailAccess.reason : undefined} onClick={() => deleteDetailItem('tindakan', Number(params.data?.detailId ?? 0))}><Trash2 size={14} /></button> },
  ], [canManageDetail, detailAccess.reason])

  const resepColumns = useMemo<ColDef<Record<string, unknown>>[]>(() => [
    { field: 'namaObat', headerName: 'Nama Obat', minWidth: 220 },
    { field: 'dosis', headerName: 'Dosis', minWidth: 170 },
    { field: 'qty', headerName: 'Qty', minWidth: 90 },
    { colId: 'aksi', headerName: 'Aksi', minWidth: 90, sortable: false, filter: false, cellRenderer: (params: { data?: Record<string, unknown> }) => <button className="icon-btn icon-only btn-critical" disabled={!canManageDetail} title={!canManageDetail ? detailAccess.reason : undefined} onClick={() => deleteDetailItem('resep', Number(params.data?.detailId ?? 0))}><Trash2 size={14} /></button> },
  ], [canManageDetail, detailAccess.reason])

  const alkesColumns = useMemo<ColDef<Record<string, unknown>>[]>(() => [
    { field: 'nama', headerName: 'Nama', minWidth: 240 },
    { field: 'qty', headerName: 'Qty', minWidth: 90 },
    { colId: 'aksi', headerName: 'Aksi', minWidth: 90, sortable: false, filter: false, cellRenderer: (params: { data?: Record<string, unknown> }) => <button className="icon-btn icon-only btn-critical" disabled={!canManageDetail} title={!canManageDetail ? detailAccess.reason : undefined} onClick={() => deleteDetailItem('alkes', Number(params.data?.detailId ?? 0))}><Trash2 size={14} /></button> },
  ], [canManageDetail, detailAccess.reason])

  const laboratoriumColumns = useMemo<ColDef<Record<string, unknown>>[]>(() => [
    { field: 'nama', headerName: 'Nama Pemeriksaan', minWidth: 260 },
    { field: 'qty', headerName: 'Qty', minWidth: 90 },
    { colId: 'aksi', headerName: 'Aksi', minWidth: 90, sortable: false, filter: false, cellRenderer: (params: { data?: Record<string, unknown> }) => <button className="icon-btn icon-only btn-critical" disabled={!canManageDetail} title={!canManageDetail ? detailAccess.reason : undefined} onClick={() => deleteDetailItem('laboratorium', Number(params.data?.detailId ?? 0))}><Trash2 size={14} /></button> },
  ], [canManageDetail, detailAccess.reason])

  const radiologiColumns = useMemo<ColDef<Record<string, unknown>>[]>(() => [
    { field: 'nama', headerName: 'Nama Radiologi', minWidth: 260 },
    { field: 'qty', headerName: 'Qty', minWidth: 90 },
    { colId: 'aksi', headerName: 'Aksi', minWidth: 90, sortable: false, filter: false, cellRenderer: (params: { data?: Record<string, unknown> }) => <button className="icon-btn icon-only btn-critical" disabled={!canManageDetail} title={!canManageDetail ? detailAccess.reason : undefined} onClick={() => deleteDetailItem('radiologi', Number(params.data?.detailId ?? 0))}><Trash2 size={14} /></button> },
  ], [canManageDetail, detailAccess.reason])

  const onRowClicked = (event: RowClickedEvent<PelayananItem>) => {
    setSelected(event.data ?? null)
  }

  const detailData = (detail.data?.data ?? {}) as Record<string, unknown>
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
  const tindakanMasterOptions = (jasaRef.data?.data.items ?? [])
    .filter((item) => String(item.status ?? 1) === '1')
    .map((item) => ({ value: String(item.namaJasa ?? '').trim(), label: item.icd9 ? `${item.icd9} • ${String(item.harga ?? 0)}` : `Harga: ${String(item.harga ?? 0)}` }))
    .filter((item) => item.value)
  const isTindakanFromMaster = tindakanMasterOptions.some((item) => item.value === tindakanForm.nama.trim())
  const selectedMasterTindakan = (jasaRef.data?.data.items ?? []).find((item) => String(item.namaJasa ?? '').trim() === tindakanForm.nama.trim())
  const detailMasterStatus: Record<typeof detailTab, { linked: boolean; label: string }> = {
    tindakan: { linked: true, label: 'Terhubung Master Jasa' },
    resep: { linked: false, label: 'Belum terhubung master obat' },
    alkes: { linked: false, label: 'Belum terhubung master alkes' },
    laboratorium: { linked: false, label: 'Belum terhubung master laboratorium' },
    radiologi: { linked: false, label: 'Belum terhubung master radiologi' },
  }
  const tindakanQtyHint = getNumberHint(tindakanForm.qty, 1)
  const tindakanHargaHint = getNumberHint(tindakanForm.harga, 0)
  const resepQtyHint = getNumberHint(resepForm.qty, 1)
  const alkesQtyHint = getNumberHint(alkesForm.qty, 1)
  const laboratoriumQtyHint = getNumberHint(laboratoriumForm.qty, 1)
  const radiologiQtyHint = getNumberHint(radiologiForm.qty, 1)
  const detailTabConfig: Record<typeof detailTab, { title: string; description: string; rows: Record<string, unknown>[]; columns: ColDef<Record<string, unknown>>[]; loading: boolean; height: number; adding: boolean }> = {
    tindakan: {
      title: 'Tindakan',
      description: 'Terhubung ke master jasa. Tambah tindakan melalui modal terpusat.',
      rows: (tindakan.data?.data ?? []) as Record<string, unknown>[],
      columns: tindakanColumns,
      loading: tindakan.isLoading || tindakan.isFetching,
      height: 300,
      adding: createTindakanMutation.isPending,
    },
    resep: {
      title: 'Resep',
      description: 'Input resep dilakukan lewat modal agar alur tetap konsisten.',
      rows: (resep.data?.data ?? []) as Record<string, unknown>[],
      columns: resepColumns,
      loading: resep.isLoading || resep.isFetching,
      height: 300,
      adding: createResepMutation.isPending,
    },
    alkes: {
      title: 'Alkes',
      description: 'Input alkes dilakukan lewat modal agar tampilan tetap rapi.',
      rows: (alkes.data?.data ?? []) as Record<string, unknown>[],
      columns: alkesColumns,
      loading: alkes.isLoading || alkes.isFetching,
      height: 280,
      adding: createAlkesMutation.isPending,
    },
    laboratorium: {
      title: 'Laboratorium',
      description: 'Tambah pemeriksaan laboratorium melalui modal untuk fokus data.',
      rows: (laboratorium.data?.data ?? []) as Record<string, unknown>[],
      columns: laboratoriumColumns,
      loading: laboratorium.isLoading || laboratorium.isFetching,
      height: 280,
      adding: createLaboratoriumMutation.isPending,
    },
    radiologi: {
      title: 'Radiologi',
      description: 'Tambah pemeriksaan radiologi melalui modal untuk konsistensi alur.',
      rows: (radiologi.data?.data ?? []) as Record<string, unknown>[],
      columns: radiologiColumns,
      loading: radiologi.isLoading || radiologi.isFetching,
      height: 280,
      adding: createRadiologiMutation.isPending,
    },
  }

  return (
    <section className="page-card">
      <h1>Pelayanan</h1>
      <p>Antrian pelayanan pasien berbasis API real-time.</p>
      <div className="header-insight">
        <span className="header-insight-item">Prioritas: pasien menunggu dengan keluhan aktif</span>
        <span className="header-insight-item">Detail tindakan/resep dapat ditambah per registrasi</span>
        <span className="header-insight-item">Shortcut pencarian: tekan '/'</span>
      </div>
      {!canManageDetail ? <p><span className="readonly-badge">Mode Read-only</span></p> : null}

      <div className="toolbar-row toolbar-primary">
        <input
          ref={searchInputRef}
          className="search-input search-dominant"
          placeholder="Cari registrasi, pasien, dokter..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
        {query.isFetching ? <span className="kbd-hint">Memuat data...</span> : null}
      </div>
      <div className="filter-chip-wrap">
        <button className={`filter-chip ${statusFilter === '1' ? 'active' : ''}`} onClick={() => { setStatusFilter('1'); setPage(1) }}>Menunggu</button>
        <button className={`filter-chip ${statusFilter === '2' ? 'active' : ''}`} onClick={() => { setStatusFilter('2'); setPage(1) }}>Dilayani</button>
        <button className={`filter-chip ${statusFilter === '3' ? 'active' : ''}`} onClick={() => { setStatusFilter('3'); setPage(1) }}>Selesai</button>
        <button className={`filter-chip ${statusFilter === '4' ? 'active' : ''}`} onClick={() => { setStatusFilter('4'); setPage(1) }}>Dibatalkan</button>
        <button className={`filter-chip ${statusFilter === '' ? 'active' : ''}`} onClick={() => { setStatusFilter(''); setPage(1) }}>Semua</button>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <small>Total Pelayanan</small>
          <strong>{statusFilter ? filteredItems.length : data?.total ?? 0}</strong>
        </article>
        <article className="stat-card">
          <small>Baris Terpilih</small>
          <strong>{selected?.idRegistrasi ?? '-'}</strong>
        </article>
      </div>
      {activeLoading ? (
        <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
          <div className="skeleton-block" />
          <div className="skeleton-block" />
          <div className="skeleton-block" />
        </div>
      ) : null}

      <DataGrid
        storageKey="pelayanan-main"
        rows={filteredItems}
        columns={columns}
        loading={activeLoading}
        selectedRowId={selected?.idRegistrasi ?? null}
        selectedRowField="idRegistrasi"
        onRowClicked={onRowClicked}
      />
      {!activeLoading && filteredItems.length === 0 ? (
        <div className="empty-state">
          <p className="empty-note">Belum ada data pelayanan untuk filter saat ini.</p>
          {activeFilterCount > 0 ? <button className="icon-btn icon-only" title="Reset filter" aria-label="Reset filter" onClick={() => { setSearch(''); setStatusFilter(''); setPage(1) }}><RotateCcw size={14} /></button> : null}
        </div>
      ) : null}

      <div className="top-actions" style={{ marginTop: 10 }}>
        <button className="icon-btn icon-only" onClick={() => { const today = new Date().toISOString().slice(0, 10); setSearch(today); setPage(1) }} title="Preset hari ini" aria-label="Preset hari ini"><CalendarDays size={14} /></button>
        <button className="icon-btn icon-only" onClick={async () => { await query.refetch(); toast.success('Data pelayanan diperbarui.') }} title="Refresh data" aria-label="Refresh data"><RefreshCw size={14} /></button>
      </div>

      <div className="pager-row">
        <button className="icon-btn icon-only" title="Halaman sebelumnya" aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
          <ChevronLeft size={14} />
        </button>
        <span>
          Halaman {page} / {totalPage}
        </span>
        <button className="icon-btn icon-only" title="Halaman berikutnya" aria-label="Halaman berikutnya" disabled={page >= totalPage} onClick={() => setPage((prev) => prev + 1)}>
          <ChevronRight size={14} />
        </button>
      </div>

      <ActionAuditNote
        message={lastAction}
        history={history}
        metrics={metrics}
        compact
        allowAdminTools={showSystemInfo}
        onClear={clearHistory}
        onCopy={async () => {
          await navigator.clipboard.writeText(exportText())
          toast.success('Riwayat pelayanan disalin.')
        }}
        onDownload={() => {
          const blob = new Blob([exportText()], { type: 'text/plain;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `audit-pelayanan-${Date.now()}.txt`
          a.click()
          URL.revokeObjectURL(url)
        }}
        onDownloadCsv={() => {
          const blob = new Blob([exportCsv()], { type: 'text/csv;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `audit-pelayanan-${Date.now()}.csv`
          a.click()
          URL.revokeObjectURL(url)
        }}
      />

      <section className={`preview-box detail-soft ${selected ? 'glass-focus' : 'glass-strong'}`}>
        <h2>Detail Pelayanan</h2>
        {selected ? <div className="selected-strip"><p>Dipilih: <strong>{selected.idRegistrasi}</strong> - {getPatientDisplayName(detailSource)}</p><div className="selected-strip-meta"><span className="detail-badge">{selected.idRegistrasi}</span><span className={`status-pill selected-status-pill ${detailStatus.className}`}>{detailStatus.label}</span></div></div> : null}
        {!selected ? (
          <p>Pilih baris pelayanan untuk melihat detail tindakan dan resep.</p>
        ) : (
          <>
            {detail.isLoading ? (
              <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
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

            <div className="toolbar-row" style={{ marginTop: 12 }}>
              <div className="tab-switch">
                <button className={`tab-btn ${detailTab === 'tindakan' ? 'active' : ''}`} onClick={() => setDetailTab('tindakan')}>Tindakan</button>
                <button className={`tab-btn ${detailTab === 'resep' ? 'active' : ''}`} onClick={() => setDetailTab('resep')}>Resep *</button>
                <button className={`tab-btn ${detailTab === 'alkes' ? 'active' : ''}`} onClick={() => setDetailTab('alkes')}>Alkes *</button>
                <button className={`tab-btn ${detailTab === 'laboratorium' ? 'active' : ''}`} onClick={() => setDetailTab('laboratorium')}>Laboratorium *</button>
                <button className={`tab-btn ${detailTab === 'radiologi' ? 'active' : ''}`} onClick={() => setDetailTab('radiologi')}>Radiologi *</button>
              </div>
              <button className="icon-btn icon-only btn-primary-soft" disabled={!canManageDetail || !selected} title={!canManageDetail ? detailAccess.reason : `Tambah ${detailTab}`} aria-label={`Tambah ${detailTab}`} onClick={() => setDetailCreateModalOpen(true)}><Plus size={14} /></button>
            </div>

            <div className="detail-tab-panel">
              <div className="detail-tab-head">
                <div>
                  <strong>{detailTabConfig[detailTab].title} <span className={`detail-badge ${detailMasterStatus[detailTab].linked ? 'detail-badge-master' : 'detail-badge-manual'}`}>{detailMasterStatus[detailTab].linked ? 'Master linked' : 'Manual entry'}</span></strong>
                  <p>{detailTabConfig[detailTab].description}</p>
                </div>
                <button
                  className="icon-btn btn-primary-soft"
                  disabled={detailTabConfig[detailTab].adding || !canManageDetail || !selected}
                  title={!canManageDetail ? detailAccess.reason : `Tambah ${detailTabConfig[detailTab].title}`}
                  onClick={() => setDetailCreateModalOpen(true)}
                >
                  <Plus size={14} />
                  <span>Tambah {detailTabConfig[detailTab].title}</span>
                </button>
              </div>
              <FormFeedback errors={[detailError]} />
              {!detailTabConfig[detailTab].loading && detailTabConfig[detailTab].rows.length === 0 ? (
                <div className="empty-state" style={{ marginBottom: 10 }}>
                  <p className="empty-note">Belum ada data {detailTabConfig[detailTab].title.toLowerCase()} untuk registrasi ini. Gunakan tombol tambah untuk membuat entri baru.</p>
                </div>
              ) : null}
              <DataGrid rows={detailTabConfig[detailTab].rows} columns={detailTabConfig[detailTab].columns} loading={detailTabConfig[detailTab].loading} height={detailTabConfig[detailTab].height} hideUtilityActions compact storageKey={`pelayanan-${detailTab}-detail`} />
            </div>
          </>
        )}
      </section>

      <FormModal
        open={detailCreateModalOpen}
        title={`Tambah ${detailTab}`}
        description={detailMasterStatus[detailTab].linked ? 'Lengkapi form sesuai tab aktif, lalu konfirmasi untuk menyimpan.' : 'Tab ini belum terhubung ke master, input masih manual sementara.'}
        onClose={() => setDetailCreateModalOpen(false)}
      >
        <p className={`field-helper ${detailMasterStatus[detailTab].linked ? '' : 'readonly-badge'}`} style={{ marginTop: 6 }}>{detailMasterStatus[detailTab].label}</p>
        {detailTab === 'tindakan' ? (
          <>
            <div className="form-grid" style={{ marginTop: 12 }}>
              <FieldLabel text="Nama Tindakan (Master Jasa)" htmlFor="pelayanan-modal-tindakan-nama">
                <StrictMasterComboboxField
                  inputId="pelayanan-modal-tindakan-nama"
                  value={tindakanForm.nama}
                  onChange={(next) => {
                    const selectedJasa = (jasaRef.data?.data.items ?? []).find((item) => String(item.namaJasa ?? '').trim() === next)
                    setTindakanForm((p) => ({
                      ...p,
                      nama: next,
                      harga: selectedJasa?.harga != null ? String(selectedJasa.harga) : p.harga,
                    }))
                    setDetailError(null)
                  }}
                  placeholder="Cari atau pilih tindakan"
                  options={tindakanMasterOptions}
                  loading={jasaRef.isLoading || jasaRef.isFetching}
                  recentKey="pelayanan-modal-tindakan-master-jasa"
                  errorMessage="Nama tindakan harus dipilih dari master jasa."
                  onStrictError={setDetailError}
                />
              </FieldLabel>
              <FieldLabel text="Qty" htmlFor="pelayanan-modal-tindakan-qty">
                <input id="pelayanan-modal-tindakan-qty" className="search-input" type="number" min={1} placeholder="Jumlah tindakan" value={tindakanForm.qty} onChange={(e) => setTindakanForm((p) => ({ ...p, qty: e.target.value }))} />
              </FieldLabel>
              <FieldLabel text="Harga" htmlFor="pelayanan-modal-tindakan-harga">
                <input id="pelayanan-modal-tindakan-harga" className="search-input" type="number" min={0} placeholder="Otomatis dari master" value={tindakanForm.harga} readOnly aria-readonly="true" />
              </FieldLabel>
            </div>
            <p className="field-helper" style={{ marginTop: 8 }}>Harga mengikuti master jasa terpilih{selectedMasterTindakan?.icd9 ? ` (ICD9 ${selectedMasterTindakan.icd9})` : ''}.</p>
            <p className="field-helper" style={{ marginTop: 4, color: tindakanQtyHint.tone }}>{tindakanQtyHint.text}</p>
            <p className="field-helper" style={{ marginTop: 4, color: tindakanHargaHint.tone }}>{tindakanHargaHint.text}</p>
          </>
        ) : detailTab === 'resep' ? (
          <>
            <div className="form-grid" style={{ marginTop: 12 }}>
              <FieldLabel text="Nama Obat" htmlFor="pelayanan-modal-resep-nama-obat">
                <input id="pelayanan-modal-resep-nama-obat" className="search-input" placeholder="Nama obat" value={resepForm.namaObat} onChange={(e) => setResepForm((p) => ({ ...p, namaObat: e.target.value }))} />
              </FieldLabel>
              <FieldLabel text="Dosis" htmlFor="pelayanan-modal-resep-dosis">
                <input id="pelayanan-modal-resep-dosis" className="search-input" placeholder="Aturan pakai" value={resepForm.dosis} onChange={(e) => setResepForm((p) => ({ ...p, dosis: e.target.value }))} />
              </FieldLabel>
              <FieldLabel text="Qty" htmlFor="pelayanan-modal-resep-qty">
                <input id="pelayanan-modal-resep-qty" className="search-input" type="number" min={1} placeholder="Jumlah obat" value={resepForm.qty} onChange={(e) => setResepForm((p) => ({ ...p, qty: e.target.value }))} />
              </FieldLabel>
            </div>
            <p className="field-helper" style={{ marginTop: 8, color: resepQtyHint.tone }}>{resepQtyHint.text}</p>
          </>
        ) : detailTab === 'alkes' ? (
          <>
            <div className="form-grid" style={{ marginTop: 12 }}>
              <FieldLabel text="Nama Alkes" htmlFor="pelayanan-modal-alkes-nama">
                <input id="pelayanan-modal-alkes-nama" className="search-input" placeholder="Nama alat kesehatan" value={alkesForm.nama} onChange={(e) => setAlkesForm((p) => ({ ...p, nama: e.target.value }))} />
              </FieldLabel>
              <FieldLabel text="Qty" htmlFor="pelayanan-modal-alkes-qty">
                <input id="pelayanan-modal-alkes-qty" className="search-input" type="number" min={1} placeholder="Jumlah alkes" value={alkesForm.qty} onChange={(e) => setAlkesForm((p) => ({ ...p, qty: e.target.value }))} />
              </FieldLabel>
            </div>
            <p className="field-helper" style={{ marginTop: 8, color: alkesQtyHint.tone }}>{alkesQtyHint.text}</p>
          </>
        ) : detailTab === 'laboratorium' ? (
          <>
            <div className="form-grid" style={{ marginTop: 12 }}>
              <FieldLabel text="Nama Pemeriksaan" htmlFor="pelayanan-modal-lab-nama">
                <input id="pelayanan-modal-lab-nama" className="search-input" placeholder="Nama pemeriksaan laboratorium" value={laboratoriumForm.nama} onChange={(e) => setLaboratoriumForm((p) => ({ ...p, nama: e.target.value }))} />
              </FieldLabel>
              <FieldLabel text="Qty" htmlFor="pelayanan-modal-lab-qty">
                <input id="pelayanan-modal-lab-qty" className="search-input" type="number" min={1} placeholder="Jumlah pemeriksaan" value={laboratoriumForm.qty} onChange={(e) => setLaboratoriumForm((p) => ({ ...p, qty: e.target.value }))} />
              </FieldLabel>
            </div>
            <p className="field-helper" style={{ marginTop: 8, color: laboratoriumQtyHint.tone }}>{laboratoriumQtyHint.text}</p>
          </>
        ) : (
          <>
            <div className="form-grid" style={{ marginTop: 12 }}>
              <FieldLabel text="Nama Radiologi" htmlFor="pelayanan-modal-rad-nama">
                <input id="pelayanan-modal-rad-nama" className="search-input" placeholder="Nama pemeriksaan radiologi" value={radiologiForm.nama} onChange={(e) => setRadiologiForm((p) => ({ ...p, nama: e.target.value }))} />
              </FieldLabel>
              <FieldLabel text="Qty" htmlFor="pelayanan-modal-rad-qty">
                <input id="pelayanan-modal-rad-qty" className="search-input" type="number" min={1} placeholder="Jumlah pemeriksaan" value={radiologiForm.qty} onChange={(e) => setRadiologiForm((p) => ({ ...p, qty: e.target.value }))} />
              </FieldLabel>
            </div>
            <p className="field-helper" style={{ marginTop: 8, color: radiologiQtyHint.tone }}>{radiologiQtyHint.text}</p>
          </>
        )}
        <FormFeedback errors={[detailError]} />
        <div className="confirm-actions">
          <button className="btn-muted" onClick={() => setDetailCreateModalOpen(false)}>Batal</button>
          <button className="btn-primary" disabled={detailTab === 'tindakan' && (!isTindakanFromMaster || jasaRef.isLoading || jasaRef.isFetching)} onClick={submitDetailCreate}>Simpan</button>
        </div>
      </FormModal>
    </section>
  )
}
