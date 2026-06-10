import toast from 'react-hot-toast'
import { parseApiError } from './api-error'

export async function runActionWithFeedback<T>(action: () => Promise<T>, successMessage: string): Promise<T | null> {
  try {
    const result = await action()
    toast.success(successMessage)
    return result
  } catch (error: unknown) {
    const responseData = typeof error === 'object' && error && 'response' in error
      ? (error.response as { data?: unknown } | undefined)?.data
      : undefined
    const parsed = parseApiError(responseData)
    toast.error(parsed.message)
    return null
  }
}
