import { useEffect, useState } from 'react'

/**
 * Returns a live-updating breakdown of time remaining until dueAt.
 * Updates every minute (every second if under an hour remains).
 */
export function useCountdown(dueAt) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const due = new Date(dueAt).getTime()
    const msLeft = due - Date.now()
    const tick = Math.abs(msLeft) < 60 * 60 * 1000 ? 1000 : 30000
    const id = setInterval(() => setNow(Date.now()), tick)
    return () => clearInterval(id)
  }, [dueAt])

  const due = new Date(dueAt).getTime()
  const diff = due - now
  const overdue = diff < 0
  const abs = Math.abs(diff)

  const days = Math.floor(abs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((abs / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((abs / (1000 * 60)) % 60)

  return { days, hours, minutes, overdue, totalMs: diff }
}
