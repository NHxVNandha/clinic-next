import { useMemo, useState } from 'react'

const DEFAULT_MESSAGE = 'Belum ada aksi pada sesi ini.'

export function useActionAudit(storageKey: string) {
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const raw = sessionStorage.getItem(`audit-${storageKey}`)
      const parsed = raw ? (JSON.parse(raw) as string[]) : []
      return Array.isArray(parsed) ? parsed.slice(0, 5) : []
    } catch {
      return []
    }
  })

  const lastAction = useMemo(() => history[0] || DEFAULT_MESSAGE, [history])

  function logAction(message: string) {
    setHistory((prev) => {
      const next = [message, ...prev.filter((item) => item !== message)].slice(0, 5)
      try {
        sessionStorage.setItem(`audit-${storageKey}`, JSON.stringify(next))
        window.dispatchEvent(new CustomEvent('clinic-audit-updated'))
      } catch {
        // ignore storage issue
      }
      return next
    })
  }

  function clearHistory() {
    setHistory([])
    try {
      sessionStorage.removeItem(`audit-${storageKey}`)
      window.dispatchEvent(new CustomEvent('clinic-audit-updated'))
    } catch {
      // ignore storage issue
    }
  }

  function exportText(): string {
    if (history.length === 0) return DEFAULT_MESSAGE
    return history.map((item, index) => `${index + 1}. ${item}`).join('\n')
  }

  function exportCsv(): string {
    if (history.length === 0) return 'no,message\n1,Belum ada aksi pada sesi ini.'
    const rows = history.map((item, index) => `${index + 1},"${item.replace(/"/g, '""')}"`)
    return ['no,message', ...rows].join('\n')
  }

  const metrics = {
    total: history.length,
    destructive: history.filter((item) => {
      const lower = item.toLowerCase()
      return lower.includes('dihapus') || lower.includes('dibatalkan')
    }).length,
  }

  return { lastAction, history, logAction, clearHistory, exportText, exportCsv, metrics }
}
