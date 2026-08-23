import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { colorStyles } from '../lib/colors'
import { subjectLabel } from '../lib/subjects'
import { Stamp } from './Stamp'

export function AssignmentCard({ assignment, subject, onTogglePin, onToggleDone, onEdit, onDelete, attachmentUrl }) {
  const c = colorStyles(subject?.color)

  return (
    <div
      className={`flex items-center gap-4 bg-[var(--color-card)] rounded-[var(--radius-card)] border border-[var(--color-paper-dim)] p-3 ${
        assignment.done ? 'opacity-50' : ''
      }`}
    >
      <Stamp dueAt={assignment.due_at} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-2 h-2 rounded-full" style={c.dot} />
          <span className="text-xs text-[var(--color-ink-soft)] truncate">
            {subjectLabel(subject)} {subject?.section ? `· Sec ${subject.section}` : ''}
          </span>
        </div>
        <p className={`font-display font-medium text-[var(--color-ink)] truncate ${assignment.done ? 'line-through' : ''}`}>
          {assignment.title}
        </p>
        {assignment.note && (
          <p className="text-sm text-[var(--color-ink-soft)] mt-0.5 line-clamp-2">{assignment.note}</p>
        )}
        <p className="text-xs text-[var(--color-ink-faint)] mt-1">
          กำหนดส่ง {format(new Date(assignment.due_at), 'd MMM yyyy, HH:mm', { locale: th })}
        </p>
        {attachmentUrl && (
          <a
            href={attachmentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-xs text-[var(--color-slate)] underline mt-1"
          >
            ดูไฟล์แนบ
          </a>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <button
          onClick={() => onTogglePin(assignment)}
          className={`text-xs px-2 py-1 rounded-full border transition-colors ${
            assignment.pinned
              ? 'bg-[var(--color-amber-dim)] border-[var(--color-amber)] text-[var(--color-ink)]'
              : 'border-[var(--color-paper-dim)] text-[var(--color-ink-soft)] hover:border-[var(--color-amber)]'
          }`}
        >
          {assignment.pinned ? '📌 ปักหมุดแล้ว' : 'ปักหมุด'}
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleDone(assignment)}
            className="text-xs text-[var(--color-moss)] hover:underline"
          >
            {assignment.done ? 'เปิดใหม่' : 'ทำเสร็จแล้ว'}
          </button>
          <button
            onClick={() => onEdit(assignment)}
            className="text-xs text-[var(--color-slate)] hover:underline"
          >
            แก้ไข
          </button>
          <button
            onClick={() => onDelete(assignment)}
            className="text-xs text-[var(--color-stamp)] hover:underline"
          >
            ลบ
          </button>
        </div>
      </div>
    </div>
  )
}
