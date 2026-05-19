import { apiClient } from '../lib/api-client'
import type { ApiResponse, PaginatedResponse } from './types'

export type PelayananItem = {
  id: number
  idRegistrasi: string
  tanggal: string
  status: string
  kdDokter: string
  idPasien: string
  nik: string
  namaPasien: string
  dokterNama?: string
}

export type PelayananQuery = {
  page: number
  pageSize: number
  search?: string
  status?: string
  tanggal?: string
}

export async function getPelayanan(params: PelayananQuery): Promise<ApiResponse<PaginatedResponse<PelayananItem>>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<PelayananItem>>>('/pelayanan', { params })
  return data
}

export async function getPelayananDetail(idRegistrasi: string): Promise<ApiResponse<Record<string, unknown>>> {
  const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(`/pelayanan/${idRegistrasi}`)
  return data
}

export async function getPelayananTindakan(idRegistrasi: string): Promise<ApiResponse<Record<string, unknown>[]>> {
  const { data } = await apiClient.get<ApiResponse<Record<string, unknown>[]>>(`/pelayanan/${idRegistrasi}/tindakan`)
  return data
}

export async function createPelayananTindakan(idRegistrasi: string, payload: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/pelayanan/${idRegistrasi}/tindakan`, payload)
  return data
}

export async function updatePelayananTindakan(idRegistrasi: string, tindakanId: number, payload: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  const { data } = await apiClient.put<ApiResponse<Record<string, unknown>>>(`/pelayanan/${idRegistrasi}/tindakan/${tindakanId}`, payload)
  return data
}

export async function deletePelayananTindakan(idRegistrasi: string, detailId: number): Promise<ApiResponse<{ detailId: number }>> {
  const { data } = await apiClient.delete<ApiResponse<{ detailId: number }>>(`/pelayanan/${idRegistrasi}/tindakan/${detailId}`)
  return data
}

export async function getPelayananResep(idRegistrasi: string): Promise<ApiResponse<Record<string, unknown>[]>> {
  const { data } = await apiClient.get<ApiResponse<Record<string, unknown>[]>>(`/pelayanan/${idRegistrasi}/resep`)
  return data
}

export async function createPelayananResep(idRegistrasi: string, payload: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/pelayanan/${idRegistrasi}/resep`, payload)
  return data
}

export async function deletePelayananResep(idRegistrasi: string, detailId: number): Promise<ApiResponse<{ detailId: number }>> {
  const { data } = await apiClient.delete<ApiResponse<{ detailId: number }>>(`/pelayanan/${idRegistrasi}/resep/${detailId}`)
  return data
}

export async function getPelayananAlkes(idRegistrasi: string): Promise<ApiResponse<Record<string, unknown>[]>> {
  const { data } = await apiClient.get<ApiResponse<Record<string, unknown>[]>>(`/pelayanan/${idRegistrasi}/alkes`)
  return data
}

export async function createPelayananAlkes(idRegistrasi: string, payload: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/pelayanan/${idRegistrasi}/alkes`, payload)
  return data
}

export async function deletePelayananAlkes(idRegistrasi: string, detailId: number): Promise<ApiResponse<{ detailId: number }>> {
  const { data } = await apiClient.delete<ApiResponse<{ detailId: number }>>(`/pelayanan/${idRegistrasi}/alkes/${detailId}`)
  return data
}

export async function getPelayananLaboratorium(idRegistrasi: string): Promise<ApiResponse<Record<string, unknown>[]>> {
  const { data } = await apiClient.get<ApiResponse<Record<string, unknown>[]>>(`/pelayanan/${idRegistrasi}/laboratorium`)
  return data
}

export async function createPelayananLaboratorium(idRegistrasi: string, payload: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/pelayanan/${idRegistrasi}/laboratorium`, payload)
  return data
}

export async function deletePelayananLaboratorium(idRegistrasi: string, detailId: number): Promise<ApiResponse<{ detailId: number }>> {
  const { data } = await apiClient.delete<ApiResponse<{ detailId: number }>>(`/pelayanan/${idRegistrasi}/laboratorium/${detailId}`)
  return data
}

export async function getPelayananRadiologi(idRegistrasi: string): Promise<ApiResponse<Record<string, unknown>[]>> {
  const { data } = await apiClient.get<ApiResponse<Record<string, unknown>[]>>(`/pelayanan/${idRegistrasi}/radiologi`)
  return data
}

export async function createPelayananRadiologi(idRegistrasi: string, payload: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/pelayanan/${idRegistrasi}/radiologi`, payload)
  return data
}

export async function deletePelayananRadiologi(idRegistrasi: string, detailId: number): Promise<ApiResponse<{ detailId: number }>> {
  const { data } = await apiClient.delete<ApiResponse<{ detailId: number }>>(`/pelayanan/${idRegistrasi}/radiologi/${detailId}`)
  return data
}
