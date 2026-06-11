import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, Column, GridApi, GridOptions, IRowNode, RowClickedEvent, ValueFormatterParams } from 'ag-grid-community'
import { Download, Expand, FilterX, Maximize2, RotateCcw, SlidersHorizontal } from 'lucide-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { GridEntityCell, type GridEntityKind } from './grid-entity-cell'
import { getStatusMeta } from '../lib/status-meta'
import { getAuthUser } from '../lib/storage'
import { useT } from '../i18n'

type ExportSnapshot = {
  headers: string[]
  rows: string[][]
}

type DataGridProps<T> = {
  rows: T[]
  columns: ColDef<T>[]
  loading?: boolean
  height?: number
  onRowClicked?: (event: RowClickedEvent<T>) => void
  storageKey?: string
  hideUtilityActions?: boolean
  rowSelection?: GridOptions<T>['rowSelection']
  compact?: boolean
  selectedRowId?: string | number | null
  selectedRowField?: string
}

type StoredGridState = {
  filterModel?: unknown
  sortModel?: unknown
  columnState?: unknown
}

function resolveEntityKind(fieldName: string, headerName: string): GridEntityKind | null {
  const key = `${fieldName} ${headerName}`.toLowerCase()
  if (!/(^|\s|_|-)(nama|name|pasien|dokter|jasa|diagnosa|obat|radiologi|pemeriksaan|user)(\s|_|-|$)/.test(key)) return null
  if (/pasien|patient/.test(key)) return 'patient'
  if (/dokter|doctor/.test(key)) return null
  if (/diagnosa|diagnosis/.test(key)) return 'diagnosis'
  if (/obat|resep|medicine/.test(key)) return 'medicine'
  if (/jasa|tindakan|layanan|alkes|radiologi|pemeriksaan|service/.test(key)) return 'service'
  if (/user|email|role/.test(key)) return 'user'
  if (/rekam|record/.test(key)) return 'record'
  if (fieldName === 'nama' || fieldName === 'name' || headerName === 'nama' || headerName === 'name') return 'default'
  return null
}

