import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function FormModal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}) {
  if (!open) return null
  const modalTitleId = `modal-title-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const modalDescriptionId = description ? `${modalTitleId}-desc` : undefined
  return (
    <div className="confirm-overlay" role="dialog" aria-modal="true" aria-labelledby={modalTitleId} aria-describedby={modalDescriptionId}>
      <section className="confirm-card form-modal-card">
        <div className="top-actions modal-header">
          <h3 id={modalTitleId} style={{ margin: 0 }}>{title}</h3>
          <button type="button" className="icon-btn icon-only modal-close-btn" onClick={onClose} title="Tutup modal" aria-label="Tutup modal"><X size={14} /></button>
        </div>
        <div className="modal-body">
          {description ? <p id={modalDescriptionId}>{description}</p> : null}
          {children}
        </div>
      </section>
    </div>
  )
}
