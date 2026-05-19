import { useMutation, useQuery } from '@tanstack/react-query'
import { login, me, type LoginRequest } from '../api/auth'
import { clearAccessToken, clearAuthUser, setAccessToken, setAuthUser } from '../lib/storage'

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: (response) => {
      setAccessToken(response.data.accessToken)
      setAuthUser(response.data.user)
    },
  })
}

export function useMe(enabled: boolean) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: me,
    enabled,
    retry: false,
  })
}

export function logoutLocal() {
  clearAccessToken()
  clearAuthUser()
}
