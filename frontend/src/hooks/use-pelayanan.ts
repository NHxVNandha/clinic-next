import { useQuery } from '@tanstack/react-query'
import type { ApiResponse, PaginatedResponse } from '../api/types'
import { getPelayanan, type PelayananItem, type PelayananQuery } from '../api/pelayanan'

export function usePelayanan(params: PelayananQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['pelayanan', params],
    queryFn: (): Promise<ApiResponse<PaginatedResponse<PelayananItem>>> => getPelayanan(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
