import { ArrowLeft, MailCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ForgotPasswordPage() {
  return (
          <div className="auth-card auth-support-card">
            <Link className="auth-back-link" to="/login"><ArrowLeft size={16} /> Kembali ke login</Link>
            <div className="auth-form-header">
              <span className="auth-support-icon"><MailCheck size={28} /></span>
              <h2>Lupa Password?</h2>
              <p>Fitur reset otomatis belum aktif di backend production. Hubungi administrator klinik untuk reset password akun Anda.</p>
            </div>
            <div className="auth-support-panel">
              <strong>Alur aman saat ini</strong>
              <p>Admin akan memverifikasi email pengguna, mengatur password baru dari panel backend, lalu meminta pengguna mengganti kredensial setelah login.</p>
            </div>
            <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
              <label>
                <span>Email akun</span>
                <div className="auth-input-wrap">
                  <MailCheck size={18} aria-hidden="true" />
                  <input type="email" placeholder="nama@klinik.com" />
                </div>
              </label>
              <button className="btn-primary auth-submit" type="button" disabled>Reset otomatis belum tersedia</button>
            </form>
            <p className="auth-legal">MediFlow Admin menjaga reset akses tetap melalui proses terverifikasi.</p>
          </div>
  )
}
