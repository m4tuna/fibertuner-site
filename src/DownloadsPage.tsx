import { useEffect, useState } from 'react'
import Footer from './components/Footer'
import { supabase } from './lib/supabase'
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
    supabase
      .from('profiles')
      .select('plex_username, server_name')
      .eq('server_machine_id', serverParam)
      .eq('server_owned', true)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setInviteInfo({ username: data[0].plex_username, serverName: data[0].server_name })
        }
      })
  }, [serverParam])

  return (
    <div className="downloads">
      <header className="site-header">
        <a href="/" className="site-header__logo">Fibertuner</a>
        <a href="/#pricing" className="site-header__link">Pricing</a>
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
  return `<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M14.62 8.35c-.36.71-.7 1.46-1.27 2.06-.35.38-.68.78-1.07 1.13-.1.08-.24.17-.22.31.06.8.15 1.59.23 2.4 0 .04.04.08.07.11.12.09.25.06.38.06h3.29c.46 0 .8-.38.75-.84-.04-.35-.35-.61-.71-.61h-.34c-.03 0-.07-.01-.1-.03-.04-.04-.03-.1-.03-.14.01-.4.03-.8.04-1.2 0-.09 0-.2-.06-.27-.19-.24-.15-.56-.1-.84.04-.28.07-.56.08-.84 0-.1-.05-.18-.12-.24-.4-.35-.82-.65-1.19-.84-.3-.2-.44-.15-.63-.23zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>`
}
