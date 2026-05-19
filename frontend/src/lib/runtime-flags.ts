function parseBool(value: unknown): boolean {
  return String(value || '').toLowerCase() === 'true'
}

export const isDummyMode = parseBool(import.meta.env.VITE_USE_DUMMY_API)
export const isBypassLogin = parseBool(import.meta.env.VITE_BYPASS_LOGIN)
