import { Suspense, lazy, useEffect, useMemo, useState, type ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from './components/auth-layout'
import { AppShell } from './components/app-shell'
import { LoginPage } from './pages/login-page'
import { ForgotPasswordPage } from './pages/forgot-password-page'
import { RegisterAccountPage } from './pages/register-account-page'
import { getAccessToken, setAuthUser } from './lib/storage'
import { useMe } from './hooks/use-auth'
import { isBypassLogin } from './lib/runtime-flags'
import { appRoutes } from './routes'
import { canAccessPermission } from './lib/access'
import { useT } from './i18n'

const DashboardPage = lazy(async () => {
  const module = await import('./pages/dashboard-page')
  return { default: module.DashboardPage }
})

const PendaftaranPage = lazy(async () => {
  const module = await import('./pages/pendaftaran-page')
  return { default: module.PendaftaranPage }
})

const PelayananPage = lazy(async () => {
  const module = await import('./pages/pelayanan-page')
  return { default: module.PelayananPage }
})

const KasirPage = lazy(async () => {
  const module = await import('./pages/kasir-page')
  return { default: module.KasirPage }
})

const LaporanPage = lazy(async () => {
  const module = await import('./pages/laporan-page')
  return { default: module.LaporanPage }
})

const MasterPage = lazy(async () => {
  const module = await import('./pages/master-page')
  return { default: module.MasterPage }
})

const RekamMedisPage = lazy(async () => {
  const module = await import('./pages/rekam-medis-page')
  return { default: module.RekamMedisPage }
})

const UnauthorizedPage = lazy(async () => {
  const module = await import('./pages/unauthorized-page')
  return { default: module.UnauthorizedPage }
})

const PengaturanPage = lazy(async () => {
  const module = await import('./pages/pengaturan-page')
  return { default: module.PengaturanPage }
})

function guard(path: string, element: ReactElement) {
  const route = appRoutes.find((item) => item.path === path)
  if (!route || canAccessPermission(route.permissionKey, route.allowedRoles)) return element
  return <Navigate to={`/unauthorized?from=${encodeURIComponent(path)}`} replace />
}

function App() {
  const { t } = useT()
  const [, setTokenVersion] = useState(0)
  const token = getAccessToken()
  const auth = useMe(!isBypassLogin && Boolean(token))

  useEffect(() => {
    if (auth.data?.data) {
      setAuthUser(auth.data.data)
    }
  }, [auth.data?.data])

  const isAuthenticated = useMemo(() => {
    if (isBypassLogin) return true
    if (!token) return false
    if (auth.isError) return false
    return true
  }, [token, auth.isError])

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<div className="route-loading">{t('loading.route')}</div>}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage onSuccess={() => setTokenVersion((prev) => prev + 1)} />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/register" element={<RegisterAccountPage />} />
          </Route>
          <Route path="/register-clinic" element={<Navigate to="/register" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<div className="route-loading">{t('loading.route')}</div>}>
      <Routes>
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/dashboard" replace />} />
        <Route path="/register" element={<Navigate to="/dashboard" replace />} />
        <Route path="/register-clinic" element={<Navigate to="/dashboard" replace />} />
        <Route element={<AppShell onLogout={() => setTokenVersion((prev) => prev + 1)} />}>
          <Route path="/dashboard" element={<DashboardPage canFetch={isBypassLogin || Boolean(token)} />} />
          <Route path="/pendaftaran" element={guard('/pendaftaran', <PendaftaranPage canFetch={isBypassLogin || Boolean(token)} />)} />
          <Route path="/pelayanan" element={guard('/pelayanan', <PelayananPage canFetch={isBypassLogin || Boolean(token)} />)} />
          <Route path="/kasir" element={guard('/kasir', <KasirPage canFetch={isBypassLogin || Boolean(token)} />)} />
          <Route path="/laporan" element={<LaporanPage canFetch={isBypassLogin || Boolean(token)} />} />
          <Route path="/master" element={guard('/master', <MasterPage canFetch={isBypassLogin || Boolean(token)} />)} />
          <Route path="/rekam-medis" element={guard('/rekam-medis', <RekamMedisPage canFetch={isBypassLogin || Boolean(token)} />)} />
          <Route path="/pengaturan" element={guard('/pengaturan', <PengaturanPage canFetch={isBypassLogin || Boolean(token)} />)} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
