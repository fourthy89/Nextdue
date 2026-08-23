import { useState } from 'react'
import { Modal } from './Modal'
import { supabase } from '../lib/supabaseClient'
import { subjectLabel } from '../lib/subjects'
import { TimeText } from './TimeText'

// Splits an ISO due_at timestamp back into the local <input type="date">
// and TimeText values the form uses, mirroring how handleSubmit joins them
// back together (new Date(`${dueDate}T${dueTime}:00`) — local time).
function splitDueAt(dueAtIso) {
  const d = new Date(dueAtIso)
  const pad = (n) => String(n).padStart(2, '0')
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

/**
 * Handles both creating a new assignment and editing an existing one.
 * Pass `assignment` to open in edit mode — fields prefill, saving updates
 * the row instead of inserting, and an existing attachment can be kept,
 * replaced (old file removed from Storage), or removed outright.
 */
export function AddAssignmentModal({
  userId,
  subjects,
  assignment = null,
  attachmentUrl = null,
  onClose,
  onCreated,
  onDelete,
}) {
  const isEditing = !!assignment
  const initialDue = assignment ? splitDueAt(assignment.due_at) : null

  const [subjectId, setSubjectId] = useState(assignment?.subject_id ?? subjects[0]?.id ?? '')
  const [title, setTitle] = useState(assignment?.title ?? '')
  const [note, setNote] = useState(assignment?.note ?? '')
  const [dueDate, setDueDate] = useState(initialDue?.date ?? '')
  const [dueTime, setDueTime] = useState(initialDue?.time ?? '23:59')
  const [pinned, setPinned] = useState(assignment?.pinned ?? false)
  const [file, setFile] = useState(null)
  const [removeExisting, setRemoveExisting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const existingAttachmentPath = assignment?.attachment_path ?? null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!subjectId) return setError('กรุณาเลือกวิชา')
    if (!title.trim()) return setError('กรุณาใส่ชื่องาน')
    if (!dueDate) return setError('กรุณาเลือกวันที่กำหนดส่ง')

    setSaving(true)
    setError('')

    // Resolve what attachment_path should end up as, uploading/deleting
    // from Storage as needed. Upload the replacement before deleting the
    // old file, so a failed upload never leaves the assignment with no file.
    let attachmentPath = existingAttachmentPath

    if (file) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${userId}/${Date.now()}_${safeName}`
      const { error: uploadErr } = await supabase.storage.from('attachments').upload(path, file)
      if (uploadErr) {
        setError(`อัปโหลดไฟล์ไม่สำเร็จ: ${uploadErr.message}`)
        setSaving(false)
        return
      }
      if (existingAttachmentPath) {
        await supabase.storage.from('attachments').remove([existingAttachmentPath])
      }
      attachmentPath = path
    } else if (isEditing && removeExisting && existingAttachmentPath) {
      const { error: removeErr } = await supabase.storage.from('attachments').remove([existingAttachmentPath])
      if (removeErr) {
        setError(`ลบไฟล์แนบเดิมไม่สำเร็จ: ${removeErr.message}`)
        setSaving(false)
        return
      }
      attachmentPath = null
    }

    const due_at = new Date(`${dueDate}T${dueTime}:00`).toISOString()

    const payload = {
      subject_id: subjectId,
      title: title.trim(),
      note: note.trim() || null,
      due_at,
      pinned,
      attachment_path: attachmentPath,
    }

    const { error: saveErr } = isEditing
      ? await supabase.from('assignments').update(payload).eq('id', assignment.id)
      : await supabase.from('assignments').insert({ user_id: userId, ...payload })

    setSaving(false)

    if (saveErr) {
      setError(saveErr.message)
      return
    }

    onCreated()
    onClose()
  }

  if (!isEditing && subjects.length === 0) {
    return (
      <Modal title="เพิ่มงาน" onClose={onClose}>
        <p className="text-sm text-[var(--color-ink-soft)]">
          ยังไม่มีวิชาในระบบ — กรุณาเพิ่มวิชาและ section ก่อน จึงจะเพิ่มงานได้
        </p>
      </Modal>
    )
  }

  return (
    <Modal title={isEditing ? 'แก้ไขงาน' : 'เพิ่มงาน / โปรเจกต์ / สอบ'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">วิชา / Section</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-paper-dim)] bg-[var(--color-card)] px-3 py-2 text-sm"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {subjectLabel(s)} {s.section ? `· Sec ${s.section}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">ชื่อหัวข้องาน</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-paper-dim)] bg-[var(--color-card)] px-3 py-2 text-sm"
            placeholder="เช่น การบ้านบทที่ 5"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">วันที่กำหนดส่ง</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-paper-dim)] bg-[var(--color-card)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">เวลา</label>
            <TimeText value={dueTime} onChange={setDueTime} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">โน้ต (ไม่บังคับ)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[var(--color-paper-dim)] bg-[var(--color-card)] px-3 py-2 text-sm"
            placeholder="รายละเอียดเพิ่มเติมจากอาจารย์"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">รูปโจทย์ / ไฟล์แนบ (ไม่บังคับ)</label>

          {isEditing && existingAttachmentPath && !removeExisting && !file && (
            <div className="flex items-center justify-between gap-2 mb-2 text-sm">
              {attachmentUrl ? (
                <a href={attachmentUrl} target="_blank" rel="noreferrer" className="text-[var(--color-slate)] underline truncate">
                  ไฟล์แนบปัจจุบัน
                </a>
              ) : (
                <span className="text-[var(--color-ink-soft)] truncate">มีไฟล์แนบอยู่</span>
              )}
              <button
                type="button"
                onClick={() => setRemoveExisting(true)}
                className="text-xs text-[var(--color-stamp)] shrink-0"
              >
                ลบไฟล์แนบ
              </button>
            </div>
          )}

          {isEditing && removeExisting && !file && (
            <div className="flex items-center justify-between gap-2 mb-2 text-sm">
              <span className="text-[var(--color-ink-faint)]">จะลบไฟล์แนบเดิมเมื่อบันทึก</span>
              <button
                type="button"
                onClick={() => setRemoveExisting(false)}
                className="text-xs text-[var(--color-slate)] shrink-0"
              >
                ยกเลิก
              </button>
            </div>
          )}

          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm"
          />
          {isEditing && (existingAttachmentPath || file) && (
            <p className="text-xs text-[var(--color-ink-faint)] mt-1">
              {file ? 'เลือกไฟล์ใหม่แล้ว — จะแทนที่ไฟล์เดิมตอนบันทึก' : 'เลือกไฟล์ใหม่เพื่อแทนที่ไฟล์เดิม'}
            </p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
          ปักหมุดงานนี้ (แสดงตัวนับถอยหลังด้านบน)
        </label>

        {error && <p className="text-sm text-[var(--color-stamp)]">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[var(--color-ink)] text-[var(--color-paper)] rounded-lg py-2.5 font-medium disabled:opacity-50"
        >
          {saving ? 'กำลังบันทึก...' : isEditing ? 'บันทึกการแก้ไข' : 'บันทึกงาน'}
        </button>

        {isEditing && onDelete && (
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              onDelete(assignment)
              onClose()
            }}
            className="w-full text-[var(--color-stamp)] text-sm py-2 disabled:opacity-50"
          >
            ลบงานนี้
          </button>
        )}
      </form>
    </Modal>
  )
}
