import { ArrowLeft, Building2, CheckCircle2, ClipboardCheck, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

export function RegisterClinicPage() {
  return (
    <div className="auth-layout">
      <main className="auth-shell auth-shell-support">
        <section className="auth-brand-panel auth-brand-panel-support" aria-label="Registrasi klinik MediFlow Admin">
          <div className="auth-brand-pattern" aria-hidden="true" />
          <div className="auth-brand-content">
            <div className="auth-brand-mark"><Building2 size={36} /></div>
            <h1>Onboarding Klinik</h1>
            <p>Daftarkan klinik dengan proses verifikasi bertahap agar data operasional, admin, dan akses pengguna tetap aman sejak hari pertama.</p>
            <div className="auth-brand-metrics">
              <article><small>Validasi</small><strong>Identitas Klinik</strong></article>
              <article><small>Akses</small><strong>Admin Terverifikasi</strong></article>
            </div>
          </div>
        </section>
        <section className="auth-form-panel auth-form-panel-scroll">
          <div className="auth-card auth-support-card auth-register-card">
            <Link className="auth-back-link" to="/login"><ArrowLeft size={16} /> Kembali ke login</Link>
            <div className="auth-form-header">
              <span className="auth-support-icon"><ClipboardCheck size={28} /></span>
              <h2>Registrasi Klinik Baru</h2>
              <p>Lengkapi informasi awal. Endpoint registrasi publik belum aktif, jadi data ini berfungsi sebagai panduan onboarding untuk admin.</p>
            </div>
            <div className="registration-stepper auth-page-stepper" aria-label="Alur registrasi klinik">
              <span className="registration-step active"><b>1</b> Klinik</span>
              <span className="registration-step active"><b>2</b> Admin</span>
              <span className="registration-step"><b>3</b> Verifikasi</span>
            </div>
            <form className="auth-form auth-register-form" onSubmit={(event) => event.preventDefault()}>
              <label>
                <span>Nama Klinik</span>
                <div className="auth-input-wrap"><Building2 size={18} aria-hidden="true" /><input placeholder="Contoh: Klinik Sehat Sentosa" /></div>
              </label>
              <label>
                <span>Email Admin</span>
                <div className="auth-input-wrap"><ShieldCheck size={18} aria-hidden="true" /><input type="email" placeholder="admin@klinik.com" /></div>
              </label>
              <label className="auth-register-wide">
                <span>Alamat Klinik</span>
                <textarea className="auth-textarea" rows={3} placeholder="Alamat lengkap klinik, kota, dan kode pos" />
              </label>
              <button className="btn-primary auth-submit auth-register-wide" type="button" disabled>Registrasi publik belum tersedia</button>
            </form>
            <div className="auth-support-panel auth-register-wide">
              <strong><CheckCircle2 size={16} /> Best practice onboarding</strong>
              <p>Aktivasi klinik sebaiknya dilakukan setelah validasi legal, penanggung jawab, dan admin utama oleh tim internal.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
