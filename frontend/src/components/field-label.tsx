import type { CSSProperties, ReactNode } from 'react'

type FieldLabelProps = {
  text: string
  htmlFor?: string
  hint?: string
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export function FieldLabel({ text, htmlFor, hint, className, style, children }: FieldLabelProps) {
  return (
    <label className={className ? `field-label ${className}` : 'field-label'} htmlFor={htmlFor} style={style}>
      <span>{text}</span>
      {hint ? <small className="field-label-hint">{hint}</small> : null}
      {children}
    </label>
  )
}
