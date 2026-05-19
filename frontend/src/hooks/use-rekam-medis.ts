import { useQuery } from '@tanstack/react-query'
import { getRekamMedisByForm, getRekamMedisForms, getRekamMedisHistory } from '../api/rekam-medis'

export function useRekamMedisForms(enabled: boolean) {
  return useQuery({
    queryKey: ['rekam-medis', 'forms'],
    queryFn: getRekamMedisForms,
    enabled,
  })
}

export function useRekamMedisHistory(params: { idPasien?: string; idRegistrasi?: string }, enabled: boolean) {
  return useQuery({
    queryKey: ['rekam-medis', 'history', params],
    queryFn: () => getRekamMedisHistory(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}

export function useRekamMedisByForm(formKey: string | null, params: { idPasien?: string; idRegistrasi?: string }, enabled: boolean) {
  return useQuery({
    queryKey: ['rekam-medis', 'form', formKey, params],
    queryFn: () => getRekamMedisByForm(formKey as string, params),
    enabled: enabled && Boolean(formKey),
  })
}
