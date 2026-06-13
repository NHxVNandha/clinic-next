import { getAuthUser } from './storage'

type ActionPermission = {
  roles: string[]
  reason: string
  permissionKey: string
}

const ACTION_PERMISSIONS: Record<string, ActionPermission> = {
  pendaftaranCreate: {
    roles: ['admin', 'superadmin', 'frontoffice'],
    reason: 'Hanya admin/superadmin/frontoffice yang dapat membuat pendaftaran.',
    permissionKey: 'menu.pendaftaran',
  },
  destructiveActions: {
    roles: ['admin', 'superadmin', 'kasir'],
    reason: 'Aksi ini hanya tersedia untuk admin/superadmin/kasir.',
    permissionKey: 'menu.kasir',
  },
  pelayananDetailsManage: {
    roles: ['admin', 'superadmin', 'dokter', 'perawat'],
    reason: 'Aksi detail pelayanan hanya tersedia untuk admin/superadmin/dokter/perawat.',
    permissionKey: 'menu.pelayanan',
  },
  kasirPaymentsManage: {
    roles: ['admin', 'superadmin', 'kasir'],
    reason: 'Aksi pembayaran kasir hanya tersedia untuk admin/superadmin/kasir.',
    permissionKey: 'menu.kasir',
  },
  kasirPengeluaranManage: {
    roles: ['admin', 'superadmin', 'kasir'],
    reason: 'Aksi pengeluaran kasir hanya tersedia untuk admin/superadmin/kasir.',
    permissionKey: 'menu.kasir',
  },
}

export function getCurrentUserRole(): string {
  return String(getAuthUser()?.role || '').toLowerCase()
}

export function canManageDestructiveActions(): boolean {
  return getActionAccess('destructiveActions').allowed
}

export function canAccessRoute(allowedRoles?: string[]): boolean {
  return canAccessPermission(undefined, allowedRoles)
}

export function canAccessPermission(permissionKey?: string, allowedRoles?: string[]): boolean {
  const authUser = getAuthUser()
  const permissions = authUser?.permissions ?? []
  if (permissionKey && permissions.length > 0) {
    return permissions.includes(permissionKey)
  }

  if (!allowedRoles || allowedRoles.length === 0) return true
  const role = getCurrentUserRole()
  if (!role) return true
  return allowedRoles.map((r) => r.toLowerCase()).includes(role)
}

export function getActionAccess(action: keyof typeof ACTION_PERMISSIONS): { allowed: boolean; reason: string } {
  const rule = ACTION_PERMISSIONS[action]
  if (canAccessPermission(rule.permissionKey, rule.roles)) {
    return { allowed: true, reason: '' }
  }

  const role = getCurrentUserRole()
  if (!role) return { allowed: true, reason: '' }
  const allowed = rule.roles.map((r) => r.toLowerCase()).includes(role)
  return { allowed, reason: allowed ? '' : rule.reason }
}

export function canCreatePendaftaran(): boolean {
  return getActionAccess('pendaftaranCreate').allowed
}

export function canManagePelayananDetails(): boolean {
  return getActionAccess('pelayananDetailsManage').allowed
}

export function canManageKasirPayments(): boolean {
  return getActionAccess('kasirPaymentsManage').allowed
}

export function canManageKasirPengeluaran(): boolean {
  return getActionAccess('kasirPengeluaranManage').allowed
}
