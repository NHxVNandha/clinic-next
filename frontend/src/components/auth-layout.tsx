import { ShieldCheck, ShieldQuestion, UserRound } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import { useT } from '../i18n'

const clinicalImageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgLoK8Rn8KHTmwPvBnJmPp3lrRG94FKTyIyak0UpFvgpS9AtdbM-d_kLwtNaNaWQghOSszuqTgzcBSVNPD6Km1PXynYj0562fGwIO13my7vPqfK-rTpPcIoDglJHxFQZeiOyahpCVDVzCe_UQP0e6exuxQJT60UchDrcaBw-2wrZeyeKPE-vG_gsjUfz01wLHYXSdPDQwp_pyU3ViZG4DFHINLFo609PDHFyaMRtm64fXc8syrMh7ZNpnPdjYQtjupZ-TXAWRC64yF'

export function AuthLayout() {
  const { t } = useT()
  const location = useLocation()
  const mode = location.pathname === '/register' ? 'register' : 'login'
  const isRegister = mode === 'register'
  const isForgot = location.pathname === '/forgot-password'
  const Icon = isRegister ? UserRound : isForgot ? ShieldQuestion : ShieldCheck
  const title = isRegister ? 'Buat Akun Pengguna' : isForgot ? 'Reset Akses Admin' : t('login.title')
  const description = isRegister
    ? 'Daftarkan akun operator agar dapat mengakses alur kerja klinik sesuai role dan kebijakan keamanan aplikasi.'
    : isForgot
      ? 'Reset akses dilakukan melalui verifikasi admin internal sebelum kredensial baru diterbitkan.'
      : t('login.hero')
  const metricA = isRegister ? { label: 'Role Awal', value: 'User Secure' } : isForgot ? { label: 'Verifikasi', value: 'Admin Clinic' } : { label: t('login.statusLabel'), value: t('login.statusValue') }
  const metricB = isRegister ? { label: 'Akses', value: 'Role Based' } : isForgot ? { label: 'Status', value: 'Manual Secure' } : { label: t('login.securityLabel'), value: t('login.securityValue') }

  return (
    <div className="auth-layout">
      <main className={`auth-shell auth-shell-${mode}`}>
        <section className="auth-brand-panel" aria-label="Panel brand MediFlow Admin">
          <img className="auth-brand-image" src={clinicalImageUrl} alt="Lingkungan klinik modern" />
          <div className="auth-brand-pattern" aria-hidden="true" />
          <div className="auth-brand-content" key={location.pathname}>
            <div className="auth-brand-mark"><Icon size={36} /></div>
            <h1>{title}</h1>
            <p>{description}</p>
            <div className="auth-brand-metrics">
              <article><small>{metricA.label}</small><strong>{metricA.value}</strong></article>
              <article><small>{metricB.label}</small><strong>{metricB.value}</strong></article>
            </div>
          </div>
        </section>
        <span className="auth-comparison-line" aria-hidden="true" />
        <section className={`auth-form-panel ${isRegister ? 'auth-form-panel-scroll' : ''}`.trim()}>
          <div className="auth-form-stage" key={location.pathname}>
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  )
}
