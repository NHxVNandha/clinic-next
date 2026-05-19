import { apiClient } from '../lib/api-client'
import type { ApiResponse, PaginatedResponse } from './types'

export type MasterDokter = { id: number; kdDokter: string; namaDokter?: string }
export type MasterPasien = { id: number; idPasien: string; nik: string; nama: string; noHp?: string; email?: string }
export type MasterJasa = { id: number; icd9?: string; namaJasa?: string; harga?: number; status?: number }
export type MasterDiagnosa = { id: number; kodeDiagnosa?: string; namaDiagnosa?: string; status?: number }
export type UpsertDokterRequest = { id?: number; kdDokter: string; namaDokter: string }
export type UpsertJasaRequest = { id?: number; icd9?: string; namaJasa: string; keterangan?: string; harga?: number; status?: number }
export type UpsertDiagnosaRequest = { id?: number; kodeDiagnosa: string; kodeSnomed?: string; namaDiagnosa: string; status?: number }

export type MasterSetting = { id?: number; key?: string; value?: string; description?: string }

export async function getMasterDokter(search?: string): Promise<ApiResponse<MasterDokter[]>> {
  const { data } = await apiClient.get<ApiResponse<MasterDokter[]>>('/master/dokter', { params: { search } })
  return data
}

export async function getMasterPasien(params: { page: number; pageSize: number; search?: string }): Promise<ApiResponse<PaginatedResponse<MasterPasien>>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<MasterPasien>>>('/master/pasien', { params })
  return data
}

export async function getMasterJasa(params: { page: number; pageSize: number; search?: string }): Promise<ApiResponse<PaginatedResponse<MasterJasa>>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<MasterJasa>>>('/master/jasa', { params })
  return data
}

export async function getMasterDiagnosa(params: { page: number; pageSize: number; search?: string }): Promise<ApiResponse<PaginatedResponse<MasterDiagnosa>>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<MasterDiagnosa>>>('/master/diagnosa', { params })
  return data
}

export async function upsertMasterDokter(payload: UpsertDokterRequest): Promise<ApiResponse<{ id: number }>> {
  const { data } = await apiClient.post<ApiResponse<{ id: number }>>('/master/dokter', payload)
  return data
}

export async function deleteMasterDokter(id: number): Promise<ApiResponse<{ id: number }>> {
  const { data } = await apiClient.delete<ApiResponse<{ id: number }>>(`/master/dokter/${id}`)
  return data
}

export async function upsertMasterJasa(payload: UpsertJasaRequest): Promise<ApiResponse<{ id: number }>> {
  const { data } = await apiClient.post<ApiResponse<{ id: number }>>('/master/jasa', payload)
  return data
}

export async function deleteMasterJasa(id: number): Promise<ApiResponse<{ id: number }>> {
  const { data } = await apiClient.delete<ApiResponse<{ id: number }>>(`/master/jasa/${id}`)
  return data
}

export async function upsertMasterDiagnosa(payload: UpsertDiagnosaRequest): Promise<ApiResponse<{ id: number }>> {
  const { data } = await apiClient.post<ApiResponse<{ id: number }>>('/master/diagnosa', payload)
  return data
}

export async function deleteMasterDiagnosa(id: number): Promise<ApiResponse<{ id: number }>> {
  const { data } = await apiClient.delete<ApiResponse<{ id: number }>>(`/master/diagnosa/${id}`)
  return data
}

export async function getMasterJasaDetail(id: number): Promise<ApiResponse<MasterJasa>> {
  const { data } = await apiClient.get<ApiResponse<MasterJasa>>(`/master/jasa/${id}`)
  return data
}

export async function getMasterDiagnosaDetail(id: number): Promise<ApiResponse<MasterDiagnosa>> {
  const { data } = await apiClient.get<ApiResponse<MasterDiagnosa>>(`/master/diagnosa/${id}`)
  return data
}

export async function getMasterUser(params: { page: number; pageSize: number; search?: string }): Promise<ApiResponse<PaginatedResponse<Record<string, unknown>>>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Record<string, unknown>>>>('/master/user', { params })
  return data
}

export async function getMasterUserDetail(id: number): Promise<ApiResponse<Record<string, unknown>>> {
  const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(`/master/user/${id}`)
  return data
}

export async function getMasterSetting(params: { page: number; pageSize: number; search?: string }): Promise<ApiResponse<PaginatedResponse<MasterSetting>>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<MasterSetting>>>('/master/setting', { params })
  return data
}

export async function upsertMasterSetting(payload: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>('/master/setting', payload)
  return data
}

export async function getMasterPasienDetail(id: number): Promise<ApiResponse<Record<string, unknown>>> {
  const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(`/master/pasien/${id}`)
  return data
}

export async function deleteMasterPasien(id: number): Promise<ApiResponse<{ id: number }>> {
  const { data } = await apiClient.delete<ApiResponse<{ id: number }>>(`/master/pasien/${id}`)
  return data
}

export async function getKodeWilayah(params: { search?: string }): Promise<ApiResponse<Record<string, unknown>[]>> {
  const { data } = await apiClient.get<ApiResponse<Record<string, unknown>[]>>('/master/kode-wilayah', { params })
  return data
}

export async function getKodePos(params: { search?: string }): Promise<ApiResponse<Record<string, unknown>[]>> {
  const { data } = await apiClient.get<ApiResponse<Record<string, unknown>[]>>('/master/kode-pos', { params })
  return data
}

export async function getStandartFieldGroup(): Promise<ApiResponse<Record<string, unknown>[]>> {
  const { data } = await apiClient.get<ApiResponse<Record<string, unknown>[]>>('/master/standart-field-group')
  return data
}

export async function getStandartField(params: { groupId?: string }): Promise<ApiResponse<Record<string, unknown>[]>> {
  const { data } = await apiClient.get<ApiResponse<Record<string, unknown>[]>>('/master/standart-field', { params })
  return data
}
