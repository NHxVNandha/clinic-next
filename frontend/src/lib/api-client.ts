import axios from 'axios'
import { getAccessToken } from './storage'
import { mockApiAdapter } from './mock-api'
import { isDummyMode } from './runtime-flags'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  adapter: isDummyMode ? mockApiAdapter : undefined,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
