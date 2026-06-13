import type { FormEventHandler, PropsWithChildren } from 'react'
import { motion, type Variants } from 'motion/react'

const cinematicEase = [0.2, 0.9, 0.22, 1] as const

const cardVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.18,
      staggerChildren: 0.09,
    },
  },
}

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    filter: 'blur(6px)',
  },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.72,
      ease: cinematicEase,
    },
  },
}

type AuthMotionCardProps = PropsWithChildren<{
  className: string
}>

export function AuthMotionCard({ className, children }: AuthMotionCardProps) {
  return (
    <motion.div className={className} variants={cardVariants} initial="hidden" animate="show">
      {children}
    </motion.div>
  )
}

export function AuthMotionGroup({ className, children }: AuthMotionCardProps) {
  return (
    <motion.div className={className} variants={cardVariants} initial="hidden" animate="show">
      {children}
    </motion.div>
  )
}

type AuthMotionFormProps = PropsWithChildren<{
  className: string
  onSubmit: FormEventHandler<HTMLFormElement>
}>

export function AuthMotionForm({ className, onSubmit, children }: AuthMotionFormProps) {
  return (
    <motion.form className={className} variants={cardVariants} initial="hidden" animate="show" onSubmit={onSubmit}>
      {children}
    </motion.form>
  )
}

export function AuthMotionItem({ children }: PropsWithChildren) {
  return <motion.div variants={itemVariants}>{children}</motion.div>
}
