import { startOfWeek } from 'date-fns'

/**
 * Week number of `date` relative to a term's `week1Start`, counting weeks
 * as Sunday-to-Saturday (matches day_of_week 0 = อาทิตย์ used elsewhere in
 * the app). week1Start need not itself be a Sunday — callers should snap
 * it to one first (see `snapToSunday`), but this function is defensive
 * about it anyway by comparing week-start-to-week-start.
 *
 * Returns null if week1Start is unset. Returns 0 or negative for dates
 * before the term started — callers decide how to display that.
 */
export function weekNumber(date, week1Start) {
  if (!week1Start) return null
  const start = startOfWeek(new Date(week1Start))
  const target = startOfWeek(new Date(date))
  const diffDays = Math.round((target.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
  return Math.floor(diffDays / 7) + 1
}

/** Snaps any date to the Sunday of its own week, for storing as week1_start. */
export function snapToSunday(date) {
  return startOfWeek(new Date(date))
}

// Formats a Date as a local "yyyy-MM-dd" string — NOT via toISOString(),
// which converts through UTC first and can roll the date back a day in
// positive-offset timezones (e.g. a local-midnight Sunday in Thailand,
// UTC+7, becomes Saturday once shifted to UTC). Postgres `date` columns
// have no time component, so what we send here must already be the
// correct local calendar date as plain text.
export function formatLocalDate(date) {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
