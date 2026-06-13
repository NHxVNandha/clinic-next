import { useEffect, useMemo, useState } from 'react'
import { Command } from 'cmdk'
import { Bell, CircleHelp, Languages, LogOut, Moon, Search, Sun } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { appRoutes } from '../routes'
import { getAuthUser } from '../lib/storage'
import { isBypassLogin, isDummyMode } from '../lib/runtime-flags'
import { canAccessPermission } from '../lib/access'
import { useT, type TranslationKey } from '../i18n'
import { useLogout } from '../hooks/use-auth'

type ThemeMode = 'light' | 'dark' | 'system'

const routeTextKeys: Record<string, { label: TranslationKey; desc: TranslationKey }> = {
  '/dashboard': { label: 'nav.dashboard', desc: 'nav.dashboard.desc' },
  '/pendaftaran': { label: 'nav.pendaftaran', desc: 'nav.pendaftaran.desc' },
  '/pelayanan': { label: 'nav.pelayanan', desc: 'nav.pelayanan.desc' },
  '/kasir': { label: 'nav.kasir', desc: 'nav.kasir.desc' },
  '/laporan': { label: 'nav.laporan', desc: 'nav.laporan.desc' },
  '/master': { label: 'nav.master', desc: 'nav.master.desc' },
  '/rekam-medis': { label: 'nav.rekamMedis', desc: 'nav.rekamMedis.desc' },
  '/pengaturan': { label: 'nav.pengaturan', desc: 'nav.pengaturan.desc' },
}

export function AppShell({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { language, toggleLanguage, t } = useT()
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('clinic-next-theme')
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
  })
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const logoutMutation = useLogout()

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

  const nextTheme = useMemo<ThemeMode>(() => {
    if (themeMode === 'light') return 'dark'
    if (themeMode === 'dark') return 'system'
    return 'light'
  }, [themeMode])

  const visibleRoutes = useMemo(() => appRoutes.filter((route) => canAccessPermission(route.permissionKey, route.allowedRoles)), [])
  const authUser = useMemo(() => getAuthUser(), [])
  const userRole = useMemo(() => String(authUser?.role || '').toLowerCase(), [authUser?.role])
  const userName = useMemo(() => String(authUser?.name || authUser?.email || 'Admin Utama'), [authUser?.email, authUser?.name])

  return (
    <div className="app-shell">
      <aside className="sidebar">
          <div className="brand-block">
            <div className="brand">MediFlow Admin</div>
          <p>{t('app.subtitle')}</p>
        </div>
        <nav aria-label="Navigasi utama aplikasi">
          {visibleRoutes.map((route) => {
            const Icon = route.icon
            return (
              <NavLink
                key={route.path}
                to={route.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={t(routeTextKeys[route.path]?.desc ?? 'nav.dashboard.desc')}
              >
                <Icon size={16} />
                <span>{t(routeTextKeys[route.path]?.label ?? 'nav.dashboard')}</span>
              </NavLink>
            )
          })}
        </nav>
        <div className="sidebar-user">
          <div className="avatar-token">{userName.slice(0, 2).toUpperCase()}</div>
          <div>
            <strong>{userName}</strong>
            <span>{userRole || 'Administrator'}</span>
          </div>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <button type="button" className="topbar-search" onClick={() => setIsCommandOpen(true)} title={`${t('command.label')} (Ctrl+K)`} aria-label={t('topbar.openSearch')}>
            <Search size={16} />
            <span>{t('topbar.search')}</span>
            <kbd>Ctrl K</kbd>
          </button>
          <div className="topbar-meta">
            {isDummyMode ? <span className="mode-badge">{t('badge.dummy')}</span> : null}
            {isBypassLogin ? <span className="mode-badge">{t('badge.bypass')}</span> : null}
            {userRole ? <span className="readonly-badge">{t('role.label')}: {userRole}</span> : null}
          </div>
          <div className="top-actions">
            <button type="button" className="icon-btn icon-only" title={t('topbar.notifications')} aria-label={t('topbar.notifications')}>
              <Bell size={16} />
            </button>
            <button type="button" className="icon-btn icon-only" title={t('topbar.help')} aria-label={t('topbar.help')}>
              <CircleHelp size={16} />
            </button>
            <button type="button" className="icon-btn icon-only" onClick={() => setThemeMode(nextTheme)} title={`${t('topbar.theme')} (${themeMode})`} aria-label={`${t('topbar.theme')}, ${themeMode}`}>
              {themeMode === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button type="button" className="icon-btn language-toggle" onClick={toggleLanguage} title={t('topbar.language')} aria-label={t('topbar.language')}>
              <Languages size={16} />
              <span>{language.toUpperCase()}</span>
            </button>
            <button
              type="button"
              className="icon-btn icon-only"
              onClick={async () => {
                await logoutMutation.mutateAsync().catch(() => undefined)
                onLogout()
              }}
              disabled={logoutMutation.isPending}
              title={t('topbar.logout')}
              aria-label={t('topbar.logout')}
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <main className="content" id="main-content" tabIndex={-1}>
          <div key={location.pathname} className="route-transition-shell">
            <span className="route-scanline" aria-hidden="true" />
            <Outlet />
          </div>
        </main>
      </div>

      <Command.Dialog className="command-dialog" open={isCommandOpen} onOpenChange={setIsCommandOpen} label={t('command.label')}>
        <div className="command-input-wrap">
          <Search size={16} />
          <Command.Input placeholder={t('command.placeholder')} className="command-input" aria-label={t('command.label')} />
        </div>
        <Command.List className="command-list">
          <Command.Empty>{t('command.empty')}</Command.Empty>
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
                <p>{t(routeTextKeys[route.path]?.label ?? 'nav.dashboard')}</p>
                <small>{t(routeTextKeys[route.path]?.desc ?? 'nav.dashboard.desc')}</small>
              </div>
            </Command.Item>
          ))}
        </Command.List>
      </Command.Dialog>
    </div>
  )
}
