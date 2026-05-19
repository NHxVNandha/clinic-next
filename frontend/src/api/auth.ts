import { apiClient } from '../lib/api-client'
import type { ApiResponse } from './types'

export type LoginRequest = {
  email: string
  password: string
}

export type LoginUser = {
  id: number
  name: string
  email: string
  roleId?: number
  role: string
}

export type LoginResponseData = {
  accessToken: string
  refreshToken: string
  expiresAtUtc: string
  tokenType: string
  user: LoginUser
}

export type RefreshRequest = {
  refreshToken: string
}

export type LogoutRequest = {
  refreshToken: string
}

export type SessionItem = {
  id: number
  deviceName?: string
  userAgent?: string
  ipAddress?: string
  createdAt?: string
  expiresAt?: string
  revokedAt?: string
  isActive?: boolean
}

export async function login(payload: LoginRequest): Promise<ApiResponse<LoginResponseData>> {
  const { data } = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', payload)
  return data
}

export async function me(): Promise<ApiResponse<LoginUser>> {
  const { data } = await apiClient.get<ApiResponse<LoginUser>>('/auth/me')
  return data
}

export async function refresh(payload: RefreshRequest): Promise<ApiResponse<LoginResponseData>> {
  const { data } = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/refresh', payload)
  return data
}

export async function logout(payload: LogoutRequest): Promise<ApiResponse<Record<string, never>>> {
  const { data } = await apiClient.post<ApiResponse<Record<string, never>>>('/auth/logout', payload)
  return data
}

export async function getSessions(): Promise<ApiResponse<SessionItem[]>> {
  const { data } = await apiClient.get<ApiResponse<SessionItem[]>>('/auth/sessions')
  return data
}

export async function revokeAllSessions(): Promise<ApiResponse<{ revoked: number }>> {
  const { data } = await apiClient.post<ApiResponse<{ revoked: number }>>('/auth/revoke-all')
  return data
}
