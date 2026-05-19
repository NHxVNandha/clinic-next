import { apiClient } from '../lib/api-client'
import type { ApiResponse } from './types'

export type RekamMedisHistoryItem = {
  id: number
  idRm?: number
  kodeRm?: string
  idPasien?: string
  idRegistrasi?: string
  judulRm?: string
  url?: string
  tanggal?: string
  jam?: string
}

export async function getRekamMedisForms(): Promise<ApiResponse<string[]>> {
  const { data } = await apiClient.get<ApiResponse<string[]>>('/rekam-medis/forms')
  return data
}

export async function getRekamMedisHistory(params: { idPasien?: string; idRegistrasi?: string }): Promise<ApiResponse<RekamMedisHistoryItem[]>> {
  const { data } = await apiClient.get<ApiResponse<RekamMedisHistoryItem[]>>('/rekam-medis/history', { params })
  return data
}

export async function getRekamMedisByForm(formKey: string, params: { idPasien?: string; idRegistrasi?: string }): Promise<ApiResponse<Record<string, unknown>[]>> {
  const { data } = await apiClient.get<ApiResponse<Record<string, unknown>[]>>(`/rekam-medis/${formKey}`, { params })
  return data
}

export async function getRekamMedisByFormDetail(formKey: string, id: number): Promise<ApiResponse<Record<string, unknown>>> {
  const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(`/rekam-medis/${formKey}/${id}`)
  return data
}
