import { useEffect, useMemo, useState } from 'react'
import { Command } from 'cmdk'
import { LogOut, Minimize2, Moon, Search, Sun } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { appRoutes } from '../routes'
import { clearAccessToken, clearAuthUser, getAuthUser } from '../lib/storage'
import { isBypassLogin, isDummyMode } from '../lib/runtime-flags'
import { canAccessRoute } from '../lib/access'

type ThemeMode = 'light' | 'dark' | 'system'
type DensityMode = 'compact' | 'comfortable'
type AuditSnapshot = { module: string; entries: string[] }

const MODULE_ROUTE_FALLBACK: Record<string, string> = {
  pendaftaran: '/pendaftaran',
  pelayanan: '/pelayanan',
  kasir: '/kasir',
  master: '/master',
  'rekam-medis': '/rekam-medis',
}

function readAuditSnapshot(): AuditSnapshot[] {
  try {
    const snapshots: AuditSnapshot[] = []
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i)
      if (!key || !key.startsWith('audit-')) continue
      const module = key.replace('audit-', '')
      const raw = sessionStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw) as string[]
      if (!Array.isArray(parsed) || parsed.length === 0) continue
      snapshots.push({ module, entries: parsed })
    }
    return snapshots.sort((a, b) => a.module.localeCompare(b.module))
  } catch {
    return []
  }
}

