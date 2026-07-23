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

function PricingCard({
  name, price, period, badge, features, cta, url, accent, highlighted,
}: {
  name: string; price: string; period: string; badge?: string
  features: string[]; cta: string; url: string; accent: string; highlighted: boolean
}) {
  return (
    <div style={{
      padding: 24, borderRadius: 14,
      background: highlighted
        ? `color-mix(in srgb, ${accent} 5%, rgba(255,255,255,0.04))`
        : 'rgba(255,255,255,0.04)',
      border: `1px solid ${highlighted ? `color-mix(in srgb, ${accent} 35%, transparent)` : 'rgba(255,255,255,0.08)'}`,
      boxShadow: highlighted ? `0 0 40px color-mix(in srgb, ${accent} 12%, transparent)` : 'none',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{name}</span>
        {badge && (
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
            padding: '3px 8px', borderRadius: 20,
            background: `color-mix(in srgb, ${accent} 18%, transparent)`,
            border: `1px solid color-mix(in srgb, ${accent} 30%, transparent)`,
            color: accent,
          }}>{badge}</span>
        )}
      </div>
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-1px', color: 'rgba(255,255,255,0.92)' }}>{price}</span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginLeft: 2 }}>{period}</span>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
            <span style={{ color: accent, flexShrink: 0, marginTop: 1, fontSize: 11 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <a
        href={url + '?embed=1'}
        className="lemonsqueezy-button"
        style={{
          display: 'block', width: '100%', padding: '11px 16px',
          borderRadius: 9, border: 'none', textAlign: 'center',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          textDecoration: 'none',
          background: highlighted ? accent : 'rgba(255,255,255,0.09)',
          color: highlighted ? '#08080e' : 'rgba(255,255,255,0.75)',
          transition: 'opacity 0.15s',
          boxSizing: 'border-box',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {cta}
      </a>
    </div>
  )
}

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
        <span style={{
          fontSize: 12, fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          background: `linear-gradient(95deg, #fff 0%, color-mix(in srgb, ${ACCENT} 40%, #fff) 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>Fibertuner</span>
        <a
          href="#pricing"
          style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,1)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
        >
          Pricing
        </a>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 80% 55% at 55% -5%, color-mix(in srgb, ${ACCENT} 11%, transparent), transparent 68%)`,
        }} />

        <div style={{ maxWidth: 780, margin: '0 auto', padding: '80px 40px 80px', position: 'relative' }}>
          <img src="/logo.png" alt="Fibertuner" style={{ width: 72, height: 72, display: 'block', marginBottom: 32, opacity: 0.9 }} />
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

          {/* Primary CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14 }}>
            <a
              href="#pricing"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px',
                background: ACCENT, borderRadius: 10, border: 'none',
                color: '#08080e', fontWeight: 600, fontSize: 14,
                letterSpacing: '-0.01em', textDecoration: 'none',
                fontFamily: 'inherit', transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Buy
            </a>
            <a
              href="/downloads"
              style={{
                fontSize: 13, color: 'rgba(255,255,255,0.38)',
                textDecoration: 'none', transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.38)')}
            >
              Already have a license? Download →
            </a>
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

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <div id="pricing" style={{ position: 'relative', maxWidth: 780, margin: '0 auto', padding: '104px 40px 0' }}>
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '140%', height: 480, pointerEvents: 'none',
          background: `radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in srgb, ${ACCENT} 8%, transparent), transparent 70%)`,
        }} />
        <div style={{ position: 'relative' }}>
          <h2 style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
            marginBottom: 8,
          }}>Pricing</h2>
          <p style={{
            fontSize: 24, fontWeight: 600, letterSpacing: '-0.5px',
            lineHeight: 1.2, marginBottom: 6, color: 'rgba(255,255,255,0.9)',
          }}>
            One app. Two ways to own it.
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 48, maxWidth: 440 }}>
            Personal plans cover you on up to 3 machines. Server plans unlock Fibertuner for every user on your Plex server.
          </p>

          {/* Personal tier */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Personal</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginLeft: 12 }}>For individuals with Plex access. Works on any server you can log into. Up to 3 machines.</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <PricingCard
                name="Annual"
                price="$12"
                period="/yr"
                features={['Any Plex server you have access to', 'Up to 3 machines', 'All features included']}
                cta="Get Annual — $12/yr"
                url="https://fibertuner.lemonsqueezy.com/checkout/buy/fdfac193-01f0-475e-947a-8ed165ef520e"
                accent={ACCENT}
                highlighted={false}
              />
              <PricingCard
                name="Lifetime"
                price="$29"
                period=" one-time"
                badge="Best value"
                features={['Any Plex server you have access to', 'Up to 3 machines', 'All features included', 'All future updates']}
                cta="Get Lifetime — $29"
                url="https://fibertuner.lemonsqueezy.com/checkout/buy/e0d0ab6c-dace-4f93-9ad2-0b5b21514d08"
                accent={ACCENT}
                highlighted={true}
              />
            </div>
          </div>

          {/* Server tier */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Server</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginLeft: 12 }}>For Plex server admins. One purchase unlocks Fibertuner for every user on your Plex server.</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <PricingCard
                name="Annual"
                price="$29"
                period="/yr"
                features={['Unlimited users on your server', 'Users just log in with Plex', 'All features included']}
                cta="Set up Server Plan — $29/yr"
                url="https://fibertuner.lemonsqueezy.com/checkout/buy/20137415-00d9-4779-8581-45b0223066f0"
                accent={ACCENT}
                highlighted={false}
              />
              <PricingCard
                name="Lifetime"
                price="$69"
                period=" one-time"
                badge="One-time"
                features={['Unlimited users on your server', 'Users just log in with Plex', 'All features included', 'All future updates']}
                cta="Get Server Lifetime — $69"
                url="https://fibertuner.lemonsqueezy.com/checkout/buy/e0d0ab6c-dace-4f93-9ad2-0b5b21514d08"
                accent={ACCENT}
                highlighted={true}
              />
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 20 }}>
            Server plans verify Plex server ownership at checkout.
          </p>
        </div>
      </div>

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

