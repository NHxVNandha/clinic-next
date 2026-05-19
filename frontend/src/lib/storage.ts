const ACCESS_TOKEN_KEY = 'clinic-next-access-token'
const AUTH_USER_KEY = 'clinic-next-auth-user'

export type StoredAuthUser = {
  id?: number
  name?: string
  email?: string
  role?: string
  roleId?: number
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function setAuthUser(user: StoredAuthUser): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function getAuthUser(): StoredAuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredAuthUser
  } catch {
    return null
  }
}

export function clearAuthUser(): void {
  localStorage.removeItem(AUTH_USER_KEY)
}
