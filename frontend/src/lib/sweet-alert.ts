import Swal from 'sweetalert2'

type ConfirmOptions = {
  title: string
  text: string
  confirmText: string
  cancelText?: string
  danger?: boolean
}

export async function confirmThemedAction(options: ConfirmOptions): Promise<boolean> {
  const isDark = document.documentElement.dataset.theme === 'dark'
  const result = await Swal.fire({
    title: options.title,
    text: options.text,
    icon: options.danger ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonText: options.confirmText,
    cancelButtonText: options.cancelText || 'Batal',
    reverseButtons: true,
    customClass: {
      popup: isDark ? 'swal-theme-dark' : 'swal-theme-light',
      confirmButton: options.danger ? 'swal-btn-danger' : 'swal-btn-primary',
      cancelButton: 'swal-btn-cancel',
    },
    buttonsStyling: false,
  })
  return Boolean(result.isConfirmed)
}
