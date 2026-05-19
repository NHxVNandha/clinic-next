import { useEffect, useMemo, useRef, useState } from 'react'
import type { ColDef } from 'ag-grid-community'
import { ChevronLeft, ChevronRight, Filter, RotateCcw } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { DataGrid } from '../components/data-grid'
import { useLaporanPendaftaran, useLaporanPembayaran, useLaporanTindakan } from '../hooks/use-laporan'
import { useDebouncedValue } from '../hooks/use-debounced-value'
import { getStatusMeta } from '../lib/status-meta'
import { FieldLabel } from '../components/field-label'

type LaporanMode = 'tindakan' | 'pembayaran' | 'pendaftaran'

function getPatientDisplayName(data?: Record<string, unknown> | null) {
  const value = data?.namaPasien ?? data?.nama_pasien ?? data?.nama ?? data?.pasienNama ?? data?.namaPatient
  const text = String(value ?? '').trim()
  return text || '-'
}

export function LaporanPage({ canFetch }: { canFetch: boolean }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialModeParam = searchParams.get('mode')
  const initialMode: LaporanMode = initialModeParam === 'pembayaran' || initialModeParam === 'pendaftaran' ? initialModeParam : 'tindakan'
  const initialPage = Math.max(1, Number(searchParams.get('page') || '1') || 1)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [mode, setMode] = useState<LaporanMode>(initialMode)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const debouncedSearch = useDebouncedValue(search)
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [tanggal, setTanggal] = useState(searchParams.get('tanggal') || '')
  const [fromDate, setFromDate] = useState(searchParams.get('fromDate') || '')
  const [toDate, setToDate] = useState(searchParams.get('toDate') || '')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(Boolean(searchParams.get('tanggal') || searchParams.get('fromDate') || searchParams.get('toDate')))
  const [page, setPage] = useState(initialPage)
  const baseParams = {
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
    status: status || undefined,
    tanggal: tanggal || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  }

  const tindakan = useLaporanTindakan(baseParams, canFetch && mode === 'tindakan')
  const pembayaran = useLaporanPembayaran(baseParams, canFetch && mode === 'pembayaran')
  const pendaftaran = useLaporanPendaftaran(baseParams, canFetch && mode === 'pendaftaran')

  const active = mode === 'tindakan' ? tindakan : mode === 'pembayaran' ? pembayaran : pendaftaran
  const activeLoading = active.isLoading || active.isFetching
  const data = active.data?.data
  const rows = data?.items ?? []
  const totalPage = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.pageSize ?? 20)))
  const activeFilterCount = [search, status, tanggal, fromDate, toDate].filter((value) => Boolean(value.trim())).length
  const activeFilterChips = [
    search.trim() ? `Cari: ${search.trim()}` : null,
    status.trim() ? `Status: ${status.trim()}` : null,
    tanggal.trim() ? `Tanggal: ${tanggal.trim()}` : null,
    fromDate.trim() ? `From: ${fromDate.trim()}` : null,
    toDate.trim() ? `To: ${toDate.trim()}` : null,
  ].filter((item): item is string => Boolean(item))

  function clearAllFilters() {
    setSearch('')
    setStatus('')
    setTanggal('')
    setFromDate('')
    setToDate('')
    setShowAdvancedFilters(false)
    setPage(1)
  }

  useEffect(() => {
    const next = new URLSearchParams()
    next.set('mode', mode)
    next.set('page', String(page))
    if (search.trim()) next.set('search', search.trim())
    if (status.trim()) next.set('status', status.trim())
    if (tanggal.trim()) next.set('tanggal', tanggal.trim())
    if (fromDate.trim()) next.set('fromDate', fromDate.trim())
    if (toDate.trim()) next.set('toDate', toDate.trim())
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true })
    }
  }, [mode, page, search, status, tanggal, fromDate, toDate, searchParams, setSearchParams])

  useEffect(() => {
    if (!activeLoading && page > totalPage) {
      setPage(totalPage)
    }
  }, [activeLoading, page, totalPage])

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

  const columns = useMemo<ColDef<Record<string, unknown>>[]>(() => {
    if (mode === 'pembayaran') {
      return [
        { colId: 'select', headerName: '', width: 44, maxWidth: 44, minWidth: 44, pinned: 'left', checkboxSelection: true, headerCheckboxSelection: false, sortable: false, filter: false, resizable: false },
        { field: 'noInvoice', headerName: 'Invoice', minWidth: 170, pinned: 'left' },
        { field: 'idRegistrasi', headerName: 'Registrasi', minWidth: 180, pinned: 'left', wrapText: true, autoHeight: true, cellRenderer: (params: { value?: string; data?: Record<string, unknown> }) => <div><div className="cell-primary">{String(params.value ?? '-')}</div><div className="cell-subline registrasi-subline">{String(params.data?.tanggal ?? '-')}</div></div> },
        { field: 'namaPasien', headerName: 'Pasien', minWidth: 180, cellRenderer: (params: { data?: Record<string, unknown> }) => getPatientDisplayName(params.data) },
        { field: 'namaDokter', headerName: 'Dokter', minWidth: 180 },
        { field: 'grandtotal', headerName: 'Grand Total', minWidth: 150 },
        { field: 'jumlahBayar', headerName: 'Bayar', minWidth: 120 },
        { field: 'sisa', headerName: 'Sisa', minWidth: 120 },
      ]
    }
    if (mode === 'pendaftaran') {
      return [
        { colId: 'select', headerName: '', width: 44, maxWidth: 44, minWidth: 44, pinned: 'left', checkboxSelection: true, headerCheckboxSelection: false, sortable: false, filter: false, resizable: false },
        { field: 'idRegistrasi', headerName: 'Registrasi', minWidth: 180, pinned: 'left', wrapText: true, autoHeight: true, cellRenderer: (params: { value?: string; data?: Record<string, unknown> }) => <div><div className="cell-primary">{String(params.value ?? '-')}</div><div className="cell-subline registrasi-subline">{String(params.data?.tanggal ?? '-')}</div></div> },
        {
          field: 'idPasien',
          headerName: 'Pasien',
          minWidth: 250,
          wrapText: true,
          autoHeight: true,
          cellRenderer: (params: { value?: string; data?: Record<string, unknown> }) => <div><div className="cell-primary">{getPatientDisplayName(params.data)}</div><div className="cell-subline">{String(params.value ?? '-').trim() || '-'}</div></div>,
        },
        { field: 'namaDokter', headerName: 'Dokter', minWidth: 180 },
        {
          field: 'status',
          headerName: 'Status',
          minWidth: 120,
          cellRenderer: (params: { value?: string }) => {
            const statusMeta = getStatusMeta(params.value)
            return <span className={`status-pill ${statusMeta.className}`}>{statusMeta.label}</span>
          },
        },
      ]
    }
    return [
      { colId: 'select', headerName: '', width: 44, maxWidth: 44, minWidth: 44, pinned: 'left', checkboxSelection: true, headerCheckboxSelection: false, sortable: false, filter: false, resizable: false },
      { field: 'idTransaksi', headerName: 'Transaksi', minWidth: 160, pinned: 'left' },
      { field: 'idRegistrasi', headerName: 'Registrasi', minWidth: 180, pinned: 'left', wrapText: true, autoHeight: true, cellRenderer: (params: { value?: string; data?: Record<string, unknown> }) => <div><div className="cell-primary">{String(params.value ?? '-')}</div><div className="cell-subline registrasi-subline">{String(params.data?.tanggal ?? '-')}</div></div> },
      { field: 'namaPasien', headerName: 'Pasien', minWidth: 180, cellRenderer: (params: { data?: Record<string, unknown> }) => getPatientDisplayName(params.data) },
      { field: 'namaDokter', headerName: 'Dokter', minWidth: 180 },
      { field: 'tanggal', headerName: 'Tanggal', minWidth: 140 },
      { field: 'total', headerName: 'Total', minWidth: 130 },
      {
        field: 'status',
        headerName: 'Status',
        minWidth: 120,
        cellRenderer: (params: { value?: string }) => {
          const statusMeta = getStatusMeta(params.value)
          return <span className={`status-pill ${statusMeta.className}`}>{statusMeta.label}</span>
        },
      },
    ]
  }, [mode])

  return (
    <section className="page-card">
      <h1>Laporan</h1>
      <p>Rekap data tindakan, pembayaran, dan pendaftaran.</p>
      <div className="header-insight">
        <span className="header-insight-item">Pilih mode laporan sesuai kebutuhan operasional</span>
        <span className="header-insight-item">Filter status membantu audit proses harian</span>
        <span className="header-insight-item">Hasil mengikuti data API terbaru</span>
      </div>

      <div className="toolbar-row toolbar-primary">
        <div className="tab-switch">
          <button className={`tab-btn ${mode === 'tindakan' ? 'active' : ''}`} onClick={() => setMode('tindakan')}>Tindakan</button>
          <button className={`tab-btn ${mode === 'pembayaran' ? 'active' : ''}`} onClick={() => setMode('pembayaran')}>Pembayaran</button>
          <button className={`tab-btn ${mode === 'pendaftaran' ? 'active' : ''}`} onClick={() => setMode('pendaftaran')}>Pendaftaran</button>
        </div>
        <input
          ref={searchInputRef}
          className="search-input search-dominant"
          placeholder="Cari laporan..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
      </div>

      <div className="toolbar-row">
        <div className="filter-chip-wrap" style={{ margin: 0 }}>
          <button className={`filter-chip ${status === '1' ? 'active' : ''}`} onClick={() => { setStatus('1'); setPage(1) }}>Menunggu</button>
          <button className={`filter-chip ${status === '2' ? 'active' : ''}`} onClick={() => { setStatus('2'); setPage(1) }}>Dilayani</button>
          <button className={`filter-chip ${status === '3' ? 'active' : ''}`} onClick={() => { setStatus('3'); setPage(1) }}>Selesai</button>
          <button className={`filter-chip ${status === '4' ? 'active' : ''}`} onClick={() => { setStatus('4'); setPage(1) }}>Dibatalkan</button>
          <button className={`filter-chip ${status === '' ? 'active' : ''}`} onClick={() => { setStatus(''); setPage(1) }}>Semua</button>
        </div>
      </div>

      {showAdvancedFilters ? (
        <div className="toolbar-row">
          <FieldLabel text="Tanggal" htmlFor="laporan-filter-tanggal" className="toolbar-field">
            <input id="laporan-filter-tanggal" className="search-input" placeholder="dd-mm-yyyy" value={tanggal} onChange={(event) => { setTanggal(event.target.value); setPage(1) }} />
          </FieldLabel>
          <FieldLabel text="From Date" htmlFor="laporan-filter-from" className="toolbar-field">
            <input id="laporan-filter-from" className="search-input" placeholder="yyyy-mm-dd" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1) }} />
          </FieldLabel>
          <FieldLabel text="To Date" htmlFor="laporan-filter-to" className="toolbar-field">
            <input id="laporan-filter-to" className="search-input" placeholder="yyyy-mm-dd" value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(1) }} />
          </FieldLabel>
        </div>
      ) : null}

      {activeFilterChips.length > 0 ? (
        <div className="filter-chip-wrap">
          {activeFilterChips.map((chip) => (
            <span key={chip} className="filter-chip">{chip}</span>
          ))}
        </div>
      ) : null}

      <div className="stats-grid">
        <article className="stat-card">
          <small>Total Data</small>
          <strong>{data?.total ?? 0}</strong>
        </article>
        <article className="stat-card">
          <small>Filter Aktif</small>
          <strong>{activeFilterCount}</strong>
        </article>
      </div>

      {activeLoading ? (
        <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
          <div className="skeleton-block" />
          <div className="skeleton-block" />
          <div className="skeleton-block" />
        </div>
      ) : null}

      <DataGrid storageKey={`laporan-${mode}`} rows={rows} columns={columns} loading={activeLoading} />
      {!activeLoading && rows.length === 0 ? <div className="empty-state"><p className="empty-note">Data laporan tidak ditemukan untuk kombinasi filter saat ini.</p></div> : null}

      <div className="top-actions" style={{ marginTop: 10 }}>
        <button className="icon-btn icon-only" title={showAdvancedFilters ? 'Tutup filter lanjutan' : 'Buka filter lanjutan'} aria-label={showAdvancedFilters ? 'Tutup filter lanjutan' : 'Buka filter lanjutan'} onClick={() => setShowAdvancedFilters((prev) => !prev)}>
          <Filter size={14} />
        </button>
        <button className="icon-btn icon-only" title="Reset filter" aria-label="Reset filter" disabled={activeFilterCount === 0} onClick={clearAllFilters}><RotateCcw size={14} /></button>
      </div>

      <div className="pager-row">
        <button className="icon-btn icon-only" title="Halaman sebelumnya" aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={14} /></button>
        <span>Halaman {page} / {totalPage}</span>
        <button className="icon-btn icon-only" title="Halaman berikutnya" aria-label="Halaman berikutnya" disabled={page >= totalPage} onClick={() => setPage((p) => p + 1)}><ChevronRight size={14} /></button>
      </div>
    </section>
  )
}
