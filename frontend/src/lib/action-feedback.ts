import toast from 'react-hot-toast'
import { parseApiError } from './api-error'

export async function runActionWithFeedback<T>(action: () => Promise<T>, successMessage: string): Promise<T | null> {
  try {
    const result = await action()
    toast.success(successMessage)
    return result
  } catch (error: any) {
    const parsed = parseApiError(error?.response?.data)
    toast.error(parsed.message)
    return null
  }
}
