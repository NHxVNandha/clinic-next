import type { ComponentType } from 'react'
import { Activity, ClipboardList, CreditCard, FileBarChart2, FolderHeart, Settings } from 'lucide-react'

export type AppRoute = {
  path: string
  label: string
  description: string
  icon: ComponentType<{ size?: number }>
  allowedRoles?: string[]
}

export const appRoutes: AppRoute[] = [
  { path: '/dashboard', label: 'Dashboard', description: 'Ringkasan klinik harian', icon: Activity },
  { path: '/pendaftaran', label: 'Pendaftaran', description: 'Kelola alur pendaftaran pasien', icon: ClipboardList, allowedRoles: ['admin', 'superadmin', 'frontoffice'] },
  { path: '/pelayanan', label: 'Pelayanan', description: 'Antrian, tindakan, resep, dan penunjang', icon: Activity, allowedRoles: ['admin', 'superadmin', 'dokter', 'perawat'] },
  { path: '/kasir', label: 'Kasir', description: 'Pembayaran pasien dan pengeluaran', icon: CreditCard, allowedRoles: ['admin', 'superadmin', 'kasir'] },
  { path: '/laporan', label: 'Laporan', description: 'Rekap layanan dan transaksi', icon: FileBarChart2 },
  { path: '/master', label: 'Master', description: 'Data referensi dan pengaturan aplikasi', icon: Settings, allowedRoles: ['admin', 'superadmin'] },
  { path: '/rekam-medis', label: 'Rekam Medis', description: 'Riwayat dan surat rekam medis pasien', icon: FolderHeart, allowedRoles: ['admin', 'superadmin', 'dokter', 'perawat'] },
]
