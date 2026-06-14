import { useEffect, useMemo, useRef, useState } from 'react'
import type { ColDef, RowClickedEvent } from 'ag-grid-community'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Ban, ChevronLeft, ChevronRight, Eye, Plus, RefreshCw, RotateCcw, UserCheck, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import { DataGrid } from '../components/data-grid'
import { GridEntityCell } from '../components/grid-entity-cell'
import { PageHeader } from '../components/page-header'
import { useInvoicePreview, usePembayaran } from '../hooks/use-kasir'
import {
  bayarSisaPembayaran,
  createPembayaran,
  createPengeluaran,
  deletePengeluaranDetail,
  getPengeluaran,
  getPengeluaranDetail,
  type PembayaranItem,
} from '../api/kasir'
import { pulangPendaftaran, voidPendaftaran } from '../api/pendaftaran'
import { FormModal } from '../components/form-modal'
import { FormFeedback } from '../components/form-feedback'
import { runActionWithFeedback } from '../lib/action-feedback'
import { useMasterDokter, useMasterPasien } from '../hooks/use-master'
import { useDebouncedValue } from '../hooks/use-debounced-value'
import { getStatusMeta } from '../lib/status-meta'
import { StrictMasterComboboxField } from '../components/strict-master-combobox-field'
import { FieldLabel } from '../components/field-label'
import { normalizeIdRegistrasi } from '../lib/input-normalizers'
import { canManageDestructiveActions, canManageKasirPayments, canManageKasirPengeluaran, getActionAccess } from '../lib/access'
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

function formatMoney(value?: number): string {
  const amount = Number(value ?? 0)
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function toNumber(value: string, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function getNominalHint(value: string, minimum = 0) {
  if (!value.trim()) return { tone: 'var(--text-muted)', text: '[i] Isi nominal.' }
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return { tone: 'var(--danger-text)', text: '[!] Nominal tidak valid.' }
  if (parsed < minimum) return { tone: 'var(--danger-text)', text: `[!] Nominal minimal ${minimum}.` }
  return { tone: 'var(--success-text)', text: '[OK] Nominal valid.' }
}

function flattenInvoiceRows(value: unknown, parent = ''): Array<{ field: string; value: string }> {
  if (!value || typeof value !== 'object') {
    return [{ field: parent || 'value', value: String(value ?? '-') }]
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, val]) => {
    const field = parent ? `${parent}.${key}` : key
    if (val && typeof val === 'object' && !Array.isArray(val)) return flattenInvoiceRows(val, field)
    if (Array.isArray(val)) return [{ field, value: `${val.length} item` }]
    return [{ field, value: String(val ?? '-') }]
  })
}

