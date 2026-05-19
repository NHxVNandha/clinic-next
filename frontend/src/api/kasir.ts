import { apiClient } from '../lib/api-client'
import type { ApiResponse, PaginatedResponse } from './types'

export type PembayaranItem = {
  id: number
  noInvoice?: string
  idRegistrasi: string
  idPasien: string
  namaPasien?: string
  kdDokter?: string
  namaDokter?: string
  total?: number
  grandtotal?: number
  jumlahBayar?: number
  sisa?: number
  status?: string
  tglBayar?: string
}

export type PembayaranQuery = {
  page: number
  pageSize: number
  search?: string
  status?: string
  tanggal?: string
}

export async function getPembayaran(params: PembayaranQuery): Promise<ApiResponse<PaginatedResponse<PembayaranItem>>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<PembayaranItem>>>('/kasir/pembayaran', { params })
  return data
}

export async function getPembayaranDetail(id: number): Promise<ApiResponse<Record<string, unknown>>> {
  const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(`/kasir/pembayaran/${id}`)
  return data
}

export async function getInvoicePreview(idRegistrasi: string): Promise<ApiResponse<unknown>> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(`/kasir/invoice-preview/${idRegistrasi}`)
  return data
}

export type CreatePembayaranRequest = {
  idRegistrasi: string
  idPasien: string
  kdDokter: string
  total?: number
  bAdmin: number
  bTambahan: number
  bOngkir: number
  diskon: number
  jumlahBayar: number
}

export async function createPembayaran(payload: CreatePembayaranRequest): Promise<ApiResponse<{ id: number; noInvoice: string }>> {
  const { data } = await apiClient.post<ApiResponse<{ id: number; noInvoice: string }>>('/kasir/pembayaran', payload)
  return data
}

export async function bayarSisaPembayaran(id: number, bayar: number): Promise<ApiResponse<{ id: number }>> {
  const { data } = await apiClient.post<ApiResponse<{ id: number }>>(`/kasir/pembayaran/${id}/bayar-sisa`, { bayar })
  return data
}

export async function voidPembayaran(id: number): Promise<ApiResponse<{ id: number }>> {
  const { data } = await apiClient.post<ApiResponse<{ id: number }>>(`/kasir/pembayaran/${id}/void`)
  return data
}

export async function getPembayaranDetailItem(id: number): Promise<ApiResponse<Record<string, unknown>[]>> {
  const { data } = await apiClient.get<ApiResponse<Record<string, unknown>[]>>(`/kasir/pembayaran/${id}/detail-item`)
  return data
}

export async function createPembayaranDetailItem(id: number, payload: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/kasir/pembayaran/${id}/detail-item`, payload)
  return data
}

export async function getPengeluaran(params: { page: number; pageSize: number; search?: string }): Promise<ApiResponse<PaginatedResponse<Record<string, unknown>>>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Record<string, unknown>>>>('/kasir/pengeluaran', { params })
  return data
}

export async function getPengeluaranDetail(id: number): Promise<ApiResponse<Record<string, unknown>>> {
  const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(`/kasir/pengeluaran/${id}`)
  return data
}

export async function createPengeluaran(payload: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>('/kasir/pengeluaran', payload)
  return data
}

export async function deletePengeluaranDetail(id: number, detailId: number): Promise<ApiResponse<{ id: number; detailId: number }>> {
  const { data } = await apiClient.delete<ApiResponse<{ id: number; detailId: number }>>(`/kasir/pengeluaran/${id}/detail/${detailId}`)
  return data
}
