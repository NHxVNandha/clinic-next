export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  traceId?: string
}

export type PaginatedResponse<T> = {
  page: number
  pageSize: number
  total: number
  items: T[]
}
