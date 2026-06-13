import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { AuthMotionForm, AuthMotionGroup, AuthMotionItem } from '../components/auth-motion'
import { useRegister } from '../hooks/use-auth'
import { parseApiError } from '../lib/api-error'

export function RegisterAccountPage() {
  const navigate = useNavigate()
  const registerMutation = useRegister()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [summary, setSummary] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSummary('')
    try {
      await registerMutation.mutateAsync({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      })
      toast.success('Akun berhasil dibuat. Silakan login.')
      navigate('/login', { replace: true })
    } catch (error: unknown) {
      const responseData = typeof error === 'object' && error && 'response' in error
        ? (error.response as { data?: unknown } | undefined)?.data
        : undefined
      const parsed = parseApiError(responseData)
      setSummary(parsed.message)
      toast.error(parsed.message)
    }
  }

  return (
          <AuthMotionForm className="auth-card auth-register-card" onSubmit={submit}>
            <AuthMotionItem><Link className="auth-back-link" to="/login"><ArrowLeft size={16} /> Kembali ke login</Link></AuthMotionItem>
            <AuthMotionItem><div className="auth-form-header">
              <span className="auth-support-icon"><ShieldCheck size={28} /></span>
              <h2>Registrasi Akun</h2>
              <p>Buat akun pengguna untuk masuk ke aplikasi. Akun baru menggunakan akses standar dan dapat disesuaikan oleh admin.</p>
            </div></AuthMotionItem>
            {summary ? <AuthMotionItem><div className="error-summary">{summary}</div></AuthMotionItem> : null}
            <AuthMotionGroup className="auth-form auth-register-form">
              <AuthMotionItem><label>
                <span>Nama Lengkap</span>
                <div className="auth-input-wrap"><UserRound size={18} aria-hidden="true" /><input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Nama pengguna" required /></div>
              </label></AuthMotionItem>
              <AuthMotionItem><label>
                <span>Email</span>
                <div className="auth-input-wrap"><Mail size={18} aria-hidden="true" /><input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} type="email" placeholder="nama@klinik.com" required /></div>
              </label></AuthMotionItem>
              <AuthMotionItem><label>
                <span>Password</span>
                <div className="auth-input-wrap"><Lock size={18} aria-hidden="true" /><input value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} type={showPassword ? 'text' : 'password'} placeholder="Minimal 8 karakter" required minLength={8} /><button className="auth-password-toggle" type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
              </label></AuthMotionItem>
              <AuthMotionItem><label>
                <span>Konfirmasi Password</span>
                <div className="auth-input-wrap"><Lock size={18} aria-hidden="true" /><input value={form.confirmPassword} onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))} type={showConfirmPassword ? 'text' : 'password'} placeholder="Ulangi password" required minLength={8} /><button className="auth-password-toggle" type="button" onClick={() => setShowConfirmPassword((current) => !current)} aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}>{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
              </label></AuthMotionItem>
            </AuthMotionGroup>
            <AuthMotionItem><p className="auth-helper-text">Akun baru tidak mendapat akses admin otomatis. Admin dapat menyesuaikan role melalui menu pengaturan.</p></AuthMotionItem>
            <AuthMotionItem><button className="btn-primary auth-submit" disabled={registerMutation.isPending} type="submit">
              {registerMutation.isPending ? 'Membuat akun...' : 'Buat Akun'}
            </button></AuthMotionItem>
          </AuthMotionForm>
  )
}
