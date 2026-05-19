import { useQuery } from '@tanstack/react-query'
import type { ApiResponse, PaginatedResponse } from '../api/types'
import { getPembayaran, getInvoicePreview, type PembayaranItem, type PembayaranQuery } from '../api/kasir'

export function usePembayaran(params: PembayaranQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['kasir', 'pembayaran', params],
    queryFn: (): Promise<ApiResponse<PaginatedResponse<PembayaranItem>>> => getPembayaran(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}

export function useInvoicePreview(idRegistrasi: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['kasir', 'invoice-preview', idRegistrasi],
    queryFn: () => getInvoicePreview(idRegistrasi as string),
    enabled: enabled && Boolean(idRegistrasi),
  })
}
