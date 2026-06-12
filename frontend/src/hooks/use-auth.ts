import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { login, logout, me, register, type LoginRequest, type RegisterRequest } from '../api/auth'
import { clearAccessToken, clearAuthUser, getRefreshToken, setAccessToken, setAuthUser, setRefreshToken } from '../lib/storage'

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: (response) => {
      setAccessToken(response.data.accessToken)
      setRefreshToken(response.data.refreshToken)
      setAuthUser(response.data.user)
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterRequest) => register(payload),
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

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        await logout({ refreshToken })
      }
    },
    onSettled: () => {
      clearAccessToken()
      clearAuthUser()
      queryClient.removeQueries({ queryKey: ['auth'] })
    },
  })
}

export function logoutLocal() {
  clearAccessToken()
  clearAuthUser()
}
