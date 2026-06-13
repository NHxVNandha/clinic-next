import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { X } from 'lucide-react'
import { useT } from '../i18n'
import { cn } from '../lib/utils'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'

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
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose() }}>
      <DialogContent
        data-size={size}
        className={cn(
          '[&_.field-label]:text-[0.75rem] [&_.field-label]:font-[650] [&_.field-label]:uppercase [&_.field-label]:tracking-[0.025em] [&_.field-label]:text-[color-mix(in_srgb,var(--text)_76%,var(--text-muted))]',
          '[&_.field-helper]:text-[0.76rem] [&_.field-helper]:font-medium [&_.field-helper]:leading-snug [&_.field-helper]:tracking-normal',
          '[&_.form-grid]:gap-x-[18px] [&_.form-grid]:gap-y-3.5 [&_.form-grid]:!mt-0',
          '[&_.search-input]:h-11 [&_.search-input]:min-h-11 [&_.search-input]:rounded-[10px] [&_.search-input]:border-[var(--border)] [&_.search-input]:bg-[var(--surface)] [&_.search-input]:text-[0.88rem] [&_.search-input]:font-normal [&_.search-input]:tracking-normal [&_.search-input]:text-[var(--text)]',
          '[&_input]:text-[0.88rem] [&_select]:text-[0.88rem] [&_textarea]:text-[0.88rem]',
          '[&_.confirm-actions]:mx-[-1.5rem] [&_.confirm-actions]:mb-[-1.25rem] [&_.confirm-actions]:border-t [&_.confirm-actions]:border-[var(--border)] [&_.confirm-actions]:bg-[color-mix(in_srgb,var(--surface-muted)_52%,var(--surface))] [&_.confirm-actions]:px-6 [&_.confirm-actions]:py-3.5 max-sm:[&_.confirm-actions]:mx-[-1rem] max-sm:[&_.confirm-actions]:px-4',
          className,
        )}
        showCloseButton={false}
      >
        <div className="flex items-start justify-between gap-5 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-muted)_44%,var(--surface))] px-6 py-4 max-sm:px-4">
          <DialogHeader className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              {Icon ? <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-fixed)] text-[var(--primary)]"><Icon size={20} /></span> : null}
              <div className="min-w-0">
                <DialogTitle>{title}</DialogTitle>
                {description ? <DialogDescription className="mt-1">{description}</DialogDescription> : null}
              </div>
            </div>
          </DialogHeader>
          <DialogClose className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]" title={t('common.closeModal')} aria-label={t('common.closeModal')}>
            <X size={14} />
          </DialogClose>
        </div>
        <div className="grid flex-1 gap-4 overflow-y-auto px-6 py-5 max-sm:px-4">
          {children}
        </div>
        {footerNote ? <div className="border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-muted)_46%,var(--surface))] px-6 py-2.5 text-xs leading-5 text-[var(--text-soft)] max-sm:px-4">{footerNote}</div> : null}
      </DialogContent>
    </Dialog>
  )
}
