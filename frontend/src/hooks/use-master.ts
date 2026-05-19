import { useQuery } from '@tanstack/react-query'
import { getMasterDiagnosa, getMasterDokter, getMasterJasa, getMasterPasien } from '../api/master'

export function useMasterDokter(search: string, enabled: boolean) {
  return useQuery({
    queryKey: ['master', 'dokter', search],
    queryFn: () => getMasterDokter(search || undefined),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}

export function useMasterPasien(page: number, pageSize: number, search: string, enabled: boolean) {
  return useQuery({
    queryKey: ['master', 'pasien', page, pageSize, search],
    queryFn: () => getMasterPasien({ page, pageSize, search: search || undefined }),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}

export function useMasterJasa(page: number, pageSize: number, search: string, enabled: boolean) {
  return useQuery({
    queryKey: ['master', 'jasa', page, pageSize, search],
    queryFn: () => getMasterJasa({ page, pageSize, search: search || undefined }),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}

export function useMasterDiagnosa(page: number, pageSize: number, search: string, enabled: boolean) {
  return useQuery({
    queryKey: ['master', 'diagnosa', page, pageSize, search],
    queryFn: () => getMasterDiagnosa({ page, pageSize, search: search || undefined }),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
