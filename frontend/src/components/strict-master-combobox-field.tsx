import { SearchableCombobox } from './searchable-combobox'

type StrictMasterComboboxFieldProps = {
  inputId?: string
  value: string
  onChange: (next: string) => void
  placeholder: string
  options: Array<{ value: string; label: string }>
  loading?: boolean
  recentKey?: string
  disabled?: boolean
  errorMessage: string
  onStrictError: (message: string) => void
  helperText?: string
}

export function StrictMasterComboboxField({
  inputId,
  value,
  onChange,
  placeholder,
  options,
  loading = false,
  recentKey,
  disabled = false,
  errorMessage,
  onStrictError,
  helperText = 'Wajib pilih dari data master.',
}: StrictMasterComboboxFieldProps) {
  const trimmedValue = value.trim()
  const isMatched = trimmedValue ? options.some((item) => item.value === trimmedValue) : false
  const helperTone = !trimmedValue ? 'var(--text-muted)' : isMatched ? 'var(--success-text)' : 'var(--danger-text)'
  const helperMessage = !trimmedValue ? helperText : isMatched ? 'Master: terhubung.' : 'Master: pilih dari daftar.'
  const helperPrefix = !trimmedValue ? '[i]' : isMatched ? '[OK]' : '[!]'

  return (
    <div>
      <SearchableCombobox
        inputId={inputId}
        value={value}
        onChange={onChange}
        onStrictClear={() => onStrictError(errorMessage)}
        placeholder={placeholder}
        options={options}
        strictSelect
        loading={loading}
        recentKey={recentKey}
        disabled={disabled}
      />
      <small className="field-helper" style={{ marginTop: 6, display: 'block', color: helperTone }}>{helperPrefix} {helperMessage}</small>
    </div>
  )
}
