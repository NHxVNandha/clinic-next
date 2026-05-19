import { useQuery } from '@tanstack/react-query'
import type { ApiResponse, PaginatedResponse } from '../api/types'
import { getLaporanPendaftaran, getLaporanPembayaran, getLaporanTindakan, type LaporanItem, type LaporanQuery } from '../api/laporan'

export function useLaporanTindakan(params: LaporanQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['laporan', 'tindakan', params],
    queryFn: (): Promise<ApiResponse<PaginatedResponse<LaporanItem>>> => getLaporanTindakan(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}

export function useLaporanPembayaran(params: LaporanQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['laporan', 'pembayaran', params],
    queryFn: (): Promise<ApiResponse<PaginatedResponse<LaporanItem>>> => getLaporanPembayaran(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}

export function useLaporanPendaftaran(params: LaporanQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['laporan', 'pendaftaran', params],
    queryFn: (): Promise<ApiResponse<PaginatedResponse<LaporanItem>>> => getLaporanPendaftaran(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
