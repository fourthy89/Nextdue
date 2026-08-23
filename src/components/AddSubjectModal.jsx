import { useState } from 'react'
import { Modal } from './Modal'
import { PRESET_COLORS } from '../lib/colors'
import { supabase } from '../lib/supabaseClient'
import { TimeText } from './TimeText'

const DAY_OPTIONS = [
  { value: 1, label: 'จันทร์' },
  { value: 2, label: 'อังคาร' },
  { value: 3, label: 'พุธ' },
  { value: 4, label: 'พฤหัสบดี' },
  { value: 5, label: 'ศุกร์' },
  { value: 6, label: 'เสาร์' },
  { value: 0, label: 'อาทิตย์' },
]

const emptySlot = () => ({ day_of_week: 1, start_time: '09:00', end_time: '12:00', room: '' })

/**
 * Handles both creating a new subject and editing an existing one.
 * Pass `subject` (+ its `existingSlots`) to open in edit mode —
 * fields prefill, and saving updates the row instead of inserting a new one.
 */
export function AddSubjectModal({
  userId,
  subject = null,
  existingSlots = [],
  terms = [],
  defaultTermId = null,
  onClose,
  onCreated,
  onDelete,
}) {
  const isEditing = !!subject

  const [code, setCode] = useState(subject?.code ?? '')
  const [name, setName] = useState(subject?.name ?? '')
  const [section, setSection] = useState(subject?.section ?? '')
  const [termId, setTermId] = useState(subject?.term_id ?? defaultTermId ?? terms[0]?.id ?? '')
  const [color, setColor] = useState(subject?.color ?? PRESET_COLORS[0].hex)
  const [slots, setSlots] = useState(
    existingSlots.length > 0
      ? existingSlots.map((s) => ({
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          room: s.room ?? '',
        }))
      : [emptySlot()]
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateSlot(i, patch) {
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return setError('กรุณาใส่ชื่อวิชา')
    if (!termId) return setError('กรุณาเลือกเทอม')
    setSaving(true)
    setError('')

    const subjectPayload = {
      code: code.trim() || null,
      name: name.trim(),
      section: section.trim() || null,
      color,
      term_id: termId,
    }
    let subjectId

    if (isEditing) {
      const { error: updErr } = await supabase.from('subjects').update(subjectPayload).eq('id', subject.id)
      if (updErr) {
        setError(updErr.message)
        setSaving(false)
        return
      }
      subjectId = subject.id

      // Simplest correct way to sync slots: replace them wholesale.
      const { error: delErr } = await supabase.from('schedule_slots').delete().eq('subject_id', subjectId)
      if (delErr) {
        setError(delErr.message)
        setSaving(false)
        return
      }
    } else {
      const { data: created, error: subjErr } = await supabase
        .from('subjects')
        .insert({ user_id: userId, ...subjectPayload })
        .select()
        .single()

      if (subjErr) {
        setError(subjErr.message)
        setSaving(false)
        return
      }
      subjectId = created.id
    }

    const rows = slots.map((s) => ({
      user_id: userId,
      subject_id: subjectId,
      day_of_week: s.day_of_week,
      start_time: s.start_time,
      end_time: s.end_time,
      room: s.room.trim() || null,
    }))

    const { error: slotErr } = await supabase.from('schedule_slots').insert(rows)
    setSaving(false)

    if (slotErr) {
      setError(slotErr.message)
      return
    }

    onCreated()
    onClose()
  }

  return (
    <Modal title={isEditing ? 'แก้ไขวิชา' : 'เพิ่มวิชาใหม่'} onClose={onClose}>
      {!isEditing && terms.length === 0 ? (
        <p className="text-sm text-[var(--color-ink-soft)]">
          ยังไม่มีเทอมในระบบ — กรุณาสร้างเทอมก่อน (ปุ่ม "จัดการเทอม") จึงจะเพิ่มวิชาได้
        </p>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">รหัสวิชา</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-paper-dim)] bg-[var(--color-card)] px-3 py-2 text-sm"
            placeholder="เช่น CS454"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">ชื่อวิชา</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-paper-dim)] bg-[var(--color-card)] px-3 py-2 text-sm"
            placeholder="เช่น โครงสร้างข้อมูล"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Section</label>
          <input
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-paper-dim)] bg-[var(--color-card)] px-3 py-2 text-sm"
            placeholder="เช่น 001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">เทอม</label>
          <select
            value={termId}
            onChange={(e) => setTermId(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-paper-dim)] bg-[var(--color-card)] px-3 py-2 text-sm"
          >
            {terms.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">สี</label>
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_COLORS.map((preset) => (
              <button
                type="button"
                key={preset.hex}
                onClick={() => setColor(preset.hex)}
                aria-label={preset.label}
                title={preset.label}
                style={{ backgroundColor: preset.hex }}
                className={`w-8 h-8 rounded-full ${
                  color === preset.hex ? 'ring-2 ring-offset-2 ring-[var(--color-ink)]' : ''
                }`}
              />
            ))}

            {/* Free color picker — pick literally any color */}
            <label
              className="relative w-8 h-8 rounded-full border-2 border-dashed border-[var(--color-ink-faint)] flex items-center justify-center cursor-pointer overflow-hidden"
              title="เลือกสีเอง"
              style={
                !PRESET_COLORS.some((p) => p.hex === color)
                  ? { backgroundColor: color, borderStyle: 'solid', borderColor: 'var(--color-ink)' }
                  : {}
              }
            >
              {PRESET_COLORS.some((p) => p.hex === color) && (
                <span className="text-xs text-[var(--color-ink-faint)]">+</span>
              )}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>

            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#RRGGBB"
              maxLength={7}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              name="subject-color-hex"
              className="w-24 rounded-md border border-[var(--color-paper-dim)] bg-[var(--color-card)] px-2 py-1.5 text-xs font-mono"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-[var(--color-ink)]">เวลาเรียนประจำสัปดาห์</label>
            <button
              type="button"
              onClick={() => setSlots((p) => [...p, emptySlot()])}
              className="text-xs text-[var(--color-slate)] underline"
            >
              + เพิ่มคาบ
            </button>
          </div>
          <div className="space-y-3">
            {slots.map((slot, i) => (
              <div key={i} className="rounded-lg border border-[var(--color-paper-dim)] p-3 space-y-2">
                <div className="flex gap-2 items-center">
                  <select
                    value={slot.day_of_week}
                    onChange={(e) => updateSlot(i, { day_of_week: Number(e.target.value) })}
                    className="flex-1 rounded-md border border-[var(--color-paper-dim)] bg-[var(--color-card)] px-2 py-1.5 text-sm"
                  >
                    {DAY_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  {slots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSlots((p) => p.filter((_, idx) => idx !== i))}
                      className="text-[var(--color-stamp)] text-sm px-2"
                      aria-label="ลบคาบนี้"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <TimeText value={slot.start_time} onChange={(v) => updateSlot(i, { start_time: v })} className="w-[4.5rem]" />
                  <span className="text-xs text-[var(--color-ink-faint)]">ถึง</span>
                  <TimeText value={slot.end_time} onChange={(v) => updateSlot(i, { end_time: v })} className="w-[4.5rem]" />
                </div>
                <input
                  value={slot.room}
                  onChange={(e) => updateSlot(i, { room: e.target.value })}
                  placeholder="ห้อง (ไม่บังคับ)"
                  className="w-full rounded-md border border-[var(--color-paper-dim)] bg-[var(--color-card)] px-2 py-1.5 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-[var(--color-stamp)]">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[var(--color-ink)] text-[var(--color-paper)] rounded-lg py-2.5 font-medium disabled:opacity-50"
        >
          {saving ? 'กำลังบันทึก...' : isEditing ? 'บันทึกการแก้ไข' : 'บันทึกวิชา'}
        </button>

        {isEditing && onDelete && (
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              onDelete(subject)
              onClose()
            }}
            className="w-full text-[var(--color-stamp)] text-sm py-2 disabled:opacity-50"
          >
            ลบวิชานี้
          </button>
        )}
      </form>
      )}
    </Modal>
  )
}
