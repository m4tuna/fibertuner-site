import Footer from '../components/Footer'
import '../styles/app.css'

const GITHUB = 'm4tuna/fibertuner-site'

export default function SharePage() {
  const params = new URLSearchParams(window.location.search)
  const title = params.get('t') ?? ''
  const artist = params.get('a') ?? ''
  const album = params.get('al') ?? ''
  const rk = params.get('rk') ?? ''

  const isTrack = !!rk
  const deepLinkUrl = `fibertuner://share?${window.location.search.slice(1)}`
  const displayTitle = isTrack ? title : album
  const displaySub = isTrack ? `${artist} · ${album}` : artist

  return (
    <div>
      <header className="site-header">
        <a href="/" className="site-header__logo">Fibertuner</a>
      </header>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '80px 40px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
          {isTrack ? 'Track' : 'Album'}
        </div>
        {displayTitle && (
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>
            {displayTitle}
          </h1>
        )}
        {displaySub && (
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', marginBottom: 40 }}>
            {displaySub}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <a
            href={deepLinkUrl}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '14px 32px', borderRadius: 24, fontSize: 15, fontWeight: 600,
              background: 'var(--accent)', color: '#fff', textDecoration: 'none',
              transition: 'opacity 0.1s',
            }}
          >
            Open in Fibertuner
          </a>
          <a
            href="/downloads"
            style={{
              fontSize: 13, color: 'rgba(255,255,255,0.45)',
              textDecoration: 'none',
              transition: 'color 0.1s',
            }}
          >
            Don't have Fibertuner? Download it →
          </a>
        </div>

        <div style={{ marginTop: 60, padding: '24px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.7)' }}>What is Fibertuner?</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0 }}>
            A native desktop app for Mac, Windows, and Linux that plays your Plex music library through any speakers, with deep Sonos integration and AI-powered features.
          </p>
        </div>
      </div>

      <Footer appName="Fibertuner" githubRepo={GITHUB} />
    </div>
  )
}