function downloadBlob(content: BlobPart, type: string, fileName: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

function escapeCsvCell(value: string) {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function getFieldValue(data: unknown, field?: string) {
  if (!field || !data || typeof data !== 'object') return ''
  return field.split('.').reduce<unknown>((value, key) => {
    if (!value || typeof value !== 'object') return undefined
    return (value as Record<string, unknown>)[key]
  }, data)
}

function getExportValue<T>(api: GridApi<T>, column: Column, node: IRowNode<T>) {
  const colDef = column.getColDef()
  const value = colDef.field ? getFieldValue(node.data, colDef.field) : api.getCellValue({ rowNode: node, colKey: column })
  if (String(colDef.field ?? '').toLowerCase() === 'status') return getStatusMeta(value as string | number | null | undefined).label
  if (typeof colDef.valueFormatter === 'function') {
    return String(colDef.valueFormatter({ value, data: node.data, node, colDef, column, api, context: undefined } as unknown as ValueFormatterParams<T>) ?? '')
  }
  return String(value ?? '')
}

export function DataGrid<T>({ rows, columns, loading, height = 460, onRowClicked, storageKey, hideUtilityActions, rowSelection = { mode: 'singleRow', checkboxes: false }, compact, selectedRowId, selectedRowField = 'idRegistrasi' }: DataGridProps<T>) {
  const { t } = useT()
  const shouldAnimateRows = rows.length > 0 && rows.length <= 120
  const gridApiRef = useRef<GridApi<T> | null>(null)
  const persistTimerRef = useRef<number | null>(null)
  const hasInitialFitRef = useRef(false)

  const localStorageKey = useMemo(() => {
    if (!storageKey) return null
    const role = String(getAuthUser()?.role || 'guest').toLowerCase()
    return `grid-state:${storageKey}:${role}`
  }, [storageKey])

  const toolsStorageKey = useMemo(() => {
    if (!localStorageKey) return null
    return `${localStorageKey}:advanced-tools`
  }, [localStorageKey])

  const [showAdvancedTools, setShowAdvancedTools] = useState(false)

  useEffect(() => {
    if (!toolsStorageKey) return
    const timer = window.setTimeout(() => {
      const raw = localStorage.getItem(toolsStorageKey)
      setShowAdvancedTools(raw === '1')
    }, 0)
    return () => window.clearTimeout(timer)
  }, [toolsStorageKey])

  useEffect(() => {
    if (!toolsStorageKey) return
    localStorage.setItem(toolsStorageKey, showAdvancedTools ? '1' : '0')
  }, [showAdvancedTools, toolsStorageKey])

  useEffect(() => {
    if (!gridApiRef.current || selectedRowId === null || selectedRowId === undefined || selectedRowId === '') return
    const api = gridApiRef.current
    let targetIndex = -1
    api.forEachNode((node) => {
      const value = (node.data as Record<string, unknown> | undefined)?.[selectedRowField]
      if (String(value ?? '') === String(selectedRowId)) {
        node.setSelected(true, true)
        targetIndex = node.rowIndex ?? -1
      }
    })
    if (targetIndex >= 0) {
      api.ensureIndexVisible(targetIndex, 'middle')
    }
  }, [rows, selectedRowField, selectedRowId])

  const saveGridState = useCallback(() => {
    if (!localStorageKey || !gridApiRef.current) return
    const api = gridApiRef.current
    const state: StoredGridState = {
      filterModel: api.getFilterModel(),
      sortModel: api.getColumnState().filter((item) => item.sort).map((item) => ({ colId: item.colId, sort: item.sort })),
      columnState: api.getColumnState().map((item) => ({
        colId: item.colId,
        width: item.width,
        hide: item.hide,
        pinned: item.pinned,
        sort: item.sort,
        sortIndex: item.sortIndex,
      })),
    }
    localStorage.setItem(localStorageKey, JSON.stringify(state))
  }, [localStorageKey])

  const queueSaveGridState = useCallback(() => {
    if (persistTimerRef.current) window.clearTimeout(persistTimerRef.current)
    persistTimerRef.current = window.setTimeout(saveGridState, 180)
  }, [saveGridState])

  const restoreGridState = useCallback(() => {
    if (!localStorageKey || !gridApiRef.current) return
    const raw = localStorage.getItem(localStorageKey)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as StoredGridState
      const api = gridApiRef.current
      if (parsed.columnState && Array.isArray(parsed.columnState)) {
        api.applyColumnState({ state: parsed.columnState as never[], applyOrder: true })
      }
      if (parsed.filterModel && typeof parsed.filterModel === 'object') {
        api.setFilterModel(parsed.filterModel as Record<string, unknown>)
      }
      api.onFilterChanged()
    } catch {
      // ignore invalid saved state
    }
  }, [localStorageKey])

  const resetGridState = useCallback(() => {
    if (!gridApiRef.current) return
    const api = gridApiRef.current
    api.setFilterModel(null)
    api.resetColumnState()
    if (localStorageKey) localStorage.removeItem(localStorageKey)
    api.onFilterChanged()
  }, [localStorageKey])

  const autoSizeColumns = useCallback(() => {
    if (!gridApiRef.current) return
    const api = gridApiRef.current
    const columns = api.getColumns() ?? []
    const allColIds = columns.map((col) => col.getColId())
    if (allColIds.length === 0) return
    api.autoSizeColumns(allColIds, false)
    queueSaveGridState()
  }, [queueSaveGridState])

  const getExportSnapshot = useCallback((): ExportSnapshot | null => {
    const api = gridApiRef.current
    if (!api) return null

    const displayedColumns = api.getAllDisplayedColumns().filter((column) => {
      const colDef = column.getColDef()
      const colId = column.getColId().toLowerCase()
      if (colId === 'select' || colId === 'aksi' || colId === 'actions') return false
      if (colDef.checkboxSelection || colDef.headerCheckboxSelection) return false
      return Boolean(colDef.field || colDef.valueGetter || colDef.headerName)
    })

    const headers = displayedColumns.map((column) => String(column.getColDef().headerName || column.getColId()))
    const exportRows: string[][] = []
    api.forEachNodeAfterFilterAndSort((node) => {
      if (!node.data) return
      exportRows.push(displayedColumns.map((column) => getExportValue(api, column, node)))
    })

    return { headers, rows: exportRows }
  }, [])

  const exportCsv = useCallback(() => {
    const snapshot = getExportSnapshot()
    if (!snapshot) return
    const csv = [snapshot.headers, ...snapshot.rows].map((row) => row.map(escapeCsvCell).join(',')).join('\n')
    downloadBlob(csv, 'text/csv;charset=utf-8', `grid-export-${Date.now()}.csv`)
  }, [getExportSnapshot])

  const exportExcel = useCallback(async () => {
    const snapshot = getExportSnapshot()
    if (!snapshot) return
    const XLSX = await import('xlsx')
    const worksheet = XLSX.utils.aoa_to_sheet([snapshot.headers, ...snapshot.rows])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
    XLSX.writeFile(workbook, `grid-export-${Date.now()}.xlsx`)
  }, [getExportSnapshot])

  const exportPdf = useCallback(async () => {
    const snapshot = getExportSnapshot()
    if (!snapshot) return
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ])
    const doc = new jsPDF({ orientation: snapshot.headers.length > 5 ? 'landscape' : 'portrait' })
    doc.setFontSize(12)
    doc.text('Data Table Export', 14, 14)
    autoTable(doc, {
      head: [snapshot.headers],
      body: snapshot.rows,
      startY: 20,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [0, 95, 95] },
    })
    doc.save(`grid-export-${Date.now()}.pdf`)
  }, [getExportSnapshot])

  const clearFiltersOnly = useCallback(() => {
    if (!gridApiRef.current) return
    gridApiRef.current.setFilterModel(null)
    gridApiRef.current.onFilterChanged()
    queueSaveGridState()
  }, [queueSaveGridState])

  const fitColumnsWidth = useCallback(() => {
    if (!gridApiRef.current) return
    gridApiRef.current.sizeColumnsToFit()
    queueSaveGridState()
  }, [queueSaveGridState])

  const normalizedColumns = useMemo(() => {
    return columns.map((col) => {
      const fieldName = typeof col.field === 'string' ? col.field.toLowerCase() : ''
      const looksNumeric = /(total|jumlah|harga|qty|nominal|sisa|diskon|admin|ongkir|grand)/.test(fieldName)
      const looksDate = /(tanggal|tgl|date|created|updated)/.test(fieldName)
      const inferredFilter = looksNumeric ? 'agNumberColumnFilter' : looksDate ? 'agDateColumnFilter' : 'agTextColumnFilter'

      const base = {
        ...col,
        filter: col.filter ?? (showAdvancedTools ? inferredFilter : false),
        filterParams: {
          debounceMs: 260,
          buttons: ['reset', 'apply'],
          closeOnApply: true,
          suppressAndOrCondition: true,
          ...(col.filterParams ?? {}),
        },
      }

      if (fieldName !== 'status' || col.cellRenderer) return base
      return {
        ...base,
        cellRenderer: (params: { value?: string }) => {
          const statusMeta = getStatusMeta(params.value)
          return <span className={`status-pill ${statusMeta.className}`}>{statusMeta.label}</span>
        },
      }
    }).map((col) => {
      if (col.cellRenderer) return col
      const fieldName = typeof col.field === 'string' ? col.field.toLowerCase() : ''
      const headerName = typeof col.headerName === 'string' ? col.headerName.toLowerCase() : ''
      const kind = resolveEntityKind(fieldName, headerName)
      if (!kind) return col
      return {
        ...col,
        minWidth: Math.max(Number(col.minWidth ?? 0), 210),
        cellRenderer: (params: { value?: unknown }) => <GridEntityCell primary={params.value} kind={kind} />,
      }
    })
  }, [columns, showAdvancedTools])

  return (
    <div>
      <div className={`ag-theme-quartz grid-shell ${compact ? 'grid-shell-compact' : ''}`} style={{ height }}>
        <AgGridReact<T>
          theme="legacy"
          rowData={rows}
          columnDefs={normalizedColumns}
          defaultColDef={{
            sortable: true,
            resizable: true,
            filter: showAdvancedTools,
            floatingFilter: showAdvancedTools && !compact,
            suppressHeaderMenuButton: !showAdvancedTools,
            suppressHeaderFilterButton: !showAdvancedTools,
            minWidth: 120,
          }}
          animateRows={shouldAnimateRows}
          rowSelection={rowSelection}
          suppressMovableColumns={false}
          enableCellTextSelection
          ensureDomOrder
          tooltipShowDelay={180}
          tooltipHideDelay={100}
          onGridReady={(event) => {
            gridApiRef.current = event.api
          }}
          onFirstDataRendered={() => {
            restoreGridState()
            if (!gridApiRef.current || hasInitialFitRef.current) return
            gridApiRef.current.sizeColumnsToFit()
            hasInitialFitRef.current = true
          }}
          onColumnMoved={queueSaveGridState}
          onColumnPinned={queueSaveGridState}
          onColumnVisible={queueSaveGridState}
          onColumnResized={queueSaveGridState}
          onSortChanged={queueSaveGridState}
          onFilterChanged={queueSaveGridState}
          loading={loading}
          onRowClicked={onRowClicked}
          overlayNoRowsTemplate={`<span style='padding:12px;color:#5b6b76;'>${t('grid.empty')}</span>`}
        />
      </div>
      {!hideUtilityActions ? (
        <div className="top-actions" style={{ marginTop: 8 }}>
          <button className="icon-btn icon-only" title={showAdvancedTools ? t('grid.advanced.hide') : t('grid.advanced.show')} aria-label={showAdvancedTools ? t('grid.advanced.hide') : t('grid.advanced.show')} onClick={() => setShowAdvancedTools((prev) => !prev)}><SlidersHorizontal size={14} /></button>
          <div className="grid-export-actions" aria-label={t('grid.export')}>
            <button className="icon-btn" title={t('grid.exportCsv')} onClick={exportCsv}><Download size={14} /> CSV</button>
            <button className="icon-btn" title={t('grid.exportExcel')} onClick={exportExcel}>Excel</button>
            <button className="icon-btn" title={t('grid.exportPdf')} onClick={exportPdf}>PDF</button>
          </div>
          {showAdvancedTools ? <button className="icon-btn icon-only" title={t('grid.reset')} aria-label={t('grid.reset')} onClick={resetGridState}><RotateCcw size={14} /></button> : null}
          {showAdvancedTools ? <button className="icon-btn icon-only" title={t('grid.clearFilters')} aria-label={t('grid.clearFilters')} onClick={clearFiltersOnly}><FilterX size={14} /></button> : null}
          {showAdvancedTools ? <button className="icon-btn icon-only" title={t('grid.autoSize')} aria-label={t('grid.autoSize')} onClick={autoSizeColumns}><Expand size={14} /></button> : null}
          {showAdvancedTools ? <button className="icon-btn icon-only" title={t('grid.fit')} aria-label={t('grid.fit')} onClick={fitColumnsWidth}><Maximize2 size={14} /></button> : null}
        </div>
      ) : null}
    </div>
  )
}
