import axios, { type InternalAxiosRequestConfig } from 'axios'
import { clearAccessToken, clearAuthUser, getAccessToken, getRefreshToken, setAccessToken, setAuthUser, setRefreshToken } from './storage'
import { mockApiAdapter } from './mock-api'
import { isDummyMode } from './runtime-flags'

type RetryRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

type RefreshResponse = {
  data: {
    accessToken: string
    refreshToken: string
    user: Record<string, unknown>
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  adapter: isDummyMode ? mockApiAdapter : undefined,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise: Promise<string> | null = null

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const responseStatus = error?.response?.status
    const originalRequest = error?.config as RetryRequestConfig | undefined
    const refreshToken = getRefreshToken()
    const requestUrl = String(originalRequest?.url ?? '')

    if (responseStatus !== 401 || !originalRequest || originalRequest._retry || !refreshToken || requestUrl.includes('/auth/refresh') || requestUrl.includes('/auth/login')) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      refreshPromise ??= axios
        .post<RefreshResponse>(`${apiClient.defaults.baseURL}/auth/refresh`, { refreshToken }, { headers: { 'Content-Type': 'application/json' } })
        .then((response) => {
          setAccessToken(response.data.data.accessToken)
          setRefreshToken(response.data.data.refreshToken)
          setAuthUser(response.data.data.user)
          return response.data.data.accessToken
        })
        .finally(() => {
          refreshPromise = null
        })

      const accessToken = await refreshPromise
      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      clearAccessToken()
      clearAuthUser()
      return Promise.reject(refreshError)
    }
  },
)
