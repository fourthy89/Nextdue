// In-app replacement for window.confirm(). The browser's native confirm()
// dialog can't be restyled and looks jarring against the app (title bar
// showing "localhost:5173 says", generic OK/Cancel buttons) — this renders
// a small modal in the app's own design instead.
export function ConfirmDialog({ message, onConfirm, onCancel, confirmLabel = 'ลบ', cancelLabel = 'ยกเลิก' }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--color-ink)]/40 backdrop-blur-[2px] p-4"
      onClick={onCancel}
    >
      <div
        className="bg-[var(--color-paper)] w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--color-paper-dim)] p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-[var(--color-ink)] mb-5 leading-relaxed whitespace-pre-line">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm px-4 py-2 rounded-full border border-[var(--color-paper-dim)] text-[var(--color-ink-soft)] hover:border-[var(--color-ink-faint)]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="text-sm px-4 py-2 rounded-full bg-[var(--color-stamp)] text-white font-medium"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
