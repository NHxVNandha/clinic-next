import { useMemo, useState } from 'react'

function getAuditClass(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('dihapus') || lower.includes('dibatalkan')) return 'audit-danger'
  if (lower.includes('disimpan') || lower.includes('ditambahkan') || lower.includes('dibuat')) return 'audit-success'
  if (lower.includes('diubah') || lower.includes('dipilih')) return 'audit-info'
  return 'audit-neutral'
}

export function ActionAuditNote({
  message,
  history = [],
  onClear,
  onCopy,
  onDownload,
  onDownloadCsv,
  metrics,
  compact,
  allowAdminTools = true,
}: {
  message: string
  history?: string[]
  onClear?: () => void
  onCopy?: () => void
  onDownload?: () => void
  onDownloadCsv?: () => void
  metrics?: { total: number; destructive: number }
  compact?: boolean
  allowAdminTools?: boolean
}) {
  const [showDestructiveOnly, setShowDestructiveOnly] = useState(false)

  const renderedHistory = useMemo(() => {
    const source = history.slice(1)
    if (!showDestructiveOnly) return source
    return source.filter((item) => {
      const lower = item.toLowerCase()
      return lower.includes('dihapus') || lower.includes('dibatalkan')
    })
  }, [history, showDestructiveOnly])

  return (
    <div>
      <div className="top-actions" style={{ marginTop: 4 }}>
        <p className="empty-note" style={{ margin: 0 }}>Aksi terakhir: <span className={`audit-chip ${getAuditClass(message)}`}>{message}</span></p>
        <button className="icon-btn" onClick={() => setShowDestructiveOnly((prev) => !prev)}>
          {showDestructiveOnly ? 'Semua Riwayat' : 'Aksi Penting'}
        </button>
        {allowAdminTools && onCopy ? <button className="icon-btn" onClick={onCopy}>Copy Riwayat</button> : null}
        {allowAdminTools && onDownload ? <button className="icon-btn" onClick={onDownload}>Download .txt</button> : null}
        {allowAdminTools && onDownloadCsv ? <button className="icon-btn" onClick={onDownloadCsv}>Download .csv</button> : null}
        {allowAdminTools && onClear ? <button className="icon-btn" onClick={onClear}>Clear Riwayat</button> : null}
      </div>
      {!compact && metrics ? <p className="kbd-hint">Total aksi: {metrics.total} | Penting: {metrics.destructive}</p> : null}
      {!compact && renderedHistory.length > 0 ? (
        <div className="filter-chip-wrap" style={{ marginTop: 6 }}>
          {renderedHistory.map((item) => (
            <span key={item} className={`filter-chip ${getAuditClass(item)}`}>
              {item}
            </span>
          ))}
        </div>
      ) : null}
      {compact && renderedHistory.length > 0 ? (
        <details className="detail-system" style={{ marginTop: 6 }}>
          <summary>Riwayat</summary>
          <div className="filter-chip-wrap" style={{ marginTop: 6 }}>
            {renderedHistory.map((item) => (
              <span key={item} className={`filter-chip ${getAuditClass(item)}`}>
                {item}
              </span>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  )
}
