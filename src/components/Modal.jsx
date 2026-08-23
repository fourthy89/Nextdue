import { useEffect } from 'react'

export function Modal({ title, onClose, children }) {
  // Lock the background page from scrolling while this modal is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--color-ink)]/40 backdrop-blur-[2px] p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-paper)] w-full sm:max-w-md sm:rounded-[var(--radius-card)] rounded-t-2xl border border-[var(--color-paper-dim)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-paper-dim)] sticky top-0 bg-[var(--color-paper)]">
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="ปิด"
            className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
