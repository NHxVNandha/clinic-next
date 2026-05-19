import { ShieldAlert } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { getAuthUser } from '../lib/storage'

export function UnauthorizedPage() {
  const location = useLocation()
  const requested = new URLSearchParams(location.search).get('from')
  const role = String(getAuthUser()?.role || '').toLowerCase()

  return (
    <section className="page-card">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ShieldAlert size={20} />
        Akses Ditolak
      </h1>
      <p>Anda tidak memiliki izin untuk membuka halaman ini.</p>
      {role ? <p className="empty-note">Role Anda saat ini: {role}</p> : null}
      {requested ? <p className="empty-note">Path yang diminta: {requested}</p> : null}
      <div className="top-actions" style={{ marginTop: 12 }}>
        <Link className="icon-btn" to="/dashboard">
          Kembali ke Dashboard
        </Link>
        <a className="icon-btn" href="mailto:admin@clinicnext.local?subject=Permintaan%20Akses%20Role">
          Hubungi Admin
        </a>
      </div>
    </section>
  )
}
