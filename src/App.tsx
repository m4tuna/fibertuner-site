import Footer from './components/Footer'

const MAC_SCREENSHOTS = [
  'screenshot-mac.png',
  ...Array.from({ length: 14 }, (_, i) => `screenshot-mac${i + 2}.png`),
]

const SHOW_IOS = false

const ACCENT = '#a78bfa'
const GITHUB = 'm4tuna/fibertuner'
const APP_STORE_URL = 'https://apps.apple.com/app/fibertuner/id0000000000'

const FEATURES: { title: string; desc: string; mac: boolean; ios: boolean }[] = [
  {
    title: 'Full library browser',
    desc: 'Every artist, album, and playlist from your Plex Media Server — browsable, searchable, and sorted the way you expect.',
    mac: true, ios: true,
  },
  {
    title: 'Artist radio',
    desc: 'Seed a station from any artist, album, or track. Fibertuner draws from your library and surfaces similar artists you actually own.',
    mac: true, ios: true,
  },
  {
    title: 'Queue and play',
    desc: 'Play now, add next, or append to queue. Skip, seek, repeat — with full control over what plays and when.',
    mac: true, ios: true,
  },
  {
    title: 'Sonos integration',
    desc: 'Deep multi-room control: see every Sonos group, adjust per-speaker volume, group and ungroup rooms, all without leaving the app.',
    mac: true, ios: true,
  },
  {
    title: 'Now Playing',
    desc: 'Album art, artist biography, tour dates, and a live scrollable queue. Rate tracks and mark favorites as you listen.',
    mac: true, ios: true,
  },
  {
    title: 'Offline downloads',
    desc: 'Download albums and play them back locally — no internet required.',
    mac: true, ios: false,
  },
  {
    title: 'AI playlist wizard',
    desc: 'Describe a playlist in plain English and Claude builds it from your library. Bring your own Anthropic API key — your usage, your cost.',
    mac: true, ios: false,
  },
  {
    title: 'Customizable',
    desc: 'Accent colors, gradient themes, home section layout, continuous playback, radio refill, and more — tuned to how you actually listen.',
    mac: true, ios: false,
  },
]

