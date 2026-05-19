import { useMemo, useState } from 'react'

type ComboboxOption = {
  value: string
  label: string
}

type SearchableComboboxProps = {
  inputId?: string
  value: string
  onChange: (value: string) => void
  options: ComboboxOption[]
  placeholder?: string
  disabled?: boolean
  strictSelect?: boolean
  loading?: boolean
  emptyText?: string
  recentKey?: string
  onStrictClear?: () => void
}

export function SearchableCombobox({
  inputId,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  strictSelect = false,
  loading = false,
  emptyText = 'Tidak ada hasil.',
  recentKey,
  onStrictClear,
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const listId = useMemo(() => `combobox-list-${Math.random().toString(36).slice(2, 9)}`, [])

  const recentValues = useMemo(() => {
    if (!recentKey) return [] as string[]
    try {
      const raw = localStorage.getItem(`combobox-recent-${recentKey}`)
      const parsed = raw ? (JSON.parse(raw) as string[]) : []
      return Array.isArray(parsed) ? parsed.slice(0, 5) : []
    } catch {
      return []
    }
  }, [recentKey, value])

  const filtered = useMemo(() => {
    const recent = recentValues
      .map((v) => options.find((o) => o.value === v))
      .filter((x): x is ComboboxOption => Boolean(x))
    const source = query.trim() ? query.trim().toLowerCase() : value.trim().toLowerCase()
    if (!source) {
      const merged = [...recent, ...options.filter((o) => !recent.some((r) => r.value === o.value))]
      return merged.slice(0, 12)
    }
    return options
      .filter((item) => item.value.toLowerCase().includes(source) || item.label.toLowerCase().includes(source))
      .slice(0, 12)
  }, [options, query, value, recentValues])

  const activeOption = filtered[activeIndex]

  function applyOption(next: ComboboxOption) {
    onChange(next.value)
    setQuery(next.value)
    setOpen(false)
    if (recentKey) {
      try {
        const raw = localStorage.getItem(`combobox-recent-${recentKey}`)
        const parsed = raw ? (JSON.parse(raw) as string[]) : []
        const merged = [next.value, ...parsed.filter((x) => x !== next.value)].slice(0, 5)
        localStorage.setItem(`combobox-recent-${recentKey}`, JSON.stringify(merged))
      } catch {
        // ignore storage issue
      }
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        id={inputId}
        className="search-input"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && activeOption ? `${listId}-${activeIndex}` : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 140)
          if (!strictSelect) return
          const found = options.some((item) => item.value === value)
          if (!found) {
            onChange('')
            onStrictClear?.()
          }
        }}
        onKeyDown={(event) => {
          if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            setOpen(true)
            return
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActiveIndex((prev) => Math.min(prev + 1, Math.max(filtered.length - 1, 0)))
            return
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActiveIndex((prev) => Math.max(prev - 1, 0))
            return
          }
          if (event.key === 'Enter' && open && activeOption) {
            event.preventDefault()
            applyOption(activeOption)
            return
          }
          if (event.key === 'Escape') {
            setOpen(false)
          }
        }}
        onChange={(event) => {
          onChange(event.target.value)
          setQuery(event.target.value)
          setActiveIndex(0)
          if (!open) setOpen(true)
        }}
      />
      {open ? (
        <div
          id={listId}
          role="listbox"
          style={{
            position: 'absolute',
            zIndex: 40,
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            maxHeight: 220,
            overflow: 'auto',
            border: '1px solid var(--border)',
            borderRadius: 10,
            background: 'var(--surface)',
            boxShadow: 'var(--shadow)',
          }}
        >
          {loading ? (
            <p style={{ margin: 0, padding: '8px 10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Memuat referensi...</p>
          ) : filtered.length === 0 ? (
            <p style={{ margin: 0, padding: '8px 10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{emptyText}</p>
          ) : (
            filtered.map((option, index) => (
              <button
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                type="button"
                className="icon-btn"
                style={{ width: '100%', border: 0, borderRadius: 0, justifyContent: 'flex-start', padding: '8px 10px', background: index === activeIndex ? 'var(--surface-muted)' : 'transparent' }}
                onMouseDown={(event) => {
                  event.preventDefault()
                  applyOption(option)
                }}
              >
                <span style={{ fontWeight: 700 }}>{option.value}</span>
                <span style={{ color: 'var(--text-muted)' }}>{option.label}</span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}
