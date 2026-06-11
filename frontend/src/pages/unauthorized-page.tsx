import { ShieldAlert } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { getAuthUser } from '../lib/storage'
import { useT } from '../i18n'

export function UnauthorizedPage() {
  const { t } = useT()
  const location = useLocation()
  const requested = new URLSearchParams(location.search).get('from')
  const role = String(getAuthUser()?.role || '').toLowerCase()

  return (
    <section className="page-card">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ShieldAlert size={20} />
        {t('unauthorized.title')}
      </h1>
      <p>{t('unauthorized.title')}</p>
      {role ? <p className="empty-note">{t('role.label')}: {role}</p> : null}
      {requested ? <p className="empty-note">Path: {requested}</p> : null}
      <div className="top-actions" style={{ marginTop: 12 }}>
        <Link className="icon-btn" to="/dashboard">
          {t('unauthorized.back')}
        </Link>
        <a className="icon-btn" href="mailto:admin@clinicnext.local?subject=Permintaan%20Akses%20Role">
          Hubungi Admin
        </a>
      </div>
    </section>
  )
}