export default function App() {

  return (
    <div>
      {/* ── Site header ────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(8,8,14,0.85)',
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em' }}>Fibertuner</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.2)', cursor: 'default' }}>
          Coming soon
        </span>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 80% 55% at 55% -5%, color-mix(in srgb, ${ACCENT} 11%, transparent), transparent 68%)`,
        }} />

        <div style={{ maxWidth: 780, margin: '0 auto', padding: '96px 40px 80px', position: 'relative' }}>
          <p style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.13em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)',
            marginBottom: 28,
          }}>
            Mac · Windows · Linux{SHOW_IOS ? ' · iPhone' : ''}
          </p>

          <h1 style={{
            fontSize: 'clamp(36px, 5.5vw, 60px)',
            fontWeight: 600, letterSpacing: '-1.5px', lineHeight: 1.04,
            marginBottom: 28, maxWidth: 620,
          }}>
            Your Plex library,<br />beautifully played.
          </h1>

          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.58)',
            lineHeight: 1.75, maxWidth: 480, marginBottom: 52,
          }}>
            A native desktop app for Mac, Windows, and Linux{SHOW_IOS ? ' — plus iPhone' : ''}.
            Play your Plex library through any speakers, with deep Sonos integration,
            AI-powered features, and enough customization to make it feel like yours.
          </p>

          {/* Primary download CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <button
              disabled
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '13px 26px',
                background: 'rgba(255,255,255,0.07)',
                border: 'none', borderRadius: 10,
                color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontSize: 15,
                letterSpacing: '-0.01em',
                cursor: 'default',
                fontFamily: 'inherit',
              }}
            >
              Coming soon
            </button>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Mac · Windows · Linux</span>
          </div>
        </div>
      </div>

      {/* ── Mac screenshot carousel ───────────────────────────────────── */}
      <div
        style={{
          display: 'flex', overflowX: 'auto', gap: 12,
          scrollbarWidth: 'none',
          padding: '0 40px',
          cursor: 'grab',
        } as React.CSSProperties}
        onMouseDown={e => {
          e.preventDefault()
          const el = e.currentTarget
          el.style.cursor = 'grabbing'
          const startX = e.pageX
          const startScroll = el.scrollLeft
          const onMove = (ev: MouseEvent) => { el.scrollLeft = startScroll - (ev.pageX - startX) }
          const onUp = () => { el.style.cursor = 'grab'; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
          window.addEventListener('mousemove', onMove)
          window.addEventListener('mouseup', onUp)
        }}
      >
        {MAC_SCREENSHOTS.map(file => (
          <img
            key={file}
            src={`/assets/fibertuner/${file}`}
            alt={`Fibertuner — ${file}`}
            draggable={false}
            style={{
              width: '82vw', maxWidth: 1400, height: 'auto',
              flexShrink: 0, display: 'block',
              userSelect: 'none',
            }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ))}
        <div style={{ flexShrink: 0, width: 4 }} />
      </div>

      {/* ── About ────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '88px 40px 0' }}>
        <p style={{
          fontSize: 20, fontWeight: 400, lineHeight: 1.65,
          color: 'rgba(255,255,255,0.65)', maxWidth: 560,
        }}>
          Plex gives you a self-hosted music library. Fibertuner gives you the best
          way to listen to it — a highly customizable player with AI features built in,
          playing through whatever speakers you have, with deep Sonos integration when you want it.
        </p>
      </div>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '72px 40px 0' }}>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              display: 'grid', gridTemplateColumns: '180px 1fr 80px', gap: 32,
              padding: '22px 0',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              alignItems: 'start',
            }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                {f.title}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                {f.desc}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 2 }}>
                {f.mac && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', fontWeight: 500, letterSpacing: '0.04em' }}>Mac</span>}
                {f.mac && !f.ios && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', fontWeight: 500, letterSpacing: '0.04em' }}>Windows · Linux</span>}
                {f.ios && SHOW_IOS && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', fontWeight: 500, letterSpacing: '0.04em' }}>iPhone</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── iPhone hero ──────────────────────────────────────────────── */}
      {SHOW_IOS && <div style={{ maxWidth: 960, margin: '0 auto', padding: '104px 40px 0', display: 'flex', alignItems: 'center', gap: 64 }}>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.13em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)',
            marginBottom: 24,
          }}>
            Fibertuner for iPhone
          </p>
          <h2 style={{
            fontSize: 'clamp(24px, 3vw, 38px)',
            fontWeight: 600, letterSpacing: '-0.8px', lineHeight: 1.1,
            marginBottom: 20,
          }}>
            The same library.<br />Now in your pocket.
          </h2>
          <p style={{
            fontSize: 14, color: 'rgba(255,255,255,0.38)',
            lineHeight: 1.8, marginBottom: 36, maxWidth: 380,
          }}>
            Browse your full Plex library, manage the queue, and control every
            Sonos room from your phone. Stays in sync with whatever's playing on desktop.
          </p>
          <a
            href={APP_STORE_URL}
            target="_blank" rel="noopener"
            style={{
              fontSize: 14, fontWeight: 600,
              color: ACCENT, textDecoration: 'none',
              transition: 'opacity 0.15s',
              display: 'inline-block',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Download on App Store ↓
          </a>
        </div>
        <div style={{ width: 280, flexShrink: 0 }}>
          <img
            src="/assets/fibertuner/screenshot-ios.png"
            alt="Fibertuner for iPhone"
            style={{ width: '100%', display: 'block' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      </div>}

      {/* ── Requirements ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '104px 40px 0' }}>
        <h2 style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
          marginBottom: 28,
        }}>
          What you need
        </h2>
        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8,
          maxWidth: 480, marginBottom: 32,
        }}>
          If you have access to a Plex Media Server, Fibertuner works without any
          additional setup. No accounts, no subscriptions.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            ['Plex Media Server', 'You just need access to one — yours, a friend\'s, or family. Free tier works.'],
            ['Sonos speakers',    'Optional — for multi-room grouping and per-speaker volume control.'],
            ['macOS 12+',   'Apple Silicon and Intel Mac.'],
            ['Windows 10+', 'x64. Download the .exe installer.'],
            ['Linux',       'x64 AppImage — no install required, works on most distros.'],
            ...(SHOW_IOS ? [['iOS 16+', 'iPhone. iPad support coming.']] : []),
          ].map(([label, note]) => (
            <div key={label} style={{
              display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24,
              padding: '14px 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.58)', fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{note}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 100 }} />

      <Footer appName="Fibertuner" githubRepo={GITHUB} />
    </div>
  )
}

