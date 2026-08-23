import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function Login() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setInfo('สมัครสำเร็จ — ตรวจอีเมลเพื่อยืนยันบัญชี (ถ้าโปรเจกต์เปิดการยืนยันอีเมลไว้)')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-semibold text-[var(--color-ink)] tracking-tight">
            Next<span className="text-[var(--color-stamp)]">due</span>
          </h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-2">ตารางเรียน งาน และวันสอบ ในที่เดียว</p>
        </div>

        <div className="bg-[var(--color-card)] border border-[var(--color-paper-dim)] rounded-[var(--radius-card)] p-6">
          <div className="flex mb-5 rounded-lg bg-[var(--color-paper-dim)] p-1 text-sm">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-1.5 rounded-md transition-colors ${
                mode === 'signin' ? 'bg-[var(--color-card)] font-medium text-[var(--color-ink)]' : 'text-[var(--color-ink-soft)]'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-1.5 rounded-md transition-colors ${
                mode === 'signup' ? 'bg-[var(--color-card)] font-medium text-[var(--color-ink)]' : 'text-[var(--color-ink-soft)]'
              }`}
            >
              สมัครใหม่
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              placeholder="อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-paper-dim)] px-3 py-2 text-sm"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-paper-dim)] px-3 py-2 text-sm"
            />

            {error && <p className="text-sm text-[var(--color-stamp)]">{error}</p>}
            {info && <p className="text-sm text-[var(--color-moss)]">{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-ink)] text-[var(--color-paper)] rounded-lg py-2.5 font-medium disabled:opacity-50"
            >
              {loading ? 'กำลังดำเนินการ...' : mode === 'signin' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
