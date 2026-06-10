import type { ComponentType, ReactNode } from 'react'

export function StatCard({
  label,
  value,
  trend,
  tone = 'primary',
  icon: Icon,
  footer,
}: {
  label: string
  value: ReactNode
  trend?: ReactNode
  tone?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'neutral'
  icon?: ComponentType<{ size?: number }>
  footer?: ReactNode
}) {
  return (
    <article className={`stat-card stitch-stat stat-tone-${tone}`}>
      <div className="stitch-stat-head">
        {Icon ? <span className="stitch-stat-icon"><Icon size={22} /></span> : <span />}
        {trend ? <span className="stitch-stat-trend">{trend}</span> : null}
      </div>
      <small>{label}</small>
      <strong>{value}</strong>
      {footer ? <p className="stitch-stat-footer">{footer}</p> : null}
    </article>
  )
}
