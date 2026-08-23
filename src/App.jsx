import { AuthProvider, useAuth } from './context/AuthContext'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'

function Gate() {
  const { loading, user } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[var(--color-ink-soft)] font-mono">กำลังโหลด...</p>
      </div>
    )
  }

  return user ? <Dashboard /> : <Login />
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
