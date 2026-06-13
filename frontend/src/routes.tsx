import type { ComponentType } from 'react'
import { Activity, ClipboardList, CreditCard, FileBarChart2, FolderHeart, Settings, SlidersHorizontal } from 'lucide-react'

export type AppRoute = {
  path: string
  label: string
  description: string
  icon: ComponentType<{ size?: number }>
  permissionKey?: string
  allowedRoles?: string[]
}

export const appRoutes: AppRoute[] = [
  { path: '/dashboard', label: 'Dashboard', description: 'Ringkasan klinik harian', icon: Activity, permissionKey: 'menu.dashboard' },
  { path: '/pendaftaran', label: 'Pendaftaran', description: 'Kelola alur pendaftaran pasien', icon: ClipboardList, permissionKey: 'menu.pendaftaran', allowedRoles: ['admin', 'superadmin', 'frontoffice'] },
  { path: '/pelayanan', label: 'Pelayanan', description: 'Antrian, tindakan, resep, dan penunjang', icon: Activity, permissionKey: 'menu.pelayanan', allowedRoles: ['admin', 'superadmin', 'dokter', 'perawat'] },
  { path: '/kasir', label: 'Kasir', description: 'Pembayaran pasien dan pengeluaran', icon: CreditCard, permissionKey: 'menu.kasir', allowedRoles: ['admin', 'superadmin', 'kasir'] },
  { path: '/laporan', label: 'Laporan', description: 'Rekap layanan dan transaksi', icon: FileBarChart2, permissionKey: 'menu.laporan' },
  { path: '/master', label: 'Master', description: 'Data referensi dan pengaturan aplikasi', icon: Settings, permissionKey: 'menu.master', allowedRoles: ['admin', 'superadmin'] },
  { path: '/rekam-medis', label: 'Rekam Medis', description: 'Riwayat dan surat rekam medis pasien', icon: FolderHeart, permissionKey: 'menu.rekam-medis', allowedRoles: ['admin', 'superadmin', 'dokter', 'perawat'] },
  { path: '/pengaturan', label: 'Pengaturan', description: 'Konfigurasi sistem dan akses pengguna', icon: SlidersHorizontal, permissionKey: 'menu.pengaturan', allowedRoles: ['admin', 'superadmin'] },
]
