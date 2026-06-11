import { useState } from 'react'
import toast from 'react-hot-toast'
import { useLogin } from '../hooks/use-auth'
import { parseApiError } from '../lib/api-error'
import { useT } from '../i18n'

export function LoginPage({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useT()
  const [email, setEmail] = useState('admin@clinicnext.local')
  const [password, setPassword] = useState('Password123!')
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
      <form className="auth-card" onSubmit={submit}>
        <h1>MediFlow Admin</h1>
        <p>{t('login.desc')}</p>
        {summary ? <div className="error-summary">{summary}</div> : null}
        <label>
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
            aria-invalid={Boolean(errors.Email)}
            aria-describedby={errors.Email ? 'login-email-error' : undefined}
          />
          {errors.Email ? <small id="login-email-error" className="field-error">{errors.Email[0]}</small> : null}
        </label>
        <label>
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
            aria-invalid={Boolean(errors.Password)}
            aria-describedby={errors.Password ? 'login-password-error' : undefined}
          />
          {errors.Password ? <small id="login-password-error" className="field-error">{errors.Password[0]}</small> : null}
        </label>
        <button className="btn-primary" disabled={loginMutation.isPending} type="submit">
          {loginMutation.isPending ? 'Processing...' : t('login.submit')}
        </button>
      </form>
    </div>
  )
}
