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
}: StrictMasterComboboxFieldProps) {
  const trimmedValue = value.trim()
  const isMatched = trimmedValue ? options.some((item) => item.value === trimmedValue) : false
  const helperTone = isMatched ? 'var(--success-text)' : 'var(--danger-text)'
  const helperMessage = isMatched ? 'Master: terhubung.' : 'Master: pilih dari daftar.'

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
      {trimmedValue ? <small className="field-helper" style={{ marginTop: 6, display: 'block', color: helperTone }}>{helperMessage}</small> : null}
    </div>
  )
}
