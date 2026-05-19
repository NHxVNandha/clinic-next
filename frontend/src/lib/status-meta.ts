export type StatusMeta = {
  label: string
  className: string
}

export function getStatusMeta(status?: string | number | null): StatusMeta {
  const code = String(status ?? '')
  if (code === '1') return { label: 'Menunggu', className: 'status-menunggu' }
  if (code === '2') return { label: 'Dilayani', className: 'status-dilayani' }
  if (code === '3') return { label: 'Selesai', className: 'status-selesai' }
  if (code === '4') return { label: 'Dibatalkan', className: 'status-dibatalkan' }
  return { label: code || '-', className: 'status-menunggu' }
}
