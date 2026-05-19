import { apiClient } from '../lib/api-client'
import type { ApiResponse, PaginatedResponse } from './types'

export type LaporanItem = Record<string, unknown>

export type LaporanQuery = {
  page: number
  pageSize: number
  search?: string
  status?: string
  kdDokter?: string
  tanggal?: string
  fromDate?: string
  toDate?: string
}

export async function getLaporanTindakan(params: LaporanQuery): Promise<ApiResponse<PaginatedResponse<LaporanItem>>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<LaporanItem>>>('/laporan/tindakan', { params })
  return data
}

export async function getLaporanPembayaran(params: LaporanQuery): Promise<ApiResponse<PaginatedResponse<LaporanItem>>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<LaporanItem>>>('/laporan/pembayaran', { params })
  return data
}

export async function getLaporanPendaftaran(params: LaporanQuery): Promise<ApiResponse<PaginatedResponse<LaporanItem>>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<LaporanItem>>>('/laporan/pendaftaran', { params })
  return data
}
