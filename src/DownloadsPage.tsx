import { useEffect, useState } from 'react'
import Footer from './components/Footer'
import { useDownloadStats } from './hooks/useDownloadStats'
import { supabase } from './lib/supabase'
import StatsPanel from './components/StatsPanel'

const ACCENT = '#a78bfa'
const GITHUB = 'm4tuna/fibertuner-site'

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
  { key: 'mac',     label: 'macOS',   sublabel: 'Apple Silicon & Intel',  format: '.dmg',      icon: MacIcon() },
  { key: 'windows', label: 'Windows', sublabel: 'Windows 10+, x64',       format: '.exe',      icon: WindowsIcon() },
  { key: 'linux',   label: 'Linux',   sublabel: 'x64 AppImage',           format: '.AppImage', icon: LinuxIcon() },
]

function detectPlatform(): 'mac' | 'windows' | 'linux' | null {
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('mac')) return 'mac'
  if (ua.includes('win')) return 'windows'
  if (ua.includes('linux')) return 'linux'
  return null
}

async function trackDownload(platform: string, version: string) {
  try {
    await supabase.from('download_clicks').insert([{
      platform,
      version,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      detected_os: detectPlatform(),
    }])
  } catch {}
}

export default function DownloadsPage() {
  const [release, setRelease] = useState<Release | null>(null)
  const [error, setError] = useState(false)
  const detectedPlatform = detectPlatform()
  const stats = useDownloadStats(GITHUB)
  const params = new URLSearchParams(window.location.search)
  const isSuccess = params.has('success')
  const isAdmin = window.location.hostname === 'localhost' && params.has('stats')

  useEffect(() => {
    fetch('/releases/latest.json')
      .then(r => r.json())
      .then(setRelease)
      .catch(() => setError(true))
  }, [])

  if (isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 40px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(8,8,14,0.85)',
        }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontSize: 12, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              background: `linear-gradient(95deg, #fff 0%, color-mix(in srgb, ${ACCENT} 40%, #fff) 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Fibertuner</span>
          </a>
          <a
            href="/downloads"
            style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          >
            ← Downloads
          </a>
        </header>
        <div style={{ flex: 1 }}>
          <StatsPanel />
        </div>
        <Footer appName="Fibertuner" githubRepo={GITHUB} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(8,8,14,0.85)',
      }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontSize: 12, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            background: `linear-gradient(95deg, #fff 0%, color-mix(in srgb, ${ACCENT} 40%, #fff) 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Fibertuner</span>
        </a>
        <a
          href="/#pricing"
          style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,1)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
        >
          Pricing
        </a>
      </header>

      <div style={{ flex: 1, position: 'relative' }}>
        {/* Gradient */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', height: 500, pointerEvents: 'none',
          background: `radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in srgb, ${ACCENT} 10%, transparent), transparent 70%)`,
        }} />

        <div style={{ maxWidth: 780, margin: '0 auto', padding: '72px 40px 80px', position: 'relative' }}>

          {/* Purchase success banner */}
          {isSuccess && (
            <div style={{
              marginBottom: 40, padding: '14px 20px',
              background: `color-mix(in srgb, ${ACCENT} 10%, rgba(14,14,24,0.8))`,
              border: `1px solid color-mix(in srgb, ${ACCENT} 25%, transparent)`,
              borderRadius: 12,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 18 }}>🎉</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 2 }}>
                  Purchase complete — thanks for your support!
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                  Download Fibertuner below and activate with the license key in your email.
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <p style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.13em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)',
            marginBottom: 16,
          }}>
            Downloads
          </p>
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 600, letterSpacing: '-1px', lineHeight: 1.08,
            marginBottom: 12,
          }}>
            Get Fibertuner
          </h1>
          {release && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 48 }}>
              Version {release.version} · {formatDate(release.date)}
              {stats?.latestPublishedAt && (
                <span style={{ color: 'rgba(255,255,255,0.2)', marginLeft: 8 }}>
                  · Built {formatTimestamp(stats.latestPublishedAt)}
                </span>
              )}
            </p>
          )}
          {!release && !error && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginBottom: 48 }}>Loading…</p>
          )}
          {error && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 48 }}>
              Could not load release info.{' '}
              <a href={`https://github.com/${GITHUB}/releases`} target="_blank" rel="noopener" style={{ color: ACCENT }}>
                Check GitHub Releases ↗
              </a>
            </p>
          )}

          {/* Platform cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 40 }}>
            {PLATFORMS.map(p => {
              const url = release?.platforms[p.key]
              const isDetected = detectedPlatform === p.key
              return (
                <div key={p.key} style={{
                  padding: '22px 20px',
                  borderRadius: 14,
                  background: isDetected
                    ? `color-mix(in srgb, ${ACCENT} 6%, rgba(255,255,255,0.04))`
                    : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isDetected
                    ? `color-mix(in srgb, ${ACCENT} 30%, transparent)`
                    : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: isDetected ? `0 0 32px color-mix(in srgb, ${ACCENT} 10%, transparent)` : 'none',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  transition: 'border-color 0.15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ color: 'rgba(255,255,255,0.55)', width: 28, height: 28, flexShrink: 0 }}
                      dangerouslySetInnerHTML={{ __html: p.icon }}
                    />
                    {isDetected && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                        textTransform: 'uppercase', padding: '2px 7px', borderRadius: 20,
                        background: `color-mix(in srgb, ${ACCENT} 18%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${ACCENT} 30%, transparent)`,
                        color: ACCENT,
                      }}>Your system</span>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.88)', marginBottom: 3 }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{p.sublabel}</div>
                  </div>


                  {url ? (
                    <a
                      href={url}
                      download
                      onClick={() => trackDownload(p.key, release?.version ?? 'unknown')}
                      style={{
                        display: 'block', padding: '10px 14px',
                        borderRadius: 9, textAlign: 'center',
                        fontSize: 12, fontWeight: 600, textDecoration: 'none',
                        background: isDetected ? ACCENT : 'rgba(255,255,255,0.09)',
                        color: isDetected ? '#08080e' : 'rgba(255,255,255,0.7)',
                        transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      Download {p.format}
                    </a>
                  ) : (
                    <div style={{
                      padding: '10px 14px', borderRadius: 9, textAlign: 'center',
                      fontSize: 12, fontWeight: 500,
                      background: 'rgba(255,255,255,0.03)',
                      color: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      Coming soon
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Release notes */}
          {release?.notes && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 32 }}>
              <div style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
                marginBottom: 12,
              }}>What's new in {release.version}</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, maxWidth: 520 }}>
                {release.notes}
              </p>
            </div>
          )}

          {/* After install note (only on success page) */}
          {isSuccess && (
            <div style={{
              marginTop: 40, padding: '16px 20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                After installing
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.75, margin: 0 }}>
                Open Fibertuner, sign in with Plex, then go to <strong style={{ color: 'rgba(255,255,255,0.55)' }}>Settings → Account</strong> and enter your license key from the confirmation email.
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  })
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