export function KasirPage({ canFetch }: { canFetch: boolean }) {
  const { t } = useT()
  const msg = (key: TranslationKey, values: Record<string, string | number> = {}) => Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), t(key))
  const canManage = canManageDestructiveActions()
  const canManagePayments = canManageKasirPayments()
  const canManagePengeluaran = canManageKasirPengeluaran()
  const kasirPaymentAccess = getActionAccess('kasirPaymentsManage')
  const kasirPengeluaranAccess = getActionAccess('kasirPengeluaranManage')
  const [searchParams, setSearchParams] = useSearchParams()
  const initialPage = Math.max(1, Number(searchParams.get('page') || '1') || 1)
  const initialPengeluaranPage = Math.max(1, Number(searchParams.get('ppage') || '1') || 1)
  const initialPengeluaranId = Number(searchParams.get('pid') || '0') || null
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const debouncedSearch = useDebouncedValue(search)
  const [page, setPage] = useState(initialPage)
  const [pengeluaranSearch, setPengeluaranSearch] = useState(searchParams.get('psearch') || '')
  const debouncedPengeluaranSearch = useDebouncedValue(pengeluaranSearch)
  const [pengeluaranPage, setPengeluaranPage] = useState(initialPengeluaranPage)
  const [selected, setSelected] = useState<PembayaranItem | null>(null)
  const [createPaymentModalOpen, setCreatePaymentModalOpen] = useState(false)
  const [createPengeluaranModalOpen, setCreatePengeluaranModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    idRegistrasi: '',
    idPasien: '',
    kdDokter: '',
    total: '',
    bAdmin: '0',
    bTambahan: '0',
    bOngkir: '0',
    diskon: '0',
    jumlahBayar: '0',
  })
  const [bayarSisaNominal, setBayarSisaNominal] = useState('0')
  const [selectedPengeluaranId, setSelectedPengeluaranId] = useState<number | null>(initialPengeluaranId)
  const [pengeluaranForm, setPengeluaranForm] = useState({ tanggal: '', keterangan: '', nama: '', nominal: '0' })
  const [createErrors, setCreateErrors] = useState<{ header?: string; numbers?: string }>({})
  const [bayarSisaError, setBayarSisaError] = useState<string | null>(null)
  const query = usePembayaran({ page, pageSize: 20, search: debouncedSearch || undefined }, canFetch)
  const dokterRef = useMasterDokter('', canFetch)
  const pasienRef = useMasterPasien(1, 100, '', canFetch)
  const pengeluaran = useQuery({
    queryKey: ['kasir-pengeluaran', pengeluaranPage, debouncedPengeluaranSearch],
    queryFn: () => getPengeluaran({ page: pengeluaranPage, pageSize: 20, search: debouncedPengeluaranSearch || undefined }),
    enabled: canFetch,
    placeholderData: (prev) => prev,
  })
  const pengeluaranDetail = useQuery({
    queryKey: ['kasir-pengeluaran-detail', selectedPengeluaranId],
    queryFn: () => getPengeluaranDetail(selectedPengeluaranId as number),
    enabled: canFetch && Boolean(selectedPengeluaranId),
  })
  const preview = useInvoicePreview(selected?.idRegistrasi ?? null, canFetch)
  const createMutation = useMutation({ mutationFn: createPembayaran })
  const bayarSisaMutation = useMutation({ mutationFn: ({ id, bayar }: { id: number; bayar: number }) => bayarSisaPembayaran(id, bayar) })
  const cancelPendaftaranMutation = useMutation({ mutationFn: (idRegistrasi: string) => voidPendaftaran(idRegistrasi) })
  const pulangMutation = useMutation({ mutationFn: (idRegistrasi: string) => pulangPendaftaran(idRegistrasi) })
  const createPengeluaranMutation = useMutation({ mutationFn: createPengeluaran })
  const deletePengeluaranDetailMutation = useMutation({ mutationFn: ({ id, detailId }: { id: number; detailId: number }) => deletePengeluaranDetail(id, detailId) })
  const isCreateValid = createForm.idRegistrasi.trim() && createForm.idPasien.trim() && createForm.kdDokter.trim() && toNumber(createForm.jumlahBayar, -1) >= 0
  const isBayarSisaValid = toNumber(bayarSisaNominal, -1) > 0
  const jumlahBayarHint = getNominalHint(createForm.jumlahBayar, 0)
  const bayarSisaHint = getNominalHint(bayarSisaNominal, 1)

  const data = query.data?.data
  const pengeluaranData = pengeluaran.data?.data
  const activeLoading = query.isLoading || query.isFetching
  const totalPage = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.pageSize ?? 20)))
  const pengeluaranTotalPage = Math.max(1, Math.ceil((pengeluaranData?.total ?? 0) / (pengeluaranData?.pageSize ?? 20)))
  const billingSummary = useMemo(() => {
    const rows = data?.items ?? []
    const totalTransaksi = rows.reduce((sum, item) => sum + Number(item.grandtotal ?? item.total ?? 0), 0)
    const lunas = rows.filter((item) => Number(item.sisa ?? 0) <= 0)
    const pending = rows.filter((item) => Number(item.sisa ?? 0) > 0)
    const pendingAmount = pending.reduce((sum, item) => sum + Number(item.sisa ?? 0), 0)
    return { totalTransaksi, lunas: lunas.length, pending: pending.length, pendingAmount }
  }, [data?.items])

  const columns = useMemo<ColDef<PembayaranItem>[]>(
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
      { field: 'noInvoice', headerName: 'Invoice', minWidth: 170, pinned: 'left' },
      {
        field: 'idRegistrasi',
        headerName: t('dashboard.col.registration'),
        minWidth: 190,
        pinned: 'left',
        wrapText: true,
        autoHeight: true,
        cellRenderer: (params: { value?: string; data?: PembayaranItem }) => (
          <div>
            <div className="cell-primary">{String(params.value ?? '-')}</div>
            <div className="cell-subline registrasi-subline">{String(params.data?.tglBayar ?? '-')}</div>
          </div>
        ),
      },
      {
        field: 'idPasien',
        headerName: t('dashboard.col.patient'),
        minWidth: 250,
        wrapText: true,
        autoHeight: true,
        cellRenderer: (params: { value?: string; data?: PembayaranItem }) => (
          <GridEntityCell primary={getPatientDisplayName(params.data as unknown as Record<string, unknown>)} secondary={String(params.value ?? '-').trim() || '-'} kind="patient" />
        ),
      },
      { field: 'namaDokter', headerName: t('dashboard.col.doctor'), minWidth: 180 },
      { field: 'grandtotal', headerName: 'Grand Total', minWidth: 160, valueFormatter: (p) => formatMoney(Number(p.value ?? 0)) },
      { field: 'jumlahBayar', headerName: t('cashier.col.paidAmount'), minWidth: 160, valueFormatter: (p) => formatMoney(Number(p.value ?? 0)) },
      { field: 'sisa', headerName: t('cashier.col.remaining'), minWidth: 140, valueFormatter: (p) => formatMoney(Number(p.value ?? 0)) },
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
        width: 224,
        minWidth: 224,
        maxWidth: 240,
        pinned: 'right',
        sortable: false,
        filter: false,
        suppressSizeToFit: true,
        cellRenderer: (params: { data?: PembayaranItem }) => {
          const row = params.data
          if (!row) return null
          return (
            <div className="top-actions row-actions billing-row-actions">
              {canManage ? (
                <button
                  className="icon-btn btn-primary-soft"
                  disabled={pulangMutation.isPending}
                  title={t('cashier.dischargeTitle')}
                  aria-label={t('cashier.dischargeTitle')}
                  onClick={async () => {
                    const confirmed = await confirmThemedAction({
                      title: t('cashier.confirmDischarge'),
                      text: t('cashier.confirmDischargeText').replace('{id}', String(row.idRegistrasi ?? '-')),
                      confirmText: t('cashier.confirmDischargeButton'),
                    })
                    if (!confirmed) return
                    const result = await runActionWithFeedback(() => pulangMutation.mutateAsync(row.idRegistrasi), t('cashier.dischargeSuccess'))
                    if (result) {
                      await query.refetch()
                    }
                  }}
                ><UserCheck size={14} /><span className="action-label-desktop">{t('cashier.discharge')}</span></button>
              ) : null}
              {canManage ? (
                <button
                  className="icon-btn btn-critical"
                  disabled={cancelPendaftaranMutation.isPending}
                  title={t('cashier.cancelRegistration')}
                  aria-label={t('cashier.cancelRegistration')}
                  onClick={async () => {
                    const confirmed = await confirmThemedAction({
                      title: t('cashier.confirmCancel'),
                      text: t('cashier.confirmCancelText').replace('{id}', String(row.idRegistrasi ?? '-')),
                      confirmText: t('cashier.confirmCancelButton'),
                      danger: true,
                    })
                    if (!confirmed) return
                    const result = await runActionWithFeedback(() => cancelPendaftaranMutation.mutateAsync(row.idRegistrasi), t('cashier.cancelSuccess'))
                    if (result) {
                      await query.refetch()
                    }
                  }}
                ><Ban size={14} /><span className="action-label-desktop">{t('cashier.cancel')}</span></button>
              ) : null}
            </div>
          )
        },
      },
      { field: 'tglBayar', headerName: t('cashier.col.paymentDate'), minWidth: 140, hide: true },
    ],
    [canManage, cancelPendaftaranMutation, pulangMutation, query, t],
  )

  const invoiceRows = useMemo(() => flattenInvoiceRows(preview.data?.data), [preview.data])
  const invoiceColumns = useMemo<ColDef<{ field: string; value: string }>[]>(() => [
    { field: 'field', headerName: 'Field', minWidth: 220, pinned: 'left' },
    { field: 'value', headerName: 'Value', minWidth: 280 },
  ], [])

  const pengeluaranColumns = useMemo<ColDef<Record<string, unknown>>[]>(() => [
    { field: 'id', headerName: 'ID', minWidth: 100, pinned: 'left' },
    { field: 'tanggal', headerName: t('reports.date'), minWidth: 140 },
    { field: 'keterangan', headerName: t('settings.field.notes'), minWidth: 240 },
    { field: 'total', headerName: 'Total', minWidth: 150, valueFormatter: (p) => formatMoney(Number(p.value ?? 0)) },
    { colId: 'aksi', headerName: t('common.actions'), minWidth: 90, pinned: 'right', sortable: false, filter: false, cellRenderer: (params: { data?: Record<string, unknown> }) => (
      <button className="icon-btn icon-only" title={t('cashier.viewDetail')} aria-label={t('cashier.viewDetail')} onClick={() => setSelectedPengeluaranId(Number(params.data?.id ?? 0))}><Eye size={14} /></button>
    ) },
  ], [t])

  const pengeluaranDetailColumns = useMemo<ColDef<Record<string, unknown>>[]>(() => [
    { field: 'nama', headerName: 'Nama', minWidth: 220 },
    { field: 'nominal', headerName: 'Nominal', minWidth: 150, valueFormatter: (p) => formatMoney(Number(p.value ?? 0)) },
    {
      colId: 'aksi',
      headerName: 'Aksi',
      minWidth: 90,
      sortable: false,
      filter: false,
      cellRenderer: (params: { data?: Record<string, unknown> }) => (
        <button
          className="icon-btn icon-only btn-critical"
          disabled={deletePengeluaranDetailMutation.isPending || !canManagePengeluaran}
          title={!canManagePengeluaran ? kasirPengeluaranAccess.reason : undefined}
          onClick={async () => {
            if (!selectedPengeluaranId) return
            const detailId = Number(params.data?.detailId ?? 0)
            const confirmed = await confirmThemedAction({
              title: 'Konfirmasi hapus detail',
              text: `Hapus detail pengeluaran #${detailId}?`,
              confirmText: 'Ya, Hapus',
              danger: true,
            })
            if (!confirmed) return
            const result = await runActionWithFeedback(() => deletePengeluaranDetailMutation.mutateAsync({ id: selectedPengeluaranId, detailId }), 'Detail pengeluaran berhasil dihapus.')
            if (result) {
              await pengeluaran.refetch()
              await pengeluaranDetail.refetch()
            }
          }}
        >
          <Ban size={14} />
        </button>
      ),
    },
  ], [canManagePengeluaran, deletePengeluaranDetailMutation, kasirPengeluaranAccess.reason, pengeluaran, pengeluaranDetail, selectedPengeluaranId])

  const onRowClicked = (event: RowClickedEvent<PembayaranItem>) => {
    const row = event.data ?? null
    setSelected(row)
    if (!row) return
    setCreateForm((prev) => ({
      ...prev,
      idRegistrasi: row.idRegistrasi ?? prev.idRegistrasi,
      idPasien: row.idPasien ?? prev.idPasien,
      kdDokter: row.kdDokter ?? prev.kdDokter,
      total: String(row.total ?? row.grandtotal ?? prev.total),
      jumlahBayar: String(row.jumlahBayar ?? prev.jumlahBayar),
    }))
    setBayarSisaNominal(String(row.sisa ?? 0))
  }

  const selectedSource = (selected as unknown as Record<string, unknown>) || {}
  const selectedStatus = getStatusMeta(String((selected?.status ?? pickValue(selectedSource, ['status'])) || ''))
  const role = String(getAuthUser()?.role || '').toLowerCase()
  const showSystemInfo = role === 'admin' || role === 'dev' || role === 'developer'
  const selectedOverview = [
    { label: 'Nama Pasien', value: getPatientDisplayName(selectedSource) },
    { label: 'Dokter', value: pickValue(selectedSource, ['namaDokter', 'dokterNama']) || '-' },
    { label: 'Tanggal Pembayaran', value: formatHumanDate(pickValue(selectedSource, ['tglBayar', 'tanggal'])) },
    { label: 'Penjamin', value: pickValue(selectedSource, ['penjamin', 'tipePenjamin']) || '-' },
  ]
  const patientIdentifier = pickValue(selectedSource, ['noRm', 'no_rm', 'nomorRm', 'nomor_rm', 'idPasien', 'pasienId']) || '-'
  const selectedSystemInfo = [
    { label: 'No. Registrasi', value: pickValue(selectedSource, ['idRegistrasi']) || '-' },
    { label: 'No. Invoice', value: pickValue(selectedSource, ['noInvoice']) || '-' },
    { label: 'No. RM / ID Pasien', value: patientIdentifier },
    { label: 'Kode Dokter', value: pickValue(selectedSource, ['kdDokter']) || '-' },
    { label: 'ID Internal', value: pickValue(selectedSource, ['id']) || '-' },
  ]

  function resetCreateForm() {
    setCreateForm({
      idRegistrasi: '',
      idPasien: '',
      kdDokter: '',
      total: '',
      bAdmin: '0',
      bTambahan: '0',
      bOngkir: '0',
      diskon: '0',
      jumlahBayar: '0',
    })
  }

  async function submitCreatePembayaran() {
    if (!canManagePayments || createMutation.isPending) return
    if (!isCreateValid) {
      setCreateErrors({ header: 'ID registrasi, ID pasien, kode dokter, dan jumlah bayar wajib valid.' })
      toast.error('ID registrasi, ID pasien, kode dokter, dan jumlah bayar wajib valid.')
      return
    }

    const pasienValid = (pasienRef.data?.data.items ?? []).some((item) => item.idPasien === createForm.idPasien.trim())
    const dokterValid = (dokterRef.data?.data ?? []).some((item) => item.kdDokter === createForm.kdDokter.trim())
    if (!pasienValid || !dokterValid) {
      setCreateErrors({ header: 'ID pasien atau kode dokter tidak valid. Gunakan nilai dari daftar referensi.' })
      toast.error('ID pasien atau kode dokter tidak valid.')
      return
    }

    const total = createForm.total ? toNumber(createForm.total, -1) : undefined
    const bAdmin = toNumber(createForm.bAdmin, -1)
    const bTambahan = toNumber(createForm.bTambahan, -1)
    const bOngkir = toNumber(createForm.bOngkir, -1)
    const diskon = toNumber(createForm.diskon, -1)
    const jumlahBayar = toNumber(createForm.jumlahBayar, -1)
    if ((total !== undefined && total < 0) || bAdmin < 0 || bTambahan < 0 || bOngkir < 0 || diskon < 0 || jumlahBayar < 0) {
      setCreateErrors({ numbers: 'Semua nominal pembayaran harus 0 atau lebih.' })
      toast.error('Semua nominal pembayaran harus 0 atau lebih.')
      return
    }

    const confirmed = await confirmThemedAction({
      title: 'Konfirmasi tambah pembayaran',
      text: `Simpan pembayaran untuk registrasi ${normalizeIdRegistrasi(createForm.idRegistrasi)}?`,
      confirmText: 'Ya, Simpan',
    })
    if (!confirmed) return

    setCreateErrors({})
    const result = await runActionWithFeedback(
      () =>
        createMutation.mutateAsync({
          idRegistrasi: normalizeIdRegistrasi(createForm.idRegistrasi),
          idPasien: createForm.idPasien,
          kdDokter: createForm.kdDokter,
          total,
          bAdmin,
          bTambahan,
          bOngkir,
          diskon,
          jumlahBayar,
        }),
      'Pembayaran berhasil dibuat.',
    )
    if (result) {
      setCreatePaymentModalOpen(false)
      await query.refetch()
    }
  }

  async function submitCreatePengeluaran() {
    if (createPengeluaranMutation.isPending || !canManagePengeluaran) return
    if (!pengeluaranForm.keterangan.trim() || !pengeluaranForm.nama.trim()) {
      toast.error('Keterangan dan nama detail pengeluaran wajib diisi.')
      return
    }
    const confirmed = await confirmThemedAction({
      title: 'Konfirmasi tambah pengeluaran',
      text: `Tambahkan pengeluaran untuk ${pengeluaranForm.keterangan.trim()}?`,
      confirmText: 'Ya, Simpan',
    })
    if (!confirmed) return

    const result = await runActionWithFeedback(
      () =>
        createPengeluaranMutation.mutateAsync({
          tanggal: pengeluaranForm.tanggal || undefined,
          keterangan: pengeluaranForm.keterangan,
          detail: [{ nama: pengeluaranForm.nama, nominal: Number(pengeluaranForm.nominal || 0) }],
        }),
      'Pengeluaran berhasil ditambahkan.',
    )
    if (result) {
      setCreatePengeluaranModalOpen(false)
      setPengeluaranForm({ tanggal: '', keterangan: '', nama: '', nominal: '0' })
      await pengeluaran.refetch()
    }
  }

  useEffect(() => {
    const next = new URLSearchParams()
    next.set('page', String(page))
    if (search.trim()) next.set('search', search.trim())
    next.set('ppage', String(pengeluaranPage))
    if (pengeluaranSearch.trim()) next.set('psearch', pengeluaranSearch.trim())
    if (selectedPengeluaranId) next.set('pid', String(selectedPengeluaranId))
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true })
    }
  }, [page, search, pengeluaranPage, pengeluaranSearch, selectedPengeluaranId, searchParams, setSearchParams])

  useEffect(() => {
    if (!activeLoading && page > totalPage) {
      const timer = window.setTimeout(() => setPage(totalPage), 0)
      return () => window.clearTimeout(timer)
    }
  }, [activeLoading, page, totalPage])

  useEffect(() => {
    if (!(pengeluaran.isLoading || pengeluaran.isFetching) && pengeluaranPage > pengeluaranTotalPage) {
      const timer = window.setTimeout(() => setPengeluaranPage(pengeluaranTotalPage), 0)
      return () => window.clearTimeout(timer)
    }
  }, [pengeluaran.isLoading, pengeluaran.isFetching, pengeluaranPage, pengeluaranTotalPage])

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
        title={t('kasir.title')}
        description={t('nav.kasir.desc')}
        eyebrow={t('cashier.eyebrow')}
        actions={(
          <div className="billing-header-actions">
            <button className="icon-btn" onClick={() => window.print()}>{t('cashier.printDaily')}</button>
            <button className="icon-btn btn-primary" disabled={!canManagePayments} title={!canManagePayments ? kasirPaymentAccess.reason : t('cashier.addPayment')} onClick={() => setCreatePaymentModalOpen(true)}><Wallet size={16} /> {t('cashier.manualInvoice')}</button>
          </div>
        )}
      />
      {!(canManagePayments || canManagePengeluaran) ? <p><span className="readonly-badge">{t('registration.readonly')}</span></p> : null}

      <div className="toolbar-row toolbar-primary">
        <input
          ref={searchInputRef}
          className="search-input search-dominant"
          placeholder={t('kasir.search')}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
      </div>
      <div className="stats-grid">
        <article className="stat-card">
          <small>{t('cashier.totalTransactions')}</small>
          <strong>{new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(billingSummary.totalTransaksi)}</strong>
        </article>
        <article className="stat-card">
          <small>{t('cashier.paidToday')}</small>
          <strong>{billingSummary.lunas}</strong>
        </article>
        <article className="stat-card">
          <small>{t('cashier.pendingPayments')}</small>
          <strong>{billingSummary.pending}</strong>
        </article>
        <article className="stat-card">
          <small>{t('cashier.outstanding')}</small>
          <strong>{new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(billingSummary.pendingAmount)}</strong>
        </article>
      </div>
      {activeLoading ? (
        <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
          <div className="skeleton-block" />
          <div className="skeleton-block" />
          <div className="skeleton-block" />
        </div>
      ) : null}

      <section className="billing-queue-card">
        <div className="billing-queue-head">
          <div>
            <h2>{t('kasir.queue')}</h2>
            <p>{msg('cashier.selectedInvoice', { invoice: selected?.noInvoice ?? t('cashier.noSelected') })}</p>
          </div>
          <span className="billing-live-badge">Live</span>
        </div>
        <DataGrid storageKey="kasir-main" rows={data?.items ?? []} columns={columns} loading={activeLoading} selectedRowId={selected?.idRegistrasi ?? null} selectedRowField="idRegistrasi" onRowClicked={onRowClicked} />
        {!activeLoading && (data?.items?.length ?? 0) === 0 ? (
          <div className="empty-state">
            <p className="empty-note">{t('grid.empty')}</p>
            {search.trim() ? <button className="icon-btn icon-only" title={t('registration.resetFilter')} aria-label={t('registration.resetFilter')} onClick={() => { setSearch(''); setPage(1) }}><RotateCcw size={14} /></button> : null}
          </div>
        ) : null}

        <div className="billing-queue-actions">
          <button className="icon-btn btn-primary-soft" disabled={!canManagePengeluaran} title={!canManagePengeluaran ? kasirPengeluaranAccess.reason : t('kasir.addExpense')} onClick={() => setCreatePengeluaranModalOpen(true)}><Plus size={14} /> {t('kasir.addExpense')}</button>
          <button className="icon-btn" onClick={async () => { await query.refetch(); toast.success(t('cashier.refreshSuccess')) }}><RefreshCw size={14} /> {t('common.refresh')}</button>
        </div>

        <div className="pager-row">
          <button className="icon-btn icon-only" title={t('common.previousPage')} aria-label={t('common.previousPage')} disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}><ChevronLeft size={14} /></button>
          <span>{t('common.page')} {page} / {totalPage}</span>
          <button className="icon-btn icon-only" title={t('common.nextPage')} aria-label={t('common.nextPage')} disabled={page >= totalPage} onClick={() => setPage((prev) => prev + 1)}><ChevronRight size={14} /></button>
        </div>
      </section>

      <section className={`preview-box detail-soft ${selected ? 'glass-focus' : 'glass-strong'}`}>
        <h2>{t('cashier.previewInvoice')}</h2>
        {selected ? <div className="selected-strip"><p>{t('registration.detail.selected')}: <strong>{selected.idRegistrasi}</strong> - {getPatientDisplayName(selectedSource)}</p><div className="selected-strip-meta"><span className="detail-badge">{selected.idRegistrasi}</span><span className={`status-pill selected-status-pill ${selectedStatus.className}`}>{selectedStatus.label}</span></div></div> : null}
        {!selected ? (
          <p>{t('cashier.previewEmpty')}</p>
        ) : (
          <>
            <div className="detail-layout" style={{ marginTop: 10 }}>
              <div className="detail-main">
              <div className="detail-meta-strip">
                <span><strong>No. Registrasi:</strong> {selectedSystemInfo[0].value}</span>
                <span><strong>No. RM / ID Pasien:</strong> {selectedSystemInfo[2].value}</span>
              </div>
              <div className="detail-facts">
                {selectedOverview.map((item) => (
                  <div key={item.label} className="detail-fact">
                    <span className="detail-label">{item.label}</span>
                    <strong className="detail-value">{item.value}</strong>
                  </div>
                ))}
              </div>
              </div>
              {showSystemInfo ? <details className="detail-system">
                <summary>{t('registration.detail.systemInfo')}</summary>
                <div className="detail-grid-two detail-grid-compact" style={{ marginTop: 8 }}>
                  {selectedSystemInfo.map((item) => (
                    <article key={item.label} className="detail-item">
                      <small className="detail-label">{item.label}</small>
                      <strong className="detail-value">{item.value}</strong>
                    </article>
                  ))}
                </div>
              </details>
              : null}
            </div>
            {preview.isLoading ? (
              <p>{t('cashier.loadingPreview')}</p>
            ) : preview.data ? (
              <DataGrid rows={invoiceRows} columns={invoiceColumns} height={300} hideUtilityActions compact storageKey="kasir-invoice-preview" />
            ) : (
              <p>{t('cashier.previewUnavailable')}</p>
            )}
          </>
        )}

        {selected ? (
          <div className="top-actions" style={{ marginTop: 10 }}>
            <FieldLabel text="Nominal Bayar Sisa" htmlFor="kasir-bayar-sisa" style={{ minWidth: 220 }}>
              <input
                id="kasir-bayar-sisa"
                className="search-input"
                style={{ width: '100%' }}
                type="number"
                min={0}
                value={bayarSisaNominal}
                onChange={(e) => setBayarSisaNominal(e.target.value)}
                placeholder="Nominal bayar sisa"
                aria-invalid={Boolean(bayarSisaError)}
                aria-describedby={bayarSisaError ? 'kasir-bayar-sisa-error' : undefined}
              />
              <small className="field-helper" style={{ display: 'block', marginTop: 6, color: bayarSisaHint.tone }}>{bayarSisaHint.text}</small>
            </FieldLabel>
              <button
                className="icon-btn icon-only btn-primary-soft"
                disabled={!isBayarSisaValid || bayarSisaMutation.isPending || !canManagePayments}
                title={!canManagePayments ? kasirPaymentAccess.reason : undefined}
              onClick={async () => {
                if (!isBayarSisaValid) {
                  setBayarSisaError('Nominal bayar sisa harus lebih dari 0.')
                  toast.error('Nominal bayar sisa harus lebih dari 0.')
                  return
                }
                setBayarSisaError(null)
                const result = await runActionWithFeedback(
                  () => bayarSisaMutation.mutateAsync({ id: selected.id, bayar: toNumber(bayarSisaNominal, 0) }),
                  'Pembayaran sisa berhasil diproses.',
                )
                if (result) {
                  await query.refetch()
                }
              }}
              >{bayarSisaMutation.isPending ? <RefreshCw size={14} /> : <Wallet size={14} />}</button>
          </div>
        ) : null}
        <div id="kasir-bayar-sisa-error">
          <FormFeedback errors={[bayarSisaError]} />
        </div>
      </section>

      <section className="preview-box detail-soft glass-soft">
        <h2>{t('cashier.expenses')}</h2>
        <div className="toolbar-row" style={{ marginTop: 8 }}>
          <input className="search-input" placeholder={t('cashier.searchExpense')} value={pengeluaranSearch} onChange={(e) => { setPengeluaranSearch(e.target.value); setPengeluaranPage(1) }} />
          <div className="top-actions">
            <button className="icon-btn icon-only" title="Refresh pengeluaran" aria-label="Refresh pengeluaran" onClick={() => pengeluaran.refetch()}><RefreshCw size={14} /></button>
            <button className="icon-btn icon-only" title="Reset filter pengeluaran" aria-label="Reset filter pengeluaran" onClick={() => { setPengeluaranSearch(''); setPengeluaranPage(1) }}><RotateCcw size={14} /></button>
            <button className="icon-btn icon-only" title="Tutup detail pengeluaran" aria-label="Tutup detail pengeluaran" disabled={!selectedPengeluaranId} onClick={() => setSelectedPengeluaranId(null)}><Eye size={14} /></button>
          </div>
        </div>
        {pengeluaran.isLoading || pengeluaran.isFetching ? (
          <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
            <div className="skeleton-block" />
            <div className="skeleton-block" />
          </div>
        ) : null}

        <DataGrid
          rows={(pengeluaranData?.items ?? []) as Record<string, unknown>[]}
          columns={pengeluaranColumns}
          loading={pengeluaran.isLoading || pengeluaran.isFetching}
          height={320}
          storageKey="kasir-pengeluaran-list"
          hideUtilityActions
          compact
          onRowClicked={(event) => setSelectedPengeluaranId(Number((event.data as Record<string, unknown> | undefined)?.id ?? 0))}
        />
        {!(pengeluaran.isLoading || pengeluaran.isFetching) && (pengeluaranData?.items?.length ?? 0) === 0 ? (
          <p className="empty-note">{t('cashier.expenseEmpty')}</p>
        ) : null}

        <div className="pager-row">
          <button className="icon-btn icon-only" title="Halaman pengeluaran sebelumnya" aria-label="Halaman pengeluaran sebelumnya" disabled={pengeluaranPage <= 1} onClick={() => setPengeluaranPage((p) => p - 1)}>
            <ChevronLeft size={14} />
          </button>
          <span>
            {t('common.page')} {pengeluaranPage} / {pengeluaranTotalPage}
          </span>
          <button className="icon-btn icon-only" title="Halaman pengeluaran berikutnya" aria-label="Halaman pengeluaran berikutnya" disabled={pengeluaranPage >= pengeluaranTotalPage} onClick={() => setPengeluaranPage((p) => p + 1)}>
            <ChevronRight size={14} />
          </button>
        </div>

        {selectedPengeluaranId ? (
          <div style={{ marginTop: 10 }}>
            <h3 style={{ margin: '6px 0' }}>Detail Pengeluaran #{selectedPengeluaranId}</h3>
            {pengeluaranDetail.isLoading ? (
              <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                <div className="skeleton-block" />
                <div className="skeleton-block" />
              </div>
            ) : null}
            <DataGrid
              rows={((pengeluaranDetail.data?.data.detail as Array<Record<string, unknown>> | undefined) ?? [])}
              columns={pengeluaranDetailColumns}
              loading={pengeluaranDetail.isLoading || pengeluaranDetail.isFetching}
              height={300}
              storageKey="kasir-pengeluaran-detail"
              hideUtilityActions
              compact
            />
          </div>
        ) : null}
      </section>

      <FormModal
        open={createPaymentModalOpen}
        title="Tambah Pembayaran"
        description="Isi data pembayaran. Konfirmasi akan muncul sebelum penyimpanan."
        icon={Wallet}
        size="lg"
        footerNote="Secure transaction system active. Pastikan nominal dan identitas pasien sudah sesuai sebelum menyimpan."
        onClose={() => setCreatePaymentModalOpen(false)}
      >
        <div className="modal-summary-grid">
          <article className="modal-summary-card"><small>Invoice Number</small><strong>{createForm.idRegistrasi || selected?.idRegistrasi || '-'}</strong></article>
          <article className="modal-summary-card"><small>Patient ID</small><strong>{createForm.idPasien || selected?.idPasien || '-'}</strong></article>
        </div>
        <div className="modal-total-card">
          <div><small>Total Tagihan</small><p className="modal-helper-text">Nominal sebelum diskon dan pembayaran</p></div>
          <strong>{formatMoney(Number(createForm.total || selected?.total || 0))}</strong>
        </div>
        <div className="modal-option-grid" aria-label="Metode pembayaran">
          <div className="modal-option-card active"><Wallet size={22} /> Tunai</div>
          <div className="modal-option-card"><Wallet size={22} /> Transfer</div>
          <div className="modal-option-card"><Wallet size={22} /> QRIS</div>
        </div>
        <div className="form-grid">
          <FieldLabel text="ID Registrasi" htmlFor="kasir-create-idregistrasi">
            <input id="kasir-create-idregistrasi" className="search-input" placeholder="Contoh: REG-2026-0001" value={createForm.idRegistrasi} onChange={(e) => setCreateForm((p) => ({ ...p, idRegistrasi: e.target.value.toUpperCase() }))} />
          </FieldLabel>
          <FieldLabel text="ID Pasien (Master)" htmlFor="kasir-create-idpasien">
            <StrictMasterComboboxField
              inputId="kasir-create-idpasien"
              value={createForm.idPasien}
              onChange={(next) => {
                setCreateForm((p) => ({ ...p, idPasien: next }))
                setCreateErrors((prev) => ({ ...prev, header: undefined }))
              }}
              placeholder="Cari atau pilih ID pasien"
              options={(pasienRef.data?.data.items ?? []).map((item) => ({ value: item.idPasien, label: item.nama }))}
              loading={pasienRef.isLoading || pasienRef.isFetching}
              recentKey="kasir-idpasien"
              errorMessage="ID pasien harus dipilih dari daftar referensi."
              onStrictError={(message) => setCreateErrors({ header: message })}
            />
          </FieldLabel>
          <FieldLabel text="Kode Dokter (Master)" htmlFor="kasir-create-kddokter">
            <StrictMasterComboboxField
              inputId="kasir-create-kddokter"
              value={createForm.kdDokter}
              onChange={(next) => {
                setCreateForm((p) => ({ ...p, kdDokter: next }))
                setCreateErrors((prev) => ({ ...prev, header: undefined }))
              }}
              placeholder="Cari atau pilih kode dokter"
              options={(dokterRef.data?.data ?? []).map((item) => ({ value: item.kdDokter, label: item.namaDokter || item.kdDokter }))}
              loading={dokterRef.isLoading || dokterRef.isFetching}
              recentKey="kasir-kddokter"
              errorMessage="Kode dokter harus dipilih dari daftar referensi."
              onStrictError={(message) => setCreateErrors({ header: message })}
            />
          </FieldLabel>
          <FieldLabel text="Total" htmlFor="kasir-create-total">
            <input id="kasir-create-total" className="search-input" type="number" min={0} placeholder="Nominal total" value={createForm.total} onChange={(e) => setCreateForm((p) => ({ ...p, total: e.target.value }))} />
          </FieldLabel>
          <FieldLabel text="Biaya Admin" htmlFor="kasir-create-badmin">
            <input id="kasir-create-badmin" className="search-input" type="number" min={0} placeholder="Nominal biaya admin" value={createForm.bAdmin} onChange={(e) => setCreateForm((p) => ({ ...p, bAdmin: e.target.value }))} />
          </FieldLabel>
          <FieldLabel text="Biaya Tambahan" htmlFor="kasir-create-btambahan">
            <input id="kasir-create-btambahan" className="search-input" type="number" min={0} placeholder="Nominal biaya tambahan" value={createForm.bTambahan} onChange={(e) => setCreateForm((p) => ({ ...p, bTambahan: e.target.value }))} />
          </FieldLabel>
          <FieldLabel text="Biaya Ongkir" htmlFor="kasir-create-bongkir">
            <input id="kasir-create-bongkir" className="search-input" type="number" min={0} placeholder="Nominal biaya ongkir" value={createForm.bOngkir} onChange={(e) => setCreateForm((p) => ({ ...p, bOngkir: e.target.value }))} />
          </FieldLabel>
          <FieldLabel text="Diskon" htmlFor="kasir-create-diskon">
            <input id="kasir-create-diskon" className="search-input" type="number" min={0} placeholder="Nominal diskon" value={createForm.diskon} onChange={(e) => setCreateForm((p) => ({ ...p, diskon: e.target.value }))} />
          </FieldLabel>
          <FieldLabel text="Jumlah Bayar" htmlFor="kasir-create-jumlahbayar">
            <input
              id="kasir-create-jumlahbayar"
              className="search-input"
              type="number"
              min={0}
              placeholder="Nominal jumlah bayar"
              value={createForm.jumlahBayar}
              onChange={(e) => setCreateForm((p) => ({ ...p, jumlahBayar: e.target.value }))}
              aria-invalid={Boolean(createErrors.header || createErrors.numbers)}
              aria-describedby={createErrors.header || createErrors.numbers ? 'kasir-create-error' : undefined}
            />
            <small className="field-helper" style={{ marginTop: 2, color: jumlahBayarHint.tone }}>{jumlahBayarHint.text}</small>
          </FieldLabel>
        </div>
        <p style={{ marginTop: 8 }}>Klik baris tabel untuk autofill form dari transaksi terpilih.</p>
        <div id="kasir-create-error">
          <FormFeedback errors={[createErrors.header, createErrors.numbers]} />
        </div>
        <div className="confirm-actions">
          <button className="btn-muted" onClick={resetCreateForm}>Reset Form</button>
          <button className="btn-primary" disabled={!isCreateValid || createMutation.isPending || !canManagePayments} onClick={submitCreatePembayaran}>
            {createMutation.isPending ? 'Menyimpan...' : 'Simpan Pembayaran'}
          </button>
        </div>
      </FormModal>

      <FormModal
        open={createPengeluaranModalOpen}
        title="Tambah Pengeluaran"
        description="Isi data pengeluaran, lalu konfirmasi sebelum penyimpanan."
        icon={Plus}
        size="sm"
        onClose={() => setCreatePengeluaranModalOpen(false)}
      >
        <div className="form-grid">
          <FieldLabel text="Tanggal" htmlFor="kasir-pengeluaran-tanggal">
            <input id="kasir-pengeluaran-tanggal" className="search-input" type="date" value={pengeluaranForm.tanggal} onChange={(e) => setPengeluaranForm((p) => ({ ...p, tanggal: e.target.value }))} />
          </FieldLabel>
          <FieldLabel text="Keterangan Pengeluaran" htmlFor="kasir-pengeluaran-keterangan">
            <input id="kasir-pengeluaran-keterangan" className="search-input" placeholder="Contoh: pembelian ATK" value={pengeluaranForm.keterangan} onChange={(e) => setPengeluaranForm((p) => ({ ...p, keterangan: e.target.value }))} />
          </FieldLabel>
          <FieldLabel text="Nama Detail" htmlFor="kasir-pengeluaran-nama">
            <input id="kasir-pengeluaran-nama" className="search-input" placeholder="Contoh: Kertas A4" value={pengeluaranForm.nama} onChange={(e) => setPengeluaranForm((p) => ({ ...p, nama: e.target.value }))} />
          </FieldLabel>
          <FieldLabel text="Nominal" htmlFor="kasir-pengeluaran-nominal">
            <input id="kasir-pengeluaran-nominal" className="search-input" type="number" min={0} placeholder="Nominal pengeluaran" value={pengeluaranForm.nominal} onChange={(e) => setPengeluaranForm((p) => ({ ...p, nominal: e.target.value }))} />
          </FieldLabel>
        </div>
        <div className="confirm-actions">
          <button className="btn-muted" onClick={() => setPengeluaranForm({ tanggal: '', keterangan: '', nama: '', nominal: '0' })}>Reset Form</button>
          <button className="btn-primary" disabled={createPengeluaranMutation.isPending || !canManagePengeluaran} onClick={submitCreatePengeluaran}>
            {createPengeluaranMutation.isPending ? 'Menyimpan...' : 'Simpan Pengeluaran'}
          </button>
        </div>
      </FormModal>
    </section>
  )
}
