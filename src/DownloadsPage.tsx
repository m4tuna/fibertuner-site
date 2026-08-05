import { useEffect, useState } from 'react'
import Footer from './components/Footer'
import './styles/downloads.css'

const GITHUB = 'm4tuna/fibertuner-site'

interface InviteInfo {
  username: string
  serverName: string
}

interface Release {
  version: string
  date: string
  notes: string
  platforms: {
    mac?: string
    windows?: string
    linux?: string
  }
}

interface PlatformInfo {
  key: 'mac' | 'windows' | 'linux'
  label: string
  sublabel: string
  format: string
  icon: string
}

const PLATFORMS: PlatformInfo[] = [
  { key: 'mac',     label: 'macOS',   sublabel: 'Apple Silicon & Intel', format: '.dmg',      icon: MacIcon() },
  { key: 'windows', label: 'Windows', sublabel: 'Windows 10+, x64',      format: '.exe',      icon: WindowsIcon() },
  { key: 'linux',   label: 'Linux',   sublabel: 'x64 AppImage',          format: '.AppImage', icon: LinuxIcon() },
]

function detectPlatform(): 'mac' | 'windows' | 'linux' | null {
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('mac'))   return 'mac'
  if (ua.includes('win'))   return 'windows'
  if (ua.includes('linux')) return 'linux'
  return null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function DownloadsPage() {
  const [release, setRelease] = useState<Release | null>(null)
  const [error, setError]     = useState(false)
  const detectedPlatform      = detectPlatform()
  const params                = new URLSearchParams(window.location.search)
  const isSuccess             = params.has('success')
  const serverParam           = params.get('server')
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)

  useEffect(() => {
    fetch('/releases/latest.json')
      .then(r => r.json())
      .then(setRelease)
      .catch(() => setError(true))
  }, [])

  useEffect(() => {
    if (!serverParam) return
    fetch(`/api/server-invite?server=${encodeURIComponent(serverParam)}`)
      .then(r => {
        if (!r.ok) console.warn('[invite] server-invite API error:', r.status)
        return r.json()
      })
      .then(data => {
        if (data?.error) {
          console.warn('[invite] server-invite returned error:', data.error)
          return
        }
        if (data?.found && data.username != null) {
          setInviteInfo({ username: data.username, serverName: data.serverName ?? '' })
        }
      })
      .catch(err => console.warn('[invite] server-invite fetch failed:', err))
  }, [serverParam])

  return (
    <div className="downloads">
      <header className="site-header">
        <a href="/" className="site-header__logo">Fibertuner</a>
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="/#pricing" className="site-header__link">Pricing</a>
          <a href="/changelog" className="site-header__link">Changelog</a>
        </nav>
      </header>

      <div className="downloads__body">
        <div className="downloads__gradient" />

        <div className="downloads__inner">
          {inviteInfo && (
            <div className="invite-banner">
              <p className="invite-banner__title">
                <span className="invite-banner__accent">{inviteInfo.username}</span>
                {' '}is inviting you to stream{' '}
                <span className="invite-banner__accent">{inviteInfo.serverName}</span>
                {' '}music on Fibertuner.
              </p>
              <p className="invite-banner__sub">
                Download the app below, sign in with Plex, and you're in.
              </p>
            </div>
          )}

          {isSuccess && (
            <div className="success-banner">
              <span className="success-banner__icon">🎉</span>
              <div>
                <div className="success-banner__title">
                  Purchase complete — thanks for your support!
                </div>
                <div className="success-banner__sub">
                  Download Fibertuner below and activate with the license key in your email.
                </div>
              </div>
            </div>
          )}

          <p className="downloads__eyebrow">Downloads</p>
          <h1 className="downloads__title">Get Fibertuner</h1>

          {release && (
            <p className="downloads__meta">
              Version {release.version} · {formatDate(release.date)}
            </p>
          )}
          {!release && !error && (
            <p className="downloads__loading">Loading…</p>
          )}
          {error && (
            <p className="downloads__error">
              Could not load release info.{' '}
              <a
                href={`https://github.com/${GITHUB}/releases`}
                target="_blank"
                rel="noopener"
                className="downloads__error-link"
              >
                Check GitHub Releases ↗
              </a>
            </p>
          )}

          <div className="platform-grid">
            {PLATFORMS.map(p => {
              const url        = release?.platforms[p.key]
              const isDetected = detectedPlatform === p.key
              return (
                <div
                  key={p.key}
                  className={`platform-card${isDetected ? ' platform-card--detected' : ''}`}
                >
                  <div className="platform-card__top">
                    <div
                      className="platform-card__icon"
                      dangerouslySetInnerHTML={{ __html: p.icon }}
                    />
                    {isDetected && (
                      <span className="platform-card__badge">Your system</span>
                    )}
                  </div>

                  <div>
                    <div className="platform-card__name">{p.label}</div>
                    <div className="platform-card__sublabel">{p.sublabel}</div>
                  </div>

                  {url ? (
                    <a
                      href={url}
                      download
                      className="platform-card__btn"
                    >
                      Download {p.format}
                    </a>
                  ) : (
                    <div className="platform-card__btn platform-card__btn--unavailable">
                      Coming soon
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {release?.notes && (
            <div className="release-notes">
              <div className="release-notes__label">What's new in {release.version}</div>
              <p className="release-notes__text">{release.notes}</p>
            </div>
          )}

          {isSuccess && (
            <div className="after-install">
              <div className="after-install__title">After installing</div>
              <p className="after-install__text">
                Open Fibertuner, sign in with Plex, then go to{' '}
                <strong className="after-install__strong">Settings → Account</strong>{' '}
                and enter your license key from the confirmation email.
                Server plan? Just share the app — your users log in with Plex and they're automatically unlocked.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer appName="Fibertuner" githubRepo={GITHUB} />
    </div>
  )
}

function MacIcon() {
  return `<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>`
}

function WindowsIcon() {
  return `<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M3 12V6.75l6-1.32v6.48L3 12m17-9v8.75l-10 .15V5.21L20 3M3 13l6 .09v6.81l-6-1.15V13m17 .25V22l-10-1.91V13.1L20 13.25z"/></svg>`
}

function LinuxIcon() {
  return `<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.452-.972 2.153C7.22 9.242 6.12 10.364 5.85 11.586c-.217.975-.209 2.049.248 2.876.025.049.05.098.073.149C5.06 15.573 3.879 17.22 4.03 19.234c.059.767.286 1.55.782 2.176.495.625 1.248.949 2.191.949h.063c1.483-.015 3.159-.215 4.713-.215 1.553 0 3.228.2 4.711.215h.064c.943 0 1.696-.324 2.191-.949.496-.627.723-1.41.782-2.176.151-2.014-1.03-3.661-2.143-4.623.023-.051.048-.1.073-.149.457-.827.465-1.901.248-2.876-.271-1.222-1.371-2.344-2.032-3.114-.673-.701-.896-1.061-.972-2.153-.066-1.491 1.056-5.965-3.17-6.298-.164-.013-.324-.021-.479-.021zm-.056 2.518c1.554 0 1.971 1.226 1.971 2.284 0 1.308-.636 2.366-1.971 2.366-1.334 0-1.97-1.058-1.97-2.366 0-1.058.416-2.284 1.97-2.284zm-.028 6.086c1.143 0 2.121.443 2.898 1.187.638.613.929 1.383.929 2.181 0 .618-.185 1.23-.541 1.744-.357.514-.859.894-1.448 1.099-.315.109-.643.165-.972.165-.639 0-1.256-.2-1.748-.558-.492-.358-.821-.855-.963-1.405-.142-.55-.081-1.131.166-1.626.248-.494.658-.896 1.165-1.144.324-.16.668-.255 1.023-.294.163-.018.328-.027.491-.027v-.002c.004 0 .007-.002.011-.002h-.011zm-5.889 7.87c.508 0 .954.363 1.083.861.128.499-.127 1.013-.591 1.254-.195.101-.411.15-.626.15-.508 0-.954-.364-1.083-.862-.128-.499.128-1.013.591-1.253.195-.101.41-.15.626-.15zm11.778 0c.216 0 .431.049.626.15.463.24.719.754.591 1.253-.129.498-.575.862-1.083.862-.215 0-.431-.049-.626-.15-.463-.241-.719-.755-.591-1.254.129-.498.575-.861 1.083-.861z"/></svg>`
}
