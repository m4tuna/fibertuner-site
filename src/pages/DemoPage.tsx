import Footer from '../components/Footer'
import '../index.css'

const GITHUB = 'm4tuna/fibertuner'
const VIDEO_URL = 'https://rfvcpnnbqihfwatrxhib.supabase.co/storage/v1/object/public/demo/fibertuner-demo.mp4'

export default function DemoPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="site-header">
        <a href="/" className="site-header__logo">Fibertuner</a>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px 80px' }}>
        <div style={{ maxWidth: 960, width: '100%' }}>
          {/* Header */}
          <div style={{ marginBottom: 40, textAlign: 'center' }}>
            <p style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.28)',
              marginBottom: 16,
            }}>
              Demo
            </p>
            <h1 style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: 16,
            }}>
              See Fibertuner in action
            </h1>
            <p style={{
              fontSize: 15,
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.6,
              maxWidth: 480,
              margin: '0 auto',
            }}>
              Fibertuner — Plex music for Sonos and AirPlay
            </p>
          </div>

          {/* Video player */}
          <div style={{
            borderRadius: 16,
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            marginBottom: 48,
          }}>
            <video
              src={VIDEO_URL}
              controls
              playsInline
              preload="metadata"
              style={{ display: 'block', width: '100%', maxHeight: '70vh' }}
            />
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center' }}>
            <a
              href="/downloads"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 36px',
                borderRadius: 28,
                fontSize: 15,
                fontWeight: 600,
                background: 'var(--accent)',
                color: '#fff',
                textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Get Fibertuner →
            </a>
          </div>
        </div>
      </main>

      <Footer appName="Fibertuner" githubRepo={GITHUB} />
    </div>
  )
}
