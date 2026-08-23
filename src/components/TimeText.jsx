import { useState, useEffect } from 'react'

/**
 * Plain typed time field, always 24-hour "HH:MM".
 * Avoids native <input type="time">, which renders AM/PM on machines
 * whose OS is set to a 12-hour locale — this field is just text we
 * validate ourselves, so the format never changes with device settings.
 */
function normalizeTime(v) {
  // Supabase's Postgres `time` column comes back as "HH:MM:SS" — keep
  // only the "HH:MM" part so the field never shows the trailing seconds.
  if (!v) return v
  return v.length > 5 ? v.slice(0, 5) : v
}

export function TimeText({ value, onChange, className = '' }) {
  const [draft, setDraft] = useState(normalizeTime(value))

  useEffect(() => setDraft(normalizeTime(value)), [value])

  function handleChange(e) {
    let v = e.target.value.replace(/[^0-9:]/g, '')

    // Auto-insert the colon once the person has typed 2 digits.
    if (v.length === 2 && draft.length === 1) v += ':'

    if (v.length > 5) v = v.slice(0, 5)
    setDraft(v)

    // Only push a value up once it's a complete, valid HH:MM.
    const match = v.match(/^(\d{1,2}):(\d{2})$/)
    if (match) {
      const h = Math.min(23, parseInt(match[1], 10))
      const m = Math.min(59, parseInt(match[2], 10))
      onChange(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }

  function handleBlur() {
    // On blur, snap back to the last valid value if what's typed is incomplete.
    const match = draft.match(/^(\d{1,2}):(\d{2})$/)
    if (match) {
      const h = Math.min(23, parseInt(match[1], 10))
      const m = Math.min(59, parseInt(match[2], 10))
      const clean = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      setDraft(clean)
      onChange(clean)
    } else {
      setDraft(normalizeTime(value))
    }
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder="HH:MM"
      value={draft}
      onChange={handleChange}
      onBlur={handleBlur}
      maxLength={5}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
      className={`min-w-0 rounded-md border border-[var(--color-paper-dim)] bg-[var(--color-card)] px-2 py-1 text-sm text-center ${className}`}
    />
  )
}
