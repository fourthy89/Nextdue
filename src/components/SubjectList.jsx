import { colorStyles } from '../lib/colors'

export function SubjectList({ subjects, onEdit, onDelete }) {
  if (subjects.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {subjects.map((s) => {
        const c = colorStyles(s.color)
        return (
          <div
            key={s.id}
            className="flex items-center gap-1.5 rounded-full border pl-3 pr-1.5 py-1 text-xs"
            style={{ ...c.border, ...c.bg }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={c.dot} />
            <span className="text-[var(--color-ink)] font-medium">
              {s.name} {s.section ? `· ${s.section}` : ''}
            </span>
            <button
              type="button"
              onClick={() => onEdit(s)}
              aria-label={`แก้ไข ${s.name}`}
              title="แก้ไข"
              className="ml-1 w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/5 text-[var(--color-ink-soft)]"
            >
              ✎
            </button>
            <button
              type="button"
              onClick={() => onDelete(s)}
              aria-label={`ลบ ${s.name}`}
              title="ลบ"
              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/5 text-[var(--color-stamp)]"
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
