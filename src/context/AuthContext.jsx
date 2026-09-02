import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading, null = signed out

  useEffect(() => {
    let cancelled = false

    async function init() {
      // getSession() only reads whatever is cached in localStorage — it
      // does NOT confirm the access token is still valid. If the app was
      // closed long enough for the token to go stale, the very first
      // queries fired right after mount can race against Supabase's
      // background token refresh and come back 401. getUser() actually
      // asks the server to validate (and refresh if needed) the token, so
      // by the time we stop showing the loading screen, the session we
      // hand to the rest of the app is confirmed good.
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        if (!cancelled) setSession(null)
        return
      }
      const { data: userData, error } = await supabase.auth.getUser()
      if (cancelled) return
      if (error || !userData.user) {
        setSession(null)
        return
      }
      // Re-fetch session after getUser() so we have the (possibly
      // refreshed) token, not the original potentially-stale one.
      const { data: freshData } = await supabase.auth.getSession()
      if (!cancelled) setSession(freshData.session)
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!cancelled) setSession(newSession)
    })

    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    loading: session === undefined,
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
