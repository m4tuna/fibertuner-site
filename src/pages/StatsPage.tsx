import { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import StatsPanel from '../components/StatsPanel'
import '../styles/stats-panel.css'
import '../styles/downloads.css'

const GITHUB = 'm4tuna/fibertuner-site'
const SESSION_KEY = 'stats_auth'
const REQUIRED_PASSWORD = import.meta.env.VITE_STATS_PASSWORD as string | undefined

export default function StatsPage() {
  // undefined = still checking sessionStorage; true/false = resolved
  const [authed, setAuthed] = useState<boolean | undefined>(undefined)
  const [input, setInput]   = useState('')
  const [error, setError]   = useState('')

  useEffect(() => {
    // If no password is configured (dev), skip auth entirely
    if (!REQUIRED_PASSWORD) {
      setAuthed(true)
      return
    }
    // Check session storage for existing auth
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      setAuthed(true)
    } else {
      setAuthed(false)
    }
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input === REQUIRED_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1')
      setAuthed(true)
    } else {
      setError('Incorrect passphrase.')
      setInput('')
    }
  }

  // Still resolving
  if (authed === undefined) {
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

  // Not authed — show passphrase form
  if (!authed) {
    return (
      <div className="downloads">
        <header className="site-header">
          <a href="/" className="site-header__logo">Fibertuner</a>
          <a href="/downloads" className="site-header__link">Downloads</a>
        </header>
        <div className="stats-signin">
          <div className="stats-signin__card">
            <div className="stats-signin__title">Stats</div>
            <div className="stats-signin__sub">Enter the passphrase to view stats.</div>
            <form className="stats-signin__form" onSubmit={handleSubmit}>
              <input
                className="stats-signin__input"
                type="password"
                placeholder="Passphrase"
                autoComplete="current-password"
                value={input}
                onChange={e => setInput(e.target.value)}
                required
                autoFocus
              />
              {error && <div className="stats-signin__error">{error}</div>}
              <button
                className="stats-signin__btn"
                type="submit"
              >
                View Stats
              </button>
            </form>
          </div>
        </div>
        <Footer appName="Fibertuner" githubRepo={GITHUB} />
      </div>
    )
  }

  // Authed — show stats panel
  return (
    <div className="downloads">
      <header className="site-header">
        <a href="/" className="site-header__logo">Fibertuner</a>
        <a href="/downloads" className="site-header__link">Downloads</a>
      </header>
      <div className="downloads__stats-body">
        <StatsPanel />
      </div>
      <Footer appName="Fibertuner" githubRepo={GITHUB} />
    </div>
  )
}
