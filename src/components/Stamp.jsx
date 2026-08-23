import { useCountdown } from '../hooks/useCountdown'

/**
 * The app's signature element: a rubber-stamp style badge showing
 * days remaining until a due date, styled after a library due-date stamp.
 */
export function Stamp({ dueAt, size = 'md' }) {
  const { days, hours, overdue } = useCountdown(dueAt)

  const dims = size === 'lg' ? 'w-24 h-24' : 'w-16 h-16'
  const bigText = size === 'lg' ? 'text-3xl' : 'text-xl'
  const smallText = size === 'lg' ? 'text-[11px]' : 'text-[9px]'

  let big = days
  let unit = 'วัน'
  if (days === 0) {
    big = hours
    unit = 'ชม.'
  }

  return (
    <div
      className={`stamp ${dims} ${overdue ? '' : ''}`}
      style={{ borderColor: overdue ? 'var(--color-ink-faint)' : undefined }}
      aria-label={overdue ? 'เลยกำหนดส่งแล้ว' : `เหลือ ${big} ${unit}`}
    >
      <span className={`${bigText} font-semibold leading-none tabular-nums`}>
        {overdue ? '—' : big}
      </span>
      <span className={`${smallText} tracking-wide uppercase leading-none mt-1`}>
        {overdue ? 'เลยกำหนด' : unit}
      </span>
    </div>
  )
}
