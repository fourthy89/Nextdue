// Shared display label for a subject: "CS454 · Computer Communication..."
// when a course code is set, falling back to just the name for subjects
// created before the code field existed (code is null).
export function subjectLabel(subject) {
  if (!subject) return 'ไม่ทราบวิชา'
  return subject.code ? `${subject.code} · ${subject.name}` : subject.name
}
