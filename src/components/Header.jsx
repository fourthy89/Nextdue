import { useAuth } from '../context/AuthContext'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="flex items-center justify-between py-5">
      <div className="flex items-baseline gap-2">
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)] tracking-tight">
          Next<span className="text-[var(--color-stamp)]">due</span>
        </h1>
        <span className="text-xs text-[var(--color-ink-faint)] font-mono hidden sm:inline">
          / ปฏิทินการเรียนของคุณ
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--color-ink-soft)] hidden sm:inline truncate max-w-[180px]">
          {user?.email}
        </span>
        <button onClick={signOut} className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-stamp)] underline">
          ออกจากระบบ
        </button>
      </div>
    </header>
  )
}
