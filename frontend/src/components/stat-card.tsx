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
        <div className="stitch-stat-label">
          {Icon ? <span className="stitch-stat-icon"><Icon size={18} /></span> : null}
          <small>{label}</small>
        </div>
        {trend ? <span className="stitch-stat-trend">{trend}</span> : null}
      </div>
      <strong>{value}</strong>
      {footer ? <p className="stitch-stat-footer">{footer}</p> : null}
    </article>
  )
}
