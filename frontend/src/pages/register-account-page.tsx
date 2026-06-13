import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { AuthMotionForm, AuthMotionGroup, AuthMotionItem } from '../components/auth-motion'
import { useRegister } from '../hooks/use-auth'
import { parseApiError } from '../lib/api-error'
import { useT } from '../i18n'

export function RegisterAccountPage() {
  const navigate = useNavigate()
  const { t } = useT()
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
      toast.success(t('register.success'))
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
            <AuthMotionItem><Link className="auth-back-link" to="/login"><ArrowLeft size={16} /> {t('register.back')}</Link></AuthMotionItem>
            <AuthMotionItem><div className="auth-form-header">
              <div className="auth-form-title-row">
                <span className="auth-support-icon"><ShieldCheck size={28} /></span>
                <h2>{t('register.title')}</h2>
              </div>
              <p>{t('register.desc')}</p>
            </div></AuthMotionItem>
            {summary ? <AuthMotionItem><div className="error-summary">{summary}</div></AuthMotionItem> : null}
            <AuthMotionGroup className="auth-form auth-register-form">
              <AuthMotionItem><label>
                <span>{t('register.name')}</span>
                <div className="auth-input-wrap"><UserRound size={18} aria-hidden="true" /><input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder={t('register.namePlaceholder')} required /></div>
              </label></AuthMotionItem>
              <AuthMotionItem><label>
                <span>{t('login.email')}</span>
                <div className="auth-input-wrap"><Mail size={18} aria-hidden="true" /><input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} type="email" placeholder={t('register.emailPlaceholder')} required /></div>
              </label></AuthMotionItem>
              <AuthMotionItem><label>
                <span>{t('login.password')}</span>
                <div className="auth-input-wrap"><Lock size={18} aria-hidden="true" /><input value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} type={showPassword ? 'text' : 'password'} placeholder={t('register.passwordPlaceholder')} required minLength={8} /><button className="auth-password-toggle" type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
              </label></AuthMotionItem>
              <AuthMotionItem><label>
                <span>{t('register.confirmPassword')}</span>
                <div className="auth-input-wrap"><Lock size={18} aria-hidden="true" /><input value={form.confirmPassword} onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))} type={showConfirmPassword ? 'text' : 'password'} placeholder={t('register.confirmPasswordPlaceholder')} required minLength={8} /><button className="auth-password-toggle" type="button" onClick={() => setShowConfirmPassword((current) => !current)} aria-label={showConfirmPassword ? t('register.hideConfirmPassword') : t('register.showConfirmPassword')}>{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
              </label></AuthMotionItem>
            </AuthMotionGroup>
            <AuthMotionItem><p className="auth-helper-text">{t('register.helper')}</p></AuthMotionItem>
            <AuthMotionItem><button className="btn-primary auth-submit" disabled={registerMutation.isPending} type="submit">
              {registerMutation.isPending ? t('register.processing') : t('register.submit')}
            </button></AuthMotionItem>
          </AuthMotionForm>
  )
}
