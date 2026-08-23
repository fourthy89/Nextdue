import { colorStyles } from '../lib/colors'
import { subjectLabel } from '../lib/subjects'
import { Stamp } from './Stamp'

export function PinnedRail({ assignments, subjectsById }) {
  if (assignments.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-paper-dim)] p-6 text-center text-sm text-[var(--color-ink-soft)]">
        ยังไม่มีงานที่ปักหมุดไว้ — ปักหมุดงานสำคัญเพื่อให้เห็นตัวนับถอยหลังที่นี่
      </div>
    )
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
      {assignments.map((a) => {
        const subject = subjectsById[a.subject_id]
        const c = colorStyles(subject?.color)
        return (
          <div
            key={a.id}
            className="shrink-0 w-44 bg-[var(--color-card)] rounded-[var(--radius-card)] border-t-4 border-x border-b border-[var(--color-paper-dim)] p-3 shadow-sm"
            style={c.borderTop}
          >
            <div className="flex justify-center mb-2">
              <Stamp dueAt={a.due_at} size="lg" />
            </div>
            <p className="text-xs text-center text-[var(--color-ink-soft)] mb-0.5 truncate">{subjectLabel(subject)}</p>
            <p className="text-sm font-display font-medium text-center text-[var(--color-ink)] line-clamp-2">
              {a.title}
            </p>
          </div>
        )
      })}
    </div>
  )
}
