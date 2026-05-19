import { useQuery } from '@tanstack/react-query'
import { getPendaftaran, type PendaftaranQuery } from '../api/pendaftaran'
import type { ApiResponse, PaginatedResponse } from '../api/types'
import type { PendaftaranItem } from '../api/pendaftaran'

export function usePendaftaran(params: PendaftaranQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['pendaftaran', params],
    queryFn: (): Promise<ApiResponse<PaginatedResponse<PendaftaranItem>>> => getPendaftaran(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
