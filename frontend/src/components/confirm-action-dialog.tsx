import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'

export type ConfirmActionOptions = {
  title: string
  text: string
  confirmText: string
  cancelText?: string
  danger?: boolean
}

export function ConfirmActionDialog({ options, onDone }: { options: ConfirmActionOptions; onDone: (confirmed: boolean) => void }) {
  return (
    <AlertDialog open onOpenChange={(open) => { if (!open) onDone(false) }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          <AlertDialogDescription>{options.text}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onDone(false)}>{options.cancelText || 'Batal'}</AlertDialogCancel>
          <AlertDialogAction className={options.danger ? 'bg-[var(--danger-strong)] text-[var(--danger-contrast)] hover:brightness-95' : undefined} onClick={() => onDone(true)}>
            {options.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
