import { useEffect, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { X } from 'lucide-react'
import { useT } from '../i18n'

export function FormModal({
  open,
  title,
  description,
  icon: Icon,
  size = 'md',
  footerNote,
  className = '',
  onClose,
  children,
}: {
  open: boolean
  title: string
  description?: string
  icon?: LucideIcon
  size?: 'sm' | 'md' | 'lg'
  footerNote?: ReactNode
  className?: string
  onClose: () => void
  children: ReactNode
}) {
  const { t } = useT()
  useEffect(() => {
    if (!open) return undefined
    document.body.classList.add('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [open])

  if (!open) return null
  const modalTitleId = `modal-title-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const modalDescriptionId = description ? `${modalTitleId}-desc` : undefined
  return (
    <div className="confirm-overlay form-modal-overlay" role="dialog" aria-modal="true" aria-labelledby={modalTitleId} aria-describedby={modalDescriptionId}>
      <section className={`confirm-card form-modal-card form-modal-${size} ${className}`.trim()}>
        <div className="modal-header form-modal-header">
          <div className="form-modal-title-row">
            {Icon ? <span className="form-modal-icon"><Icon size={20} /></span> : null}
            <div>
              <h3 id={modalTitleId}>{title}</h3>
              {description ? <p id={modalDescriptionId}>{description}</p> : null}
            </div>
          </div>
          <button type="button" className="icon-btn icon-only modal-close-btn" onClick={onClose} title={t('common.closeModal')} aria-label={t('common.closeModal')}><X size={14} /></button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footerNote ? <div className="form-modal-footer-note">{footerNote}</div> : null}
      </section>
    </div>
  )
}
