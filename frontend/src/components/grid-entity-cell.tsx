import { Activity, CircleUserRound, FileText, Pill, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type GridEntityKind = 'patient' | 'service' | 'diagnosis' | 'medicine' | 'user' | 'record' | 'default'

const iconByKind: Record<GridEntityKind, LucideIcon> = {
  patient: Users,
  service: Activity,
  diagnosis: FileText,
  medicine: Pill,
  user: CircleUserRound,
  record: FileText,
  default: CircleUserRound,
}

function getEntityInitials(value: unknown, fallback = 'NA') {
  const text = String(value ?? '').trim()
  if (!text || text === '-') return fallback
  const parts = text.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || fallback
}

export function GridEntityCell({
  primary,
  secondary,
  kind = 'default',
}: {
  primary: unknown
  secondary?: unknown
  kind?: GridEntityKind
}) {
  const text = String(primary ?? '').trim() || '-'
  const subline = secondary == null ? '' : String(secondary).trim()
  const Icon = iconByKind[kind]

  return (
    <div className={`grid-entity-cell entity-${kind}`}>
      <span className="grid-entity-avatar" aria-hidden="true">
        <span>{getEntityInitials(text, kind === 'patient' ? 'PX' : 'NA')}</span>
        <i><Icon size={10} /></i>
      </span>
      <span className="grid-entity-main">
        <strong>{text}</strong>
        {subline ? <small>{subline}</small> : null}
      </span>
    </div>
  )
}