export function AppShell({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate()
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('clinic-next-theme')
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
  })
  const [densityMode, setDensityMode] = useState<DensityMode>(() => {
    const stored = localStorage.getItem('clinic-next-density')
    return stored === 'compact' || stored === 'comfortable' ? stored : 'compact'
  })
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [isAuditOpen, setIsAuditOpen] = useState(false)
  const [auditSnapshot, setAuditSnapshot] = useState<AuditSnapshot[]>(() => readAuditSnapshot())

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsCommandOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    localStorage.setItem('clinic-next-theme', themeMode)
    const root = document.documentElement
    root.dataset.theme = themeMode
    if (themeMode === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.dataset.theme = isDark ? 'dark' : 'light'
    }
  }, [themeMode])

  useEffect(() => {
    localStorage.setItem('clinic-next-density', densityMode)
    document.documentElement.dataset.density = densityMode
  }, [densityMode])

  useEffect(() => {
    const refreshAudit = () => setAuditSnapshot(readAuditSnapshot())
    window.addEventListener('clinic-audit-updated', refreshAudit)
    window.addEventListener('storage', refreshAudit)
    return () => {
      window.removeEventListener('clinic-audit-updated', refreshAudit)
      window.removeEventListener('storage', refreshAudit)
    }
  }, [])

  const nextTheme = useMemo<ThemeMode>(() => {
    if (themeMode === 'light') return 'dark'
    if (themeMode === 'dark') return 'system'
    return 'light'
  }, [themeMode])

  const visibleRoutes = useMemo(() => appRoutes.filter((route) => canAccessRoute(route.allowedRoles)), [])
  const userRole = useMemo(() => String(getAuthUser()?.role || '').toLowerCase(), [])
  const auditSummary = useMemo(() => ({
    modules: auditSnapshot.length,
    total: auditSnapshot.reduce((sum, item) => sum + item.entries.length, 0),
  }), [auditSnapshot])

  function resolveModuleRoute(moduleKey: string): string | null {
    const direct = visibleRoutes.find((route) => route.path === `/${moduleKey}`)
    if (direct) return direct.path
    const fallbackPath = MODULE_ROUTE_FALLBACK[moduleKey]
    if (!fallbackPath) return null
    return visibleRoutes.some((route) => route.path === fallbackPath) ? fallbackPath : null
  }

  function downloadGlobalAudit(type: 'txt' | 'csv') {
    if (auditSnapshot.length === 0) return
    if (type === 'txt') {
      const lines = auditSnapshot.flatMap((item) => [
        `[${item.module}]`,
        ...item.entries.map((entry, index) => `${index + 1}. ${entry}`),
        '',
      ])
      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-sesi-global-${Date.now()}.txt`
      a.click()
      URL.revokeObjectURL(url)
      return
    }
    const rows = auditSnapshot.flatMap((item) => item.entries.map((entry, index) => `${item.module},${index + 1},"${entry.replace(/"/g, '""')}"`))
    const csv = ['module,no,message', ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-sesi-global-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function clearGlobalAudit() {
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < sessionStorage.length; i += 1) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith('audit-')) keysToRemove.push(key)
      }
      keysToRemove.forEach((key) => sessionStorage.removeItem(key))
      setAuditSnapshot([])
      window.dispatchEvent(new CustomEvent('clinic-audit-updated'))
    } catch {
      // ignore storage issue
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Clinic Next</div>
        <nav aria-label="Navigasi utama aplikasi">
          {visibleRoutes.map((route) => {
            const Icon = route.icon
            return (
              <NavLink
                key={route.path}
                to={route.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={route.description}
              >
                <Icon size={16} />
                <span>{route.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <div className="topbar-meta">
            {isDummyMode ? <span className="mode-badge">Dummy Mode Aktif</span> : null}
            {isBypassLogin ? <span className="mode-badge">Bypass Login Aktif</span> : null}
            {userRole ? <span className="readonly-badge">Role: {userRole}</span> : null}
          </div>
          <button type="button" className="icon-btn icon-only" onClick={() => setIsCommandOpen(true)} title="Cari menu (Ctrl+K)" aria-label="Buka pencarian menu cepat">
            <Search size={16} />
          </button>
          <div className="top-actions">
            <button type="button" className="icon-btn icon-only" onClick={() => setIsAuditOpen((prev) => !prev)} title="Lihat audit sesi" aria-label="Buka audit sesi">
              <span style={{ fontWeight: 700 }}>{auditSummary.total}</span>
            </button>
            <button type="button" className="icon-btn icon-only" onClick={() => setThemeMode(nextTheme)} title={`Ganti mode tema (${themeMode})`} aria-label={`Ganti mode tema, saat ini ${themeMode}`}>
              {themeMode === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button type="button" className="icon-btn icon-only" onClick={() => setDensityMode((prev) => (prev === 'compact' ? 'comfortable' : 'compact'))} title={`Ganti kerapatan tampilan (${densityMode})`} aria-label={`Ganti kerapatan tampilan, saat ini ${densityMode}`}>
              <Minimize2 size={16} />
            </button>
            <button
              type="button"
              className="icon-btn icon-only"
              onClick={() => {
                clearAccessToken()
                clearAuthUser()
                onLogout()
              }}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <main className="content" id="main-content" tabIndex={-1}>
          {isAuditOpen ? (
            <section className="preview-box" style={{ marginBottom: 12 }}>
              <div className="top-actions">
                <h2 style={{ margin: 0 }}>Audit Sesi Global</h2>
                <button className="icon-btn" disabled={auditSnapshot.length === 0} onClick={() => downloadGlobalAudit('txt')}>TXT</button>
                <button className="icon-btn" disabled={auditSnapshot.length === 0} onClick={() => downloadGlobalAudit('csv')}>CSV</button>
                <button className="icon-btn" disabled={auditSnapshot.length === 0} onClick={clearGlobalAudit}>Clear</button>
                <button className="icon-btn" onClick={() => setIsAuditOpen(false)}>Tutup</button>
              </div>
              <p className="kbd-hint">Modul aktif: {auditSummary.modules} | Total aksi: {auditSummary.total}</p>
              {auditSnapshot.length > 0 ? (
                <div className="filter-chip-wrap" style={{ marginTop: 8 }}>
                  {auditSnapshot.map((item) => (
                    <button
                      key={item.module}
                      className="filter-chip"
                      onClick={() => {
                        const route = resolveModuleRoute(item.module)
                        if (!route) return
                        navigate(route)
                        setIsAuditOpen(false)
                      }}
                      title={`Buka modul ${item.module}`}
                    >
                      {item.module}: {item.entries[0]}
                    </button>
                  ))}
                </div>
              ) : <p className="empty-note">Belum ada aksi tercatat pada sesi ini.</p>}
            </section>
          ) : null}
          <Outlet />
        </main>
      </div>

      <Command.Dialog className="command-dialog" open={isCommandOpen} onOpenChange={setIsCommandOpen} label="Cari menu">
        <div className="command-input-wrap">
          <Search size={16} />
          <Command.Input placeholder="Cari menu, contoh: kasir..." className="command-input" aria-label="Input pencarian menu" />
        </div>
        <Command.List className="command-list">
          <Command.Empty>Menu tidak ditemukan.</Command.Empty>
          {visibleRoutes.map((route) => (
            <Command.Item
              key={route.path}
              onSelect={() => {
                navigate(route.path)
                setIsCommandOpen(false)
              }}
              className="command-item"
            >
              <div>
                <p>{route.label}</p>
                <small>{route.description}</small>
              </div>
            </Command.Item>
          ))}
        </Command.List>
      </Command.Dialog>
    </div>
  )
}
