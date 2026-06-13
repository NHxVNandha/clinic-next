import { useEffect, useMemo, useRef, useState } from 'react'
import type { ColDef } from 'ag-grid-community'
import { ChevronLeft, ChevronRight, Download, FileText, Filter, RotateCcw } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { DataGrid } from '../components/data-grid'
import { GridEntityCell } from '../components/grid-entity-cell'
import { PageHeader } from '../components/page-header'
import { useLaporanPendaftaran, useLaporanPembayaran, useLaporanTindakan } from '../hooks/use-laporan'
import { useDebouncedValue } from '../hooks/use-debounced-value'
import { getStatusMeta } from '../lib/status-meta'
import { useT, type TranslationKey } from '../i18n'
import { FieldLabel } from '../components/field-label'

type LaporanMode = 'tindakan' | 'pembayaran' | 'pendaftaran'

function getPatientDisplayName(data?: Record<string, unknown> | null) {
  const value = data?.namaPasien ?? data?.nama_pasien ?? data?.nama ?? data?.pasienNama ?? data?.namaPatient
  const text = String(value ?? '').trim()
  return text || '-'
}

export function LaporanPage({ canFetch }: { canFetch: boolean }) {
  const { t } = useT()
  const msg = (key: TranslationKey, values: Record<string, string | number> = {}) => Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), t(key))
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
  const numericTotal = rows.reduce((sum, row) => sum + Number(row.total ?? row.grandtotal ?? row.jumlahBayar ?? 0), 0)
  const chartValues = [40, 55, 48, 75, 90, 36, 44]
  const trafficItems = [
    { label: 'General Practitioner', value: 42, tone: 'primary' },
    { label: 'Pediatrics', value: 28, tone: 'secondary' },
    { label: 'Cardiology', value: 15, tone: 'tertiary' },
    { label: 'Dentistry', value: 10, tone: 'muted' },
  ]

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
      const timer = window.setTimeout(() => setPage(totalPage), 0)
      return () => window.clearTimeout(timer)
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
        { field: 'idRegistrasi', headerName: t('dashboard.col.registration'), minWidth: 180, pinned: 'left', wrapText: true, autoHeight: true, cellRenderer: (params: { value?: string; data?: Record<string, unknown> }) => <div><div className="cell-primary">{String(params.value ?? '-')}</div><div className="cell-subline registrasi-subline">{String(params.data?.tanggal ?? '-')}</div></div> },
        { field: 'namaPasien', headerName: t('dashboard.col.patient'), minWidth: 220, cellRenderer: (params: { data?: Record<string, unknown> }) => <GridEntityCell primary={getPatientDisplayName(params.data)} secondary={String(params.data?.idPasien ?? '').trim() || undefined} kind="patient" /> },
        { field: 'namaDokter', headerName: t('dashboard.col.doctor'), minWidth: 180 },
        { field: 'grandtotal', headerName: 'Grand Total', minWidth: 150 },
        { field: 'jumlahBayar', headerName: t('kasir.title'), minWidth: 120 },
        { field: 'sisa', headerName: 'Sisa', minWidth: 120 },
      ]
    }
    if (mode === 'pendaftaran') {
      return [
        { colId: 'select', headerName: '', width: 44, maxWidth: 44, minWidth: 44, pinned: 'left', checkboxSelection: true, headerCheckboxSelection: false, sortable: false, filter: false, resizable: false },
        { field: 'idRegistrasi', headerName: t('dashboard.col.registration'), minWidth: 180, pinned: 'left', wrapText: true, autoHeight: true, cellRenderer: (params: { value?: string; data?: Record<string, unknown> }) => <div><div className="cell-primary">{String(params.value ?? '-')}</div><div className="cell-subline registrasi-subline">{String(params.data?.tanggal ?? '-')}</div></div> },
        {
          field: 'idPasien',
          headerName: t('dashboard.col.patient'),
          minWidth: 250,
          wrapText: true,
          autoHeight: true,
          cellRenderer: (params: { value?: string; data?: Record<string, unknown> }) => <GridEntityCell primary={getPatientDisplayName(params.data)} secondary={String(params.value ?? '-').trim() || '-'} kind="patient" />,
        },
        { field: 'namaDokter', headerName: t('dashboard.col.doctor'), minWidth: 180 },
        {
          field: 'status',
          headerName: t('common.status'),
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
      { field: 'idRegistrasi', headerName: t('dashboard.col.registration'), minWidth: 180, pinned: 'left', wrapText: true, autoHeight: true, cellRenderer: (params: { value?: string; data?: Record<string, unknown> }) => <div><div className="cell-primary">{String(params.value ?? '-')}</div><div className="cell-subline registrasi-subline">{String(params.data?.tanggal ?? '-')}</div></div> },
      { field: 'namaPasien', headerName: t('dashboard.col.patient'), minWidth: 220, cellRenderer: (params: { data?: Record<string, unknown> }) => <GridEntityCell primary={getPatientDisplayName(params.data)} secondary={String(params.data?.idPasien ?? '').trim() || undefined} kind="patient" /> },
      { field: 'namaDokter', headerName: t('dashboard.col.doctor'), minWidth: 180 },
      { field: 'tanggal', headerName: t('reports.date'), minWidth: 140 },
      { field: 'total', headerName: 'Total', minWidth: 130 },
      {
        field: 'status',
        headerName: t('common.status'),
        minWidth: 120,
        cellRenderer: (params: { value?: string }) => {
          const statusMeta = getStatusMeta(params.value)
          return <span className={`status-pill ${statusMeta.className}`}>{statusMeta.label}</span>
        },
      },
    ]
  }, [mode, t])

  return (
    <section className="page-card">
      <PageHeader
        title={t('laporan.title')}
        description={t('nav.laporan.desc')}
        eyebrow={t('reports.eyebrow')}
        actions={(
          <div className="reports-header-actions">
            <button className="icon-btn"><FileText size={16} /> Export PDF</button>
            <button className="icon-btn btn-primary"><Download size={16} /> Export Excel</button>
          </div>
        )}
      />

      <div className="toolbar-row toolbar-primary">
        <div className="tab-switch">
          <button className={`tab-btn ${mode === 'tindakan' ? 'active' : ''}`} onClick={() => setMode('tindakan')}>{t('reports.tab.actions')}</button>
          <button className={`tab-btn ${mode === 'pembayaran' ? 'active' : ''}`} onClick={() => setMode('pembayaran')}>{t('reports.tab.payments')}</button>
          <button className={`tab-btn ${mode === 'pendaftaran' ? 'active' : ''}`} onClick={() => setMode('pendaftaran')}>{t('reports.tab.registration')}</button>
        </div>
        <input
          ref={searchInputRef}
          className="search-input search-dominant"
          placeholder={t('laporan.search')}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
      </div>

      <div className="toolbar-row">
        <div className="filter-chip-wrap" style={{ margin: 0 }}>
          <button className={`filter-chip ${status === '1' ? 'active' : ''}`} onClick={() => { setStatus('1'); setPage(1) }}>{t('status.waiting')}</button>
          <button className={`filter-chip ${status === '2' ? 'active' : ''}`} onClick={() => { setStatus('2'); setPage(1) }}>{t('status.served')}</button>
          <button className={`filter-chip ${status === '3' ? 'active' : ''}`} onClick={() => { setStatus('3'); setPage(1) }}>{t('status.done')}</button>
          <button className={`filter-chip ${status === '4' ? 'active' : ''}`} onClick={() => { setStatus('4'); setPage(1) }}>{t('status.cancelled')}</button>
          <button className={`filter-chip ${status === '' ? 'active' : ''}`} onClick={() => { setStatus(''); setPage(1) }}>{t('common.all')}</button>
        </div>
      </div>

      {showAdvancedFilters ? (
        <div className="toolbar-row">
          <FieldLabel text={t('reports.date')} htmlFor="laporan-filter-tanggal" className="toolbar-field">
            <input id="laporan-filter-tanggal" className="search-input" placeholder="dd-mm-yyyy" value={tanggal} onChange={(event) => { setTanggal(event.target.value); setPage(1) }} />
          </FieldLabel>
          <FieldLabel text={t('reports.fromDate')} htmlFor="laporan-filter-from" className="toolbar-field">
            <input id="laporan-filter-from" className="search-input" placeholder="yyyy-mm-dd" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1) }} />
          </FieldLabel>
          <FieldLabel text={t('reports.toDate')} htmlFor="laporan-filter-to" className="toolbar-field">
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

      <div className="reports-bento-grid">
        <section className="reports-card reports-revenue-card">
          <div className="reports-card-head">
            <div>
              <h2>{t('reports.revenueTitle')}</h2>
              <p>{t('reports.revenueDesc')}</p>
            </div>
            <span className="reports-legend"><i /> {t('reports.grossRevenue')}</span>
          </div>
          <div className="reports-revenue-total">
            <span>{msg('reports.totalMode', { mode })}</span>
            <strong>{new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(numericTotal)}</strong>
          </div>
          <div className="reports-chart-bars">
            {chartValues.map((value, index) => (
              <div className="reports-chart-item" key={index}>
                <span className="reports-chart-tooltip">{value}%</span>
                <div className={index === 4 ? 'active' : ''} style={{ height: `${value}%` }} />
                <small>{['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'][index]}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="reports-card reports-traffic-card">
          <div className="reports-card-head compact"><h2>{t('reports.departmentTraffic')}</h2></div>
          <div className="reports-traffic-list">
            {trafficItems.map((item) => (
              <div className="reports-traffic-item" key={item.label}>
                <div><span>{item.label}</span><strong>{item.value}%</strong></div>
                <p><i className={`reports-fill-${item.tone}`} style={{ width: `${item.value}%` }} /></p>
              </div>
            ))}
          </div>
          <div className="reports-total-consults"><strong>{data?.total ?? 0}</strong><span>{t('reports.totalConsultations')}</span></div>
        </section>

        <section className="reports-card reports-inventory-card">
          <div className="reports-card-head"><div><h2>{t('reports.inventory')}</h2><p>{t('reports.inventoryDesc')}</p></div><span className="reports-alert">{t('reports.itemsCritical')}</span></div>
          <div className="reports-mini-table">
            <div><strong>Paracetamol 500mg</strong><span>{t('reports.optimal')}</span></div>
            <div><strong>Amoxicillin 250mg</strong><span className="danger">{t('reports.reorder')}</span></div>
            <div><strong>Insulin Glargine</strong><span className="danger">{t('reports.critical')}</span></div>
          </div>
        </section>

        <section className="reports-card reports-demo-card">
          <div className="reports-card-head compact"><h2>{t('reports.demographics')}</h2></div>
          <div className="reports-demo-grid">
            <div><span>0-18 yrs</span><p><i style={{ width: '24%' }} /></p><strong>24%</strong></div>
            <div><span>19-45 yrs</span><p><i style={{ width: '52%' }} /></p><strong>52%</strong></div>
            <div><span>46+ yrs</span><p><i style={{ width: '24%' }} /></p><strong>24%</strong></div>
          </div>
        </section>
      </div>

      {activeLoading ? (
        <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
          <div className="skeleton-block" />
          <div className="skeleton-block" />
          <div className="skeleton-block" />
        </div>
      ) : null}

      <section className="reports-table-card">
        <div className="reports-table-head">
          <div><h2>{t('reports.operational')}</h2><p>{msg('reports.operationalDesc', { mode, total: data?.total ?? 0 })}</p></div>
          <div className="reports-table-actions">
            <button className="icon-btn" title={showAdvancedFilters ? t('reports.closeAdvanced') : t('reports.openAdvanced')} onClick={() => setShowAdvancedFilters((prev) => !prev)}><Filter size={14} /> {t('reports.advanced')}</button>
            <button className="icon-btn" disabled={activeFilterCount === 0} onClick={clearAllFilters}><RotateCcw size={14} /> {t('common.reset')}</button>
          </div>
        </div>
        <DataGrid storageKey={`laporan-${mode}`} rows={rows} columns={columns} loading={activeLoading} />
        {!activeLoading && rows.length === 0 ? <div className="empty-state"><p className="empty-note">{t('reports.empty')}</p></div> : null}
        <div className="pager-row">
          <button className="icon-btn icon-only" title={t('common.previousPage')} aria-label={t('common.previousPage')} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={14} /></button>
          <span>{t('common.page')} {page} / {totalPage}</span>
          <button className="icon-btn icon-only" title={t('common.nextPage')} aria-label={t('common.nextPage')} disabled={page >= totalPage} onClick={() => setPage((p) => p + 1)}><ChevronRight size={14} /></button>
        </div>
      </section>
    </section>
  )
}
