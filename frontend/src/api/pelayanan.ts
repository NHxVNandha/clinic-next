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

function toRows(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return normalizeRows(value as Record<string, unknown>[])
  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>
    const details = source.details ?? source.Details
    if (Array.isArray(details)) return normalizeRows(details as Record<string, unknown>[])
  }
  return []
}

function normalizeRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((row) => ({
    ...row,
    detailId: row.detailId ?? row.id ?? row.Id,
    nama: row.nama ?? row.Nama ?? row.jasa ?? row.Jasa ?? row.namaObat ?? row.NamaObat,
    qty: row.qty ?? row.Qty ?? row.jumlah ?? row.Jumlah,
    harga: row.harga ?? row.Harga,
    total: row.total ?? row.Total,
  }))
}

function toDetailIdResponse(response: ApiResponse<unknown>, detailId: number): ApiResponse<{ detailId: number }> {
  return { ...response, data: { detailId } } as ApiResponse<{ detailId: number }>
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
  const { data } = await apiClient.get<ApiResponse<unknown>>(`/pelayanan/${idRegistrasi}/tindakan`)
  return { ...data, data: toRows(data.data) }
}

export async function createPelayananTindakan(idRegistrasi: string, payload: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  const item = {
    idJasa: Number(payload.idJasa ?? 0),
    harga: Number(payload.harga ?? 0),
    jumlah: Number(payload.qty ?? payload.jumlah ?? 1),
  }
  const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/pelayanan/${idRegistrasi}/tindakan`, { items: [item] })
  return data
}

export async function updatePelayananTindakan(idRegistrasi: string, tindakanId: number, payload: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  const { data } = await apiClient.put<ApiResponse<Record<string, unknown>>>(`/pelayanan/${idRegistrasi}/tindakan/${tindakanId}`, payload)
  return data
}

export async function deletePelayananTindakan(idRegistrasi: string, detailId: number): Promise<ApiResponse<{ detailId: number }>> {
  const { data } = await apiClient.delete<ApiResponse<unknown>>(`/pelayanan/${idRegistrasi}/tindakan/${detailId}`)
  return toDetailIdResponse(data, detailId)
}

export async function getPelayananResep(idRegistrasi: string): Promise<ApiResponse<Record<string, unknown>[]>> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(`/pelayanan/${idRegistrasi}/resep`)
  return { ...data, data: toRows(data.data) }
}

export async function createPelayananResep(idRegistrasi: string, payload: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  const item = {
    namaObat: String(payload.namaObat ?? payload.nama ?? '').trim(),
    dosis: String(payload.dosis ?? '-').trim() || '-',
    harga: Number(payload.harga ?? 0),
    jumlah: Number(payload.qty ?? payload.jumlah ?? 1),
  }
  const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/pelayanan/${idRegistrasi}/resep`, { items: [item] })
  return data
}

export async function deletePelayananResep(idRegistrasi: string, detailId: number): Promise<ApiResponse<{ detailId: number }>> {
  const { data } = await apiClient.delete<ApiResponse<unknown>>(`/pelayanan/${idRegistrasi}/resep/${detailId}`)
  return toDetailIdResponse(data, detailId)
}

export async function getPelayananAlkes(idRegistrasi: string): Promise<ApiResponse<Record<string, unknown>[]>> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(`/pelayanan/${idRegistrasi}/alkes`)
  return { ...data, data: toRows(data.data) }
}

export async function createPelayananAlkes(idRegistrasi: string, payload: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  const item = {
    nama: String(payload.nama ?? '').trim(),
    harga: Number(payload.harga ?? 0),
    jumlah: Number(payload.qty ?? payload.jumlah ?? 1),
  }
  const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/pelayanan/${idRegistrasi}/alkes`, { items: [item] })
  return data
}

export async function deletePelayananAlkes(idRegistrasi: string, detailId: number): Promise<ApiResponse<{ detailId: number }>> {
  const { data } = await apiClient.delete<ApiResponse<unknown>>(`/pelayanan/${idRegistrasi}/alkes/${detailId}`)
  return toDetailIdResponse(data, detailId)
}

export async function getPelayananLaboratorium(idRegistrasi: string): Promise<ApiResponse<Record<string, unknown>[]>> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(`/pelayanan/${idRegistrasi}/laboratorium`)
  return { ...data, data: toRows(data.data) }
}

export async function createPelayananLaboratorium(idRegistrasi: string, payload: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  const item = {
    nama: String(payload.nama ?? '').trim(),
    harga: Number(payload.harga ?? 0),
    jumlah: Number(payload.qty ?? payload.jumlah ?? 1),
  }
  const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/pelayanan/${idRegistrasi}/laboratorium`, { items: [item] })
  return data
}

export async function deletePelayananLaboratorium(idRegistrasi: string, detailId: number): Promise<ApiResponse<{ detailId: number }>> {
  const { data } = await apiClient.delete<ApiResponse<unknown>>(`/pelayanan/${idRegistrasi}/laboratorium/${detailId}`)
  return toDetailIdResponse(data, detailId)
}

export async function getPelayananRadiologi(idRegistrasi: string): Promise<ApiResponse<Record<string, unknown>[]>> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(`/pelayanan/${idRegistrasi}/radiologi`)
  return { ...data, data: toRows(data.data) }
}

export async function createPelayananRadiologi(idRegistrasi: string, payload: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  const item = {
    nama: String(payload.nama ?? '').trim(),
    harga: Number(payload.harga ?? 0),
    jumlah: Number(payload.qty ?? payload.jumlah ?? 1),
  }
  const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/pelayanan/${idRegistrasi}/radiologi`, { items: [item] })
  return data
}

export async function deletePelayananRadiologi(idRegistrasi: string, detailId: number): Promise<ApiResponse<{ detailId: number }>> {
  const { data } = await apiClient.delete<ApiResponse<unknown>>(`/pelayanan/${idRegistrasi}/radiologi/${detailId}`)
  return toDetailIdResponse(data, detailId)
}
