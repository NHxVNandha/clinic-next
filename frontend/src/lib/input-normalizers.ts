export function onlyDigits(value: string): string {
  return value.replace(/\D+/g, '')
}

export function formatNik(value: string): string {
  return onlyDigits(value).slice(0, 16)
}

export function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 15)
  if (!digits) return ''
  if (digits.startsWith('0')) return digits
  return `0${digits}`.slice(0, 15)
}

export function normalizeIdRegistrasi(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '')
}
