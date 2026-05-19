export type ApiValidationError = {
  success: false
  message: string
  errors?: Record<string, string[]>
  traceId?: string
}

export type ParsedApiError = {
  message: string
  fieldErrors: Record<string, string[]>
  traceId?: string
}

export function parseApiError(input: unknown): ParsedApiError {
  const fallback: ParsedApiError = {
    message: 'Terjadi gangguan sistem. Coba beberapa saat lagi.',
    fieldErrors: {},
  }

  if (!input || typeof input !== 'object') {
    return fallback
  }

  const maybe = input as ApiValidationError
  return {
    message: maybe.message || fallback.message,
    fieldErrors: maybe.errors || {},
    traceId: maybe.traceId,
  }
}
