import { useState } from 'react'

const SOON_MS = 48 * 60 * 60 * 1000 // flag anything due within 48 hours

export function DueSoonBanner({ assignments, subjectsById }) {
  const [dismissed, setDismissed] = useState(false)
  const now = Date.now()

  const dueSoon = assignments
    .filter((a) => !a.done)
    .filter((a) => {
      const diff = new Date(a.due_at).getTime() - now
      return diff > 0 && diff <= SOON_MS
    })
    .sort((a, b) => new Date(a.due_at) - new Date(b.due_at))

  if (dismissed || dueSoon.length === 0) return null

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-stamp)] bg-[var(--color-stamp-dim)]/40 px-4 py-3 flex items-start gap-3">
      <span className="text-lg leading-none mt-0.5">⏰</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-ink)] mb-1">
          มีงานใกล้ถึงกำหนดส่งใน 48 ชั่วโมง ({dueSoon.length})
        </p>
        <ul className="text-sm text-[var(--color-ink-soft)] space-y-0.5">
          {dueSoon.slice(0, 4).map((a) => (
            <li key={a.id} className="truncate">
              <span className="font-medium text-[var(--color-ink)]">{a.title}</span>
              {' — '}
              {subjectsById[a.subject_id]?.name}
              {' · '}
              {new Date(a.due_at).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })}
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="ปิดการแจ้งเตือน"
        className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] text-lg leading-none shrink-0"
      >
        ×
      </button>
    </div>
  )
}
