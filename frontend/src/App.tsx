import { Suspense, lazy, useMemo, useState, type ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/app-shell'
import { LoginPage } from './pages/login-page'
import { getAccessToken } from './lib/storage'
import { useMe } from './hooks/use-auth'
import { isBypassLogin } from './lib/runtime-flags'
import { appRoutes } from './routes'
import { canAccessRoute } from './lib/access'

const PlaceholderPage = lazy(async () => {
  const module = await import('./pages/placeholder-page')
  return { default: module.PlaceholderPage }
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

function guard(path: string, element: ReactElement) {
  const route = appRoutes.find((item) => item.path === path)
  if (!route || canAccessRoute(route.allowedRoles)) return element
  return <Navigate to={`/unauthorized?from=${encodeURIComponent(path)}`} replace />
}

function App() {
  const [tokenVersion, setTokenVersion] = useState(0)
  const token = getAccessToken()
  const auth = useMe(!isBypassLogin && Boolean(token))

  const isAuthenticated = useMemo(() => {
    if (isBypassLogin) return true
    if (!token) return false
    if (auth.isError) return false
    return true
  }, [token, auth.isError, tokenVersion])

  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => setTokenVersion((prev) => prev + 1)} />
  }

  return (
    <Suspense fallback={<div className="route-loading">Memuat halaman...</div>}>
      <Routes>
        <Route element={<AppShell onLogout={() => setTokenVersion((prev) => prev + 1)} />}>
          <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" subtitle="Monitoring performa klinik secara real-time" />} />
          <Route path="/pendaftaran" element={guard('/pendaftaran', <PendaftaranPage canFetch={isBypassLogin || Boolean(token)} />)} />
          <Route path="/pelayanan" element={guard('/pelayanan', <PelayananPage canFetch={isBypassLogin || Boolean(token)} />)} />
          <Route path="/kasir" element={guard('/kasir', <KasirPage canFetch={isBypassLogin || Boolean(token)} />)} />
          <Route path="/laporan" element={<LaporanPage canFetch={isBypassLogin || Boolean(token)} />} />
          <Route path="/master" element={guard('/master', <MasterPage canFetch={isBypassLogin || Boolean(token)} />)} />
          <Route path="/rekam-medis" element={guard('/rekam-medis', <RekamMedisPage canFetch={isBypassLogin || Boolean(token)} />)} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
