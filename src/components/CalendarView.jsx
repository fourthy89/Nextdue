import { useState } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  format,
} from 'date-fns'
import { th } from 'date-fns/locale'
import { colorStyles } from '../lib/colors'

const DAY_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const MAX_DOTS = 3

// Local-time "yyyy-MM-dd" key for grouping assignments by calendar day —
// due_at is a full ISO timestamp, but the calendar cares about the day it
// falls on in the person's own timezone, not UTC.
export function dateKey(isoOrDate) {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * Month grid showing which days have assignments due, via colored dots
 * (one per subject color, matching WeekSchedule's palette). Tapping a day
 * selects it — the parent uses `selectedDate` to filter the list shown
 * below the calendar. Tapping the same day again clears the selection.
 */
export function CalendarView({ assignments, subjectsById, selectedDate, onSelectDate }) {
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()))

  const gridStart = startOfWeek(startOfMonth(monthCursor))
  const gridEnd = endOfWeek(endOfMonth(monthCursor))
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const byDay = {}
  for (const a of assignments) {
    const key = dateKey(a.due_at)
    ;(byDay[key] ??= []).push(a)
  }

  return (
    <div className="bg-[var(--color-card)] rounded-[var(--radius-card)] border border-[var(--color-paper-dim)] p-3">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setMonthCursor((m) => subMonths(m, 1))}
          aria-label="เดือนก่อนหน้า"
          className="w-11 h-11 flex items-center justify-center rounded-full border border-[var(--color-paper-dim)] text-[var(--color-ink-soft)] text-lg"
        >
          ‹
        </button>
        <p className="font-display text-sm font-semibold text-[var(--color-ink)]">
          {format(monthCursor, 'MMMM yyyy', { locale: th })}
        </p>
        <button
          type="button"
          onClick={() => setMonthCursor((m) => addMonths(m, 1))}
          aria-label="เดือนถัดไป"
          className="w-11 h-11 flex items-center justify-center rounded-full border border-[var(--color-paper-dim)] text-[var(--color-ink-soft)] text-lg"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-[var(--color-ink-faint)] py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = dateKey(day)
          const dayAssignments = byDay[key] ?? []
          const inMonth = isSameMonth(day, monthCursor)
          const selected = selectedDate === key
          const today = isToday(day)
          const hasWork = dayAssignments.length > 0

          return (
            <button
              type="button"
              key={key}
              onClick={() => onSelectDate(selected ? null : key)}
              className={`h-11 sm:h-12 rounded-md flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                selected
                  ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
                  : today
                    ? 'border border-[var(--color-stamp)] text-[var(--color-ink)]'
                    : hasWork
                      ? 'bg-[var(--color-stamp-dim)] text-[var(--color-ink)] hover:brightness-95'
                      : 'text-[var(--color-ink)] hover:bg-[var(--color-paper)]'
              } ${!inMonth ? 'opacity-30' : ''}`}
            >
              <span className={hasWork && !selected ? 'font-semibold' : ''}>{format(day, 'd')}</span>
              {hasWork && (
                <span className="flex items-center gap-1">
                  {dayAssignments.slice(0, MAX_DOTS).map((a, i) => {
                    const c = colorStyles(subjectsById[a.subject_id]?.color)
                    return (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={selected ? { backgroundColor: 'currentColor' } : c.dot}
                      />
                    )
                  })}
                  {dayAssignments.length > MAX_DOTS && (
                    <span className="text-[9px] leading-none">+{dayAssignments.length - MAX_DOTS}</span>
                  )}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
