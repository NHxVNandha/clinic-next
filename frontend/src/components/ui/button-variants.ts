import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default: 'bg-[var(--primary)] text-[var(--primary-contrast)] shadow-sm hover:brightness-95',
        secondary: 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-muted)]',
        ghost: 'text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]',
      },
      size: {
        default: 'min-h-10 px-4 py-2',
        sm: 'min-h-9 rounded-lg px-3 text-xs',
        icon: 'h-10 w-10 px-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
