import { useEffect, useRef, useState } from 'react'
import { ShieldCheck, ShieldQuestion, UserRound } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react'
import { Outlet, useLocation } from 'react-router-dom'
import { useT } from '../i18n'

const clinicalImageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgLoK8Rn8KHTmwPvBnJmPp3lrRG94FKTyIyak0UpFvgpS9AtdbM-d_kLwtNaNaWQghOSszuqTgzcBSVNPD6Km1PXynYj0562fGwIO13my7vPqfK-rTpPcIoDglJHxFQZeiOyahpCVDVzCe_UQP0e6exuxQJT60UchDrcaBw-2wrZeyeKPE-vG_gsjUfz01wLHYXSdPDQwp_pyU3ViZG4DFHINLFo609PDHFyaMRtm64fXc8syrMh7ZNpnPdjYQtjupZ-TXAWRC64yF'
const cinematicEase = [0.2, 0.9, 0.22, 1] as const

type AuthDirection = 'to-register' | 'to-login'

type MotionSettings = {
  direction: AuthDirection
  reducedMotion: boolean
}

const panelVariants: Variants = {
  login: ({ reducedMotion }: MotionSettings) => ({
    x: '0%',
    filter: 'saturate(1)',
    boxShadow: '24px 0 64px color-mix(in srgb, var(--primary) 18%, transparent)',
    transition: reducedMotion ? { duration: 0 } : { duration: 1.4, ease: cinematicEase },
  }),
  register: ({ reducedMotion }: MotionSettings) => ({
    x: '122.222%',
    filter: 'saturate(1.08)',
    boxShadow: '-24px 0 64px color-mix(in srgb, var(--primary) 18%, transparent)',
    transition: reducedMotion ? { duration: 0 } : { duration: 1.4, ease: cinematicEase },
  }),
}

const formPanelVariants: Variants = {
  login: ({ reducedMotion }: MotionSettings) => ({
    left: '45%',
    transition: reducedMotion ? { duration: 0 } : { duration: 1.4, ease: cinematicEase },
  }),
  register: ({ reducedMotion }: MotionSettings) => ({
    left: '0%',
    transition: reducedMotion ? { duration: 0 } : { duration: 1.4, ease: cinematicEase },
  }),
}

const formStageVariants: Variants = {
  hidden: ({ direction, reducedMotion }: MotionSettings) => ({
    opacity: 0,
    x: reducedMotion ? 0 : direction === 'to-register' ? 56 : -56,
    scale: reducedMotion ? 1 : 0.985,
    filter: reducedMotion ? 'blur(0px)' : 'blur(8px)',
  }),
  show: ({ reducedMotion }: MotionSettings) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: reducedMotion ? { duration: 0 } : { delay: 0.28, duration: 0.95, ease: cinematicEase },
  }),
  exit: ({ direction, reducedMotion }: MotionSettings) => ({
    opacity: 0,
    x: reducedMotion ? 0 : direction === 'to-register' ? -32 : 32,
    scale: reducedMotion ? 1 : 0.99,
    filter: reducedMotion ? 'blur(0px)' : 'blur(6px)',
    transition: reducedMotion ? { duration: 0 } : { duration: 0.34, ease: cinematicEase },
  }),
}

const brandContentVariants: Variants = {
  hidden: { opacity: 1 },
  show: ({ reducedMotion }: MotionSettings) => ({
    opacity: 1,
    transition: reducedMotion ? { duration: 0 } : { delayChildren: 0.18, staggerChildren: 0.08 },
  }),
}

const brandItemVariants: Variants = {
  hidden: ({ reducedMotion }: MotionSettings) => ({
    opacity: reducedMotion ? 1 : 0,
    y: reducedMotion ? 0 : 18,
    filter: reducedMotion ? 'blur(0px)' : 'blur(6px)',
  }),
  show: ({ reducedMotion }: MotionSettings) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: reducedMotion ? { duration: 0 } : { duration: 0.72, ease: cinematicEase },
  }),
}

export function AuthLayout() {
  const { t } = useT()
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()
  const mode = location.pathname === '/register' ? 'register' : 'login'
  const previousMode = useRef(mode)
  const [direction, setDirection] = useState<AuthDirection>(mode === 'register' ? 'to-register' : 'to-login')
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
  const motionSettings: MotionSettings = { direction, reducedMotion: Boolean(shouldReduceMotion) }

  useEffect(() => {
    if (previousMode.current !== mode) {
      setDirection(mode === 'register' ? 'to-register' : 'to-login')
      previousMode.current = mode
    }
  }, [mode])

  return (
    <div className="auth-layout">
      <main className={`auth-shell auth-shell-${mode} auth-shell-${direction}`}>
        <motion.section
          className="auth-brand-panel"
          aria-label="Panel brand MediFlow Admin"
          variants={panelVariants}
          custom={motionSettings}
          initial={mode}
          animate={mode}
        >
          <img className="auth-brand-image" src={clinicalImageUrl} alt="Lingkungan klinik modern" />
          <div className="auth-brand-pattern" aria-hidden="true" />
          <motion.div
            className="auth-brand-content"
            key={location.pathname}
            variants={brandContentVariants}
            custom={motionSettings}
            initial="hidden"
            animate="show"
          >
            <motion.div className="auth-brand-mark" variants={brandItemVariants} custom={motionSettings}><Icon size={36} /></motion.div>
            <motion.h1 variants={brandItemVariants} custom={motionSettings}>{title}</motion.h1>
            <motion.p variants={brandItemVariants} custom={motionSettings}>{description}</motion.p>
            <motion.div className="auth-brand-metrics" variants={brandItemVariants} custom={motionSettings}>
              <article><small>{metricA.label}</small><strong>{metricA.value}</strong></article>
              <article><small>{metricB.label}</small><strong>{metricB.value}</strong></article>
            </motion.div>
          </motion.div>
        </motion.section>
        <motion.section
          className={`auth-form-panel ${isRegister ? 'auth-form-panel-scroll' : ''}`.trim()}
          variants={formPanelVariants}
          custom={motionSettings}
          initial={mode}
          animate={mode}
        >
          <AnimatePresence mode="wait" custom={motionSettings}>
            <motion.div
              className="auth-form-stage"
              key={location.pathname}
              variants={formStageVariants}
              custom={motionSettings}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </motion.section>
      </main>
    </div>
  )
}
