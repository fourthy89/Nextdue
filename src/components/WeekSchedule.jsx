import { useRef } from 'react'
import { colorStyles } from '../lib/colors'

const DAY_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
// Thai academic week: Monday through Saturday shown by default.
const VISIBLE_DAYS = [1, 2, 3, 4, 5, 6]

const START_HOUR = 8
const END_HOUR = 20
const HOUR_HEIGHT = 56 // px per hour row

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function WeekSchedule({ subjects, slots, onEditSubject }) {
  const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s]))
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)

  // Manual double-tap detection instead of onDoubleClick: iOS Safari
  // treats a second quick tap as a zoom gesture rather than firing a
  // reliable dblclick event, so we track taps ourselves via onClick,
  // which fires consistently for both touch and mouse.
  const lastTap = useRef({ id: null, time: 0 })

  function handleTap(slotId, subject) {
    const now = Date.now()
    if (lastTap.current.id === slotId && now - lastTap.current.time < 350) {
      lastTap.current = { id: null, time: 0 }
      onEditSubject?.(subject)
    } else {
      lastTap.current = { id: slotId, time: now }
    }
  }

  // Ruled-paper hour lines, generated from HOUR_HEIGHT itself so the
  // lines always land exactly on the hour boundaries the labels use —
  // no separate magic number to keep in sync.
  const ruledLineStyle = {
    backgroundImage: 'linear-gradient(to bottom, rgba(33, 42, 61, 0.08) 1px, transparent 1px)',
    backgroundSize: `100% ${HOUR_HEIGHT}px`,
    backgroundPosition: `0 ${HOUR_HEIGHT}px`,
  }

  return (
    <div className="bg-[var(--color-card)] rounded-[var(--radius-card)] border border-[var(--color-paper-dim)] overflow-x-auto overflow-y-hidden no-scrollbar">
      <div
        className="grid min-w-[640px]"
        style={{ gridTemplateColumns: `56px repeat(${VISIBLE_DAYS.length}, 1fr)` }}
      >
        {/* Header row */}
        <div className="sticky left-0 z-10 bg-[var(--color-card)] border-b border-[var(--color-paper-dim)]" />
        {VISIBLE_DAYS.map((d) => (
          <div
            key={d}
            className="border-b border-l border-[var(--color-paper-dim)] py-2 text-center font-display text-sm font-medium text-[var(--color-ink)]"
          >
            {DAY_LABELS[d]}
          </div>
        ))}

        {/* Time gutter */}
        <div
          className="sticky left-0 z-10 bg-[var(--color-card)] relative shadow-[2px_0_4px_-2px_rgba(33,42,61,0.15)]"
          style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT, ...ruledLineStyle }}
        >
          {hours.map((h, i) => (
            <div
              key={h}
              className="absolute right-1.5 -translate-y-1/2 text-[10px] text-[var(--color-ink-faint)]"
              style={{ top: i * HOUR_HEIGHT }}
            >
              {h}:00
            </div>
          ))}
        </div>

        {/* Day columns */}
        {VISIBLE_DAYS.map((d) => {
          const daySlots = slots.filter((s) => s.day_of_week === d)
          return (
            <div
              key={d}
              className="relative border-l border-[var(--color-paper-dim)]"
              style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT, ...ruledLineStyle }}
            >
              {daySlots.map((slot) => {
                const subject = subjectById[slot.subject_id]
                if (!subject) return null
                const c = colorStyles(subject.color)
                const startMin = timeToMinutes(slot.start_time) - START_HOUR * 60
                const endMin = timeToMinutes(slot.end_time) - START_HOUR * 60
                const top = (startMin / 60) * HOUR_HEIGHT
                const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 28)

                return (
                  <div
                    key={slot.id}
                    className="absolute left-1 right-1 rounded-md border px-1.5 py-1 overflow-hidden cursor-pointer select-none transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    style={{ top, height, ...c.bg, ...c.border, ...c.text }}
                    title={`${subject.code ? subject.code + ' — ' : ''}${subject.name} ${subject.section ? `(${subject.section})` : ''} — แตะสองครั้งเพื่อแก้ไข`}
                    onClick={() => handleTap(slot.id, subject)}
                  >
                    {subject.code && (
                      <p className="text-[11px] font-bold leading-tight truncate">{subject.code}</p>
                    )}
                    <p className={`leading-tight ${subject.code ? 'text-[10px] opacity-90' : 'text-[11px] font-semibold'}`}>
                      {subject.name}
                    </p>
                    {subject.section && (
                      <p className="text-[10px] leading-tight truncate opacity-80">Sec {subject.section}</p>
                    )}
                    {slot.room && height > 44 && (
                      <p className="text-[10px] leading-tight truncate opacity-70">{slot.room}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {subjects.length === 0 && (
        <div className="p-8 text-center text-sm text-[var(--color-ink-soft)]">
          ยังไม่มีวิชาในตาราง — เพิ่มวิชาแรกของคุณเพื่อเริ่มสร้างตารางเรียน
        </div>
      )}
    </div>
  )
}
