import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { subjectLabel } from '../lib/subjects'
import { Header } from '../components/Header'
import { WeekSchedule } from '../components/WeekSchedule'
import { PinnedRail } from '../components/PinnedRail'
import { AssignmentCard } from '../components/AssignmentCard'
import { DueSoonBanner } from '../components/DueSoonBanner'
import { AddSubjectModal } from '../components/AddSubjectModal'
import { AddAssignmentModal } from '../components/AddAssignmentModal'
import { ManageTermsModal } from '../components/ManageTermsModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { CalendarView, dateKey } from '../components/CalendarView'

const STATUS_OPTIONS = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'todo', label: 'ยังไม่ทำ' },
  { value: 'done', label: 'ทำแล้ว' },
]

export function Dashboard() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [slots, setSlots] = useState([])
  const [assignments, setAssignments] = useState([])
  const [terms, setTerms] = useState([])
  const [attachmentUrls, setAttachmentUrls] = useState({})
  const [loading, setLoading] = useState(true)
  const [filterSubject, setFilterSubject] = useState(() => localStorage.getItem('nextdue:filterSubject') || 'all')
  const [selectedTermId, setSelectedTermId] = useState(() => localStorage.getItem('nextdue:selectedTermId') || 'all')
  const [filterStatus, setFilterStatus] = useState(() => localStorage.getItem('nextdue:filterStatus') || 'all')
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('nextdue:viewMode') || 'list')
  const [selectedDate, setSelectedDate] = useState(null)
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState(null) // { message, onConfirm } | null — in-app replacement for window.confirm()

  const loadAll = useCallback(async () => {
    setLoading(true)
    const [{ data: subj }, { data: sl }, { data: asg }, { data: trm }] = await Promise.all([
      supabase.from('subjects').select('*').order('created_at'),
      supabase.from('schedule_slots').select('*'),
      supabase.from('assignments').select('*').order('due_at'),
      supabase.from('terms').select('*').order('created_at'),
    ])
    setSubjects(subj ?? [])
    setSlots(sl ?? [])
    setAssignments(asg ?? [])
    setTerms(trm ?? [])
    setLoading(false)

    // Resolve signed URLs for any attachments (bucket is private).
    const withFiles = (asg ?? []).filter((a) => a.attachment_path)
    const urlEntries = await Promise.all(
      withFiles.map(async (a) => {
        const { data } = await supabase.storage.from('attachments').createSignedUrl(a.attachment_path, 3600)
        return [a.id, data?.signedUrl]
      })
    )
    setAttachmentUrls(Object.fromEntries(urlEntries))
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // Remember the person's filter choices across refreshes — mainly so
  // "ยังไม่ทำ" (the status they usually leave it on) doesn't silently
  // reset back to "ทั้งหมด" every reload.
  useEffect(() => {
    localStorage.setItem('nextdue:filterSubject', filterSubject)
  }, [filterSubject])
  useEffect(() => {
    localStorage.setItem('nextdue:selectedTermId', selectedTermId)
  }, [selectedTermId])
  useEffect(() => {
    localStorage.setItem('nextdue:filterStatus', filterStatus)
  }, [filterStatus])
  useEffect(() => {
    localStorage.setItem('nextdue:viewMode', viewMode)
  }, [viewMode])

  const subjectsById = Object.fromEntries(subjects.map((s) => [s.id, s]))

  // Subjects visible under the current term filter — everything else
  // (schedule, subject dropdown, assignment list) narrows from this.
  const termSubjects = selectedTermId === 'all' ? subjects : subjects.filter((s) => s.term_id === selectedTermId)
  const termSubjectIds = new Set(termSubjects.map((s) => s.id))
  const termSlots = slots.filter((sl) => termSubjectIds.has(sl.subject_id))

  function handleTermChange(id) {
    setSelectedTermId(id)
    setFilterSubject('all') // avoid a stale subject selection from a different term
  }

  async function togglePin(a) {
    setAssignments((prev) => prev.map((x) => (x.id === a.id ? { ...x, pinned: !x.pinned } : x)))
    await supabase.from('assignments').update({ pinned: !a.pinned }).eq('id', a.id)
  }

  async function toggleDone(a) {
    setAssignments((prev) => prev.map((x) => (x.id === a.id ? { ...x, done: !x.done } : x)))
    await supabase.from('assignments').update({ done: !a.done }).eq('id', a.id)
  }

  function deleteAssignment(a) {
    setConfirmDialog({
      message: `ลบ "${a.title}" ใช่หรือไม่?`,
      onConfirm: async () => {
        setAssignments((prev) => prev.filter((x) => x.id !== a.id))
        await supabase.from('assignments').delete().eq('id', a.id)
        // Row is gone either way once confirmed; clean up its Storage file too
        // so deleted assignments don't leave orphaned files in the bucket.
        if (a.attachment_path) {
          await supabase.storage.from('attachments').remove([a.attachment_path])
        }
      },
    })
  }

  function deleteSubject(s) {
    const assignmentCount = assignments.filter((a) => a.subject_id === s.id).length
    const warning =
      assignmentCount > 0
        ? `ลบวิชา "${s.name}" จะลบงาน/โปรเจกต์/สอบที่ผูกกับวิชานี้ทั้งหมดด้วย (${assignmentCount} รายการ) ใช่หรือไม่?`
        : `ลบวิชา "${s.name}" ใช่หรือไม่?`

    setConfirmDialog({
      message: warning,
      onConfirm: async () => {
        setSubjects((prev) => prev.filter((x) => x.id !== s.id))
        setSlots((prev) => prev.filter((x) => x.subject_id !== s.id))
        setAssignments((prev) => prev.filter((x) => x.subject_id !== s.id))
        // schedule_slots and assignments both cascade-delete via the FK in schema.sql
        await supabase.from('subjects').delete().eq('id', s.id)
      },
    })
  }

  function deleteTerm(t) {
    const subjectIds = new Set(subjects.filter((s) => s.term_id === t.id).map((s) => s.id))
    const assignmentCount = assignments.filter((a) => subjectIds.has(a.subject_id)).length
    const warning =
      subjectIds.size > 0
        ? `ลบเทอม "${t.name}" จะลบวิชา (${subjectIds.size} วิชา) และงาน/โปรเจกต์/สอบที่ผูกกับเทอมนี้ทั้งหมดด้วย (${assignmentCount} รายการ) ใช่หรือไม่?`
        : `ลบเทอม "${t.name}" ใช่หรือไม่?`

    setConfirmDialog({
      message: warning,
      onConfirm: async () => {
        setTerms((prev) => prev.filter((x) => x.id !== t.id))
        setSubjects((prev) => prev.filter((s) => !subjectIds.has(s.id)))
        setSlots((prev) => prev.filter((sl) => !subjectIds.has(sl.subject_id)))
        setAssignments((prev) => prev.filter((a) => !subjectIds.has(a.subject_id)))
        if (selectedTermId === t.id) setSelectedTermId('all')
        // subjects (→ schedule_slots, assignments) cascade-delete via the FK
        // added in migration_terms_and_code.sql
        await supabase.from('terms').delete().eq('id', t.id)
      },
    })
  }

  const pinned = assignments.filter((a) => a.pinned && !a.done && termSubjectIds.has(a.subject_id))
  const upcoming = assignments
    .filter((a) => termSubjectIds.has(a.subject_id))
    .filter((a) => (filterSubject === 'all' ? true : a.subject_id === filterSubject))
    .filter((a) => (filterStatus === 'all' ? true : filterStatus === 'done' ? a.done : !a.done))
    .sort((a, b) => new Date(a.due_at) - new Date(b.due_at))

  // In calendar view, the list only shows once a day is picked — no day
  // picked means no list, not "everything" (list view still shows everything).
  const visibleAssignments =
    viewMode === 'calendar'
      ? selectedDate
        ? upcoming.filter((a) => dateKey(a.due_at) === selectedDate)
        : []
      : upcoming

  return (
    <div className="max-w-5xl mx-auto px-4 pb-24">
      <Header />

      <DueSoonBanner assignments={assignments} subjectsById={subjectsById} />

      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">งานที่ปักหมุด</h2>
        </div>
        <PinnedRail assignments={pinned} subjectsById={subjectsById} />
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">ตารางเรียน</h2>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="relative min-w-0">
              <select
                value={selectedTermId}
                onChange={(e) => handleTermChange(e.target.value)}
                className="appearance-none text-sm rounded-full border border-[var(--color-paper-dim)] bg-[var(--color-card)] pl-3 pr-8 py-1.5 max-w-[9rem] truncate"
              >
                <option value="all">ทุกเทอม</option>
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--color-ink-soft)]"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <button
              onClick={() => setShowTermsModal(true)}
              className="shrink-0 whitespace-nowrap text-sm border border-[var(--color-paper-dim)] text-[var(--color-ink)] px-3 py-1.5 rounded-full"
            >
              จัดการเทอม
            </button>
            <button
              onClick={() => setShowSubjectModal(true)}
              className="shrink-0 whitespace-nowrap text-sm bg-[var(--color-ink)] text-[var(--color-paper)] px-3 py-1.5 rounded-full"
            >
              + เพิ่มวิชา
            </button>
          </div>
        </div>
        {termSubjects.length > 0 && (
          <p className="text-xs text-[var(--color-ink-faint)] mb-2">
            แตะที่คาบเรียนในตารางสองครั้งติดกันเพื่อแก้ไขวิชานั้น
          </p>
        )}
        <WeekSchedule subjects={termSubjects} slots={termSlots} onEditSubject={setEditingSubject} />
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">งาน / โปรเจกต์ / สอบ</h2>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="relative min-w-0">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="appearance-none text-sm rounded-full border border-[var(--color-paper-dim)] bg-[var(--color-card)] pl-3 pr-8 py-1.5 max-w-[10rem] truncate"
              >
                <option value="all">ทุกวิชา</option>
                {termSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {subjectLabel(s)}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--color-ink-soft)]"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="shrink-0 whitespace-nowrap text-sm bg-[var(--color-stamp)] text-white px-3 py-1.5 rounded-full"
            >
              + เพิ่มงาน
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-1 w-fit rounded-full border border-[var(--color-paper-dim)] bg-[var(--color-card)] p-0.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  filterStatus === opt.value
                    ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
                    : 'text-[var(--color-ink-soft)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 w-fit rounded-full border border-[var(--color-paper-dim)] bg-[var(--color-card)] p-0.5">
            {[
              { value: 'list', label: 'รายการ' },
              { value: 'calendar', label: 'ปฏิทิน' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setViewMode(opt.value)
                  setSelectedDate(null)
                }}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  viewMode === opt.value
                    ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
                    : 'text-[var(--color-ink-soft)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'calendar' && (
          <div className="mb-3">
            <CalendarView
              assignments={upcoming}
              subjectsById={subjectsById}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-xs text-[var(--color-slate)] underline mt-2"
              >
                ล้างวันที่เลือก — แสดงทุกวัน
              </button>
            )}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-[var(--color-ink-soft)]">กำลังโหลด...</p>
        ) : visibleAssignments.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-soft)]">
            {viewMode === 'calendar' && !selectedDate
              ? 'แตะวันที่ในปฏิทินเพื่อดูงานของวันนั้น'
              : 'ยังไม่มีงานในรายการนี้'}
          </p>
        ) : (
          <div className="space-y-3">
            {visibleAssignments.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                subject={subjectsById[a.subject_id]}
                onTogglePin={togglePin}
                onToggleDone={toggleDone}
                onEdit={setEditingAssignment}
                onDelete={deleteAssignment}
                attachmentUrl={attachmentUrls[a.id]}
              />
            ))}
          </div>
        )}
      </section>

      {showSubjectModal && (
        <AddSubjectModal
          userId={user.id}
          terms={terms}
          defaultTermId={selectedTermId !== 'all' ? selectedTermId : (terms[0]?.id ?? null)}
          onClose={() => setShowSubjectModal(false)}
          onCreated={loadAll}
        />
      )}
      {editingSubject && (
        <AddSubjectModal
          userId={user.id}
          subject={editingSubject}
          existingSlots={slots.filter((s) => s.subject_id === editingSubject.id)}
          terms={terms}
          onClose={() => setEditingSubject(null)}
          onCreated={loadAll}
          onDelete={deleteSubject}
        />
      )}
      {showAssignmentModal && (
        <AddAssignmentModal
          userId={user.id}
          subjects={termSubjects}
          onClose={() => setShowAssignmentModal(false)}
          onCreated={loadAll}
        />
      )}
      {editingAssignment && (
        <AddAssignmentModal
          userId={user.id}
          subjects={termSubjects}
          assignment={editingAssignment}
          attachmentUrl={attachmentUrls[editingAssignment.id]}
          onClose={() => setEditingAssignment(null)}
          onCreated={loadAll}
          onDelete={deleteAssignment}
        />
      )}
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onCancel={() => setConfirmDialog(null)}
          onConfirm={async () => {
            await confirmDialog.onConfirm()
            setConfirmDialog(null)
          }}
        />
      )}
      {showTermsModal && (
        <ManageTermsModal
          userId={user.id}
          terms={terms}
          onClose={() => setShowTermsModal(false)}
          onChanged={loadAll}
          onDelete={deleteTerm}
        />
      )}
    </div>
  )
}
