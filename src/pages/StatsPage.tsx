import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import Footer from '../components/Footer'
import StatsPanel from '../components/StatsPanel'
import { supabase } from '../lib/supabase'
import '../styles/stats-panel.css'
import '../styles/downloads.css'

const GITHUB = 'm4tuna/fibertuner-site'

export default function StatsPage() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  // Resolve session on mount; undefined = still loading
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError(err.message)
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  // Still resolving session
  if (session === undefined) {
    return (
      <div className="downloads">
        <header className="site-header">
          <a href="/" className="site-header__logo">Fibertuner</a>
          <a href="/downloads" className="site-header__link">Downloads</a>
        </header>
        <div className="downloads__stats-body" />
        <Footer appName="Fibertuner" githubRepo={GITHUB} />
      </div>
    )
  }

  // Not signed in — show sign-in form
  if (!session) {
    return (
      <div className="downloads">
        <header className="site-header">
          <a href="/" className="site-header__logo">Fibertuner</a>
          <a href="/downloads" className="site-header__link">Downloads</a>
        </header>
        <div className="stats-signin">
          <div className="stats-signin__card">
            <div className="stats-signin__title">Stats</div>
            <div className="stats-signin__sub">Sign in to view download and user stats.</div>
            <form className="stats-signin__form" onSubmit={handleSignIn}>
              <input
                className="stats-signin__input"
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                className="stats-signin__input"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              {error && <div className="stats-signin__error">{error}</div>}
              <button
                className="stats-signin__btn"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
        <Footer appName="Fibertuner" githubRepo={GITHUB} />
      </div>
    )
  }

  // Signed in — show stats panel with sign-out
  return (
    <div className="downloads">
      <header className="site-header">
        <a href="/" className="site-header__logo">Fibertuner</a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{session.user.email}</span>
          <button className="stats-signout-btn" onClick={handleSignOut}>Sign out</button>
        </div>
      </header>
      <div className="downloads__stats-body">
        <StatsPanel />
      </div>
      <Footer appName="Fibertuner" githubRepo={GITHUB} />
    </div>
  )
}
