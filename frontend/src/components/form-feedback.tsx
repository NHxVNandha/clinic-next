type FormFeedbackProps = {
  errors?: Array<string | undefined | null>
  helperText?: string
}

export function FormFeedback({ errors = [], helperText }: FormFeedbackProps) {
  const normalized = errors.filter((item): item is string => Boolean(item && item.trim()))

  return (
    <>
      {normalized.map((message) => (
        <p key={message} className="field-error">
          {message}
        </p>
      ))}
      {helperText ? <p className="field-helper">{helperText}</p> : null}
    </>
  )
}
