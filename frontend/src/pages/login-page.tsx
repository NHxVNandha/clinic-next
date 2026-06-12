import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useLogin } from '../hooks/use-auth'
import { parseApiError } from '../lib/api-error'
import { useT } from '../i18n'

export function LoginPage({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useT()
  const [email, setEmail] = useState('admin@clinicnext.local')
  const [password, setPassword] = useState('Password123!')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [summary, setSummary] = useState<string>('')
  const loginMutation = useLogin()

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})
    setSummary('')
    try {
      await loginMutation.mutateAsync({ email, password })
      toast.success('Login berhasil.')
      onSuccess()
    } catch (error: unknown) {
      const responseData = typeof error === 'object' && error && 'response' in error
        ? (error.response as { data?: unknown } | undefined)?.data
        : undefined
      const parsed = parseApiError(responseData)
      setErrors(parsed.fieldErrors)
      setSummary(parsed.message)
      toast.error(parsed.message)
    }
  }

  return (
    <div className="auth-layout">
      <main className="auth-shell">
        <section className="auth-brand-panel" aria-label={t('login.brandAria')}>
          <div className="auth-brand-pattern" aria-hidden="true" />
          <div className="auth-brand-content">
            <div className="auth-brand-mark"><ShieldCheck size={36} /></div>
            <h1>{t('login.title')}</h1>
            <p>{t('login.hero')}</p>
            <div className="auth-brand-metrics">
              <article>
                <small>{t('login.statusLabel')}</small>
                <strong>{t('login.statusValue')}</strong>
              </article>
              <article>
                <small>{t('login.securityLabel')}</small>
                <strong>{t('login.securityValue')}</strong>
              </article>
            </div>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-mobile-brand">
              <span><ShieldCheck size={26} /></span>
              <div>
                <strong>{t('login.title')}</strong>
                <small>{t('app.subtitle')}</small>
              </div>
            </div>
            <div className="auth-form-header">
              <h2>{t('login.welcome')}</h2>
              <p>{t('login.desc')}</p>
            </div>

            <form className="auth-form" onSubmit={submit}>
              {summary ? <div className="error-summary">{summary}</div> : null}
              <label>
                <span>{t('login.email')}</span>
                <div className="auth-input-wrap">
                  <Mail size={18} aria-hidden="true" />
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    placeholder={t('login.emailPlaceholder')}
                    required
                    aria-invalid={Boolean(errors.Email)}
                    aria-describedby={errors.Email ? 'login-email-error' : undefined}
                  />
                </div>
                {errors.Email ? <small id="login-email-error" className="field-error">{errors.Email[0]}</small> : null}
              </label>
              <label>
                <span className="auth-label-row"><span>{t('login.password')}</span><Link className="auth-text-button" to="/forgot-password">{t('login.forgot')}</Link></span>
                <div className="auth-input-wrap">
                  <Lock size={18} aria-hidden="true" />
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('login.passwordPlaceholder')}
                    required
                    aria-invalid={Boolean(errors.Password)}
                    aria-describedby={errors.Password ? 'login-password-error' : undefined}
                  />
                  <button
                    className="auth-password-toggle"
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.Password ? <small id="login-password-error" className="field-error">{errors.Password[0]}</small> : null}
              </label>
              <label className="auth-check-row">
                <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
                <span>{t('login.remember')}</span>
              </label>
              <button className="btn-primary auth-submit" disabled={loginMutation.isPending} type="submit">
                {loginMutation.isPending ? t('login.processing') : t('login.submit')}
              </button>
            </form>

            <div className="auth-register-prompt">
              <p>{t('login.registerPrompt')} <Link className="auth-text-button" to="/register-clinic">{t('login.registerLink')}</Link></p>
            </div>
            <p className="auth-legal">{t('login.legal')}</p>
          </div>
        </section>
      </main>
    </div>
  )
}
