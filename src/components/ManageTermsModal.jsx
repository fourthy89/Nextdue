import { useState } from 'react'
import { Modal } from './Modal'
import { supabase } from '../lib/supabaseClient'

/**
 * Create/rename terms directly here. Deleting a term is destructive
 * (cascades to its subjects/schedule/assignments), so that goes through
 * the parent's onDelete → shared ConfirmDialog flow instead of happening
 * inline, same pattern as subject/assignment delete.
 */
export function ManageTermsModal({ userId, terms, onClose, onChanged, onDelete }) {
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [error, setError] = useState('')

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setError('')
    const { error: err } = await supabase.from('terms').insert({ user_id: userId, name: newName.trim() })
    setCreating(false)
    if (err) {
      setError(err.message)
      return
    }
    setNewName('')
    onChanged()
  }

  function startEdit(t) {
    setEditingId(t.id)
    setEditingName(t.name)
  }

  async function saveEdit(t) {
    const name = editingName.trim()
    setEditingId(null)
    if (!name || name === t.name) return
    const { error: err } = await supabase.from('terms').update({ name }).eq('id', t.id)
    if (err) {
      setError(err.message)
      return
    }
    onChanged()
  }

  return (
    <Modal title="จัดการเทอม" onClose={onClose}>
      <div className="space-y-4">
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="เช่น ปี 2 เทอม 2"
            className="flex-1 rounded-lg border border-[var(--color-paper-dim)] bg-[var(--color-card)] px-3 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={creating}
            className="min-h-11 text-sm bg-[var(--color-ink)] text-[var(--color-paper)] px-4 py-2 rounded-lg disabled:opacity-50 shrink-0"
          >
            + เพิ่มเทอม
          </button>
        </form>

        {error && <p className="text-sm text-[var(--color-stamp)]">{error}</p>}

        {terms.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-soft)]">ยังไม่มีเทอมในระบบ — เพิ่มเทอมแรกด้านบน</p>
        ) : (
          <ul className="space-y-2">
            {terms.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-[var(--color-paper-dim)] px-2 py-1"
              >
                {editingId === t.id ? (
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => saveEdit(t)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(t)}
                    className="flex-1 rounded-md border border-[var(--color-paper-dim)] bg-[var(--color-card)] px-2 py-2.5 text-sm"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit(t)}
                    className="flex-1 min-h-11 px-1 text-left text-sm text-[var(--color-ink)]"
                    title="แตะเพื่อแก้ชื่อ"
                  >
                    {t.name}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(t)}
                  className="min-h-11 px-3 text-xs text-[var(--color-stamp)] shrink-0"
                >
                  ลบ
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  )
}
