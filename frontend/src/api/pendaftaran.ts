import { apiClient } from '../lib/api-client'
import type { ApiResponse, PaginatedResponse } from './types'

export type PendaftaranItem = {
  id: number
  idRegistrasi: string
  tanggal: string
  status: string
  kdDokter: string
  pasienId: number
  idPasien: string
  nik: string
  namaPasien: string
  dokterNama?: string
}

export type PendaftaranQuery = {
  page: number
  pageSize: number
  search?: string
  status?: string
  tanggal?: string
}

export type CreatePendaftaranRequest = {
  idPasien: string
  kdDokter: string
  tanggal?: string
  keluhan?: string
}

export type CreatePasienBaruRequest = {
  nama: string
  nik: string
  tanggalLahir?: string
  jenisKelamin?: string
  alamat?: string
  noHp?: string
  email?: string
  kdDokter: string
  keluhan?: string
}

export async function getPendaftaran(params: PendaftaranQuery): Promise<ApiResponse<PaginatedResponse<PendaftaranItem>>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<PendaftaranItem>>>('/pendaftaran', { params })
  return data
}

export async function voidPendaftaran(idRegistrasi: string): Promise<ApiResponse<{ idRegistrasi: string }>> {
  const { data } = await apiClient.post<ApiResponse<{ idRegistrasi: string }>>(`/pendaftaran/${idRegistrasi}/void`)
  return data
}

export async function getPendaftaranDetail(id: number): Promise<ApiResponse<Record<string, unknown>>> {
  const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(`/pendaftaran/${id}`)
  return data
}

export async function createPendaftaran(payload: CreatePendaftaranRequest): Promise<ApiResponse<Record<string, unknown>>> {
  const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>('/pendaftaran', payload)
  return data
}

export async function createPendaftaranPasienBaru(payload: CreatePasienBaruRequest): Promise<ApiResponse<Record<string, unknown>>> {
  const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>('/pendaftaran/pasien-baru', payload)
  return data
}

export async function pulangPendaftaran(idRegistrasi: string): Promise<ApiResponse<{ idRegistrasi: string }>> {
  const { data } = await apiClient.post<ApiResponse<{ idRegistrasi: string }>>(`/pendaftaran/${idRegistrasi}/pulang`)
  return data
}
