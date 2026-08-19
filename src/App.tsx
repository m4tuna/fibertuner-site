import Footer from './components/Footer'
import './styles/app.css'

const MAC_SCREENSHOTS = [
  'screenshot-mac.png',
  ...Array.from({ length: 14 }, (_, i) => `screenshot-mac${i + 2}.png`),
]

const SHOW_IOS = false

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
  name, price, period, badge, features, cta, url, highlighted,
}: {
  name: string; price: string; period: string; badge?: string
  features: string[]; cta: string; url: string; highlighted: boolean
}) {
  return (
    <div className={`pricing-card${highlighted ? ' pricing-card--highlighted' : ''}`}>
      <div className="pricing-card__header">
        <span className="pricing-card__name">{name}</span>
        {badge && <span className="pricing-card__badge">{badge}</span>}
      </div>
      <div className="pricing-card__price">
        <span className="pricing-card__amount">{price}</span>
        <span className="pricing-card__period">{period}</span>
      </div>
      <ul className="pricing-card__features">
        {features.map(f => (
          <li key={f} className="pricing-card__feature">
            <span className="pricing-card__check">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <a href={url + '?embed=1'} className="pricing-card__cta lemonsqueezy-button">
        {cta}
      </a>
    </div>
  )
}

function handleCarouselDrag(e: React.MouseEvent<HTMLDivElement>) {
  e.preventDefault()
  const el = e.currentTarget
  el.classList.add('is-grabbing')
  const startX      = e.pageX
  const startScroll = el.scrollLeft
  const onMove = (ev: MouseEvent) => { el.scrollLeft = startScroll - (ev.pageX - startX) }
  const onUp   = () => {
    el.classList.remove('is-grabbing')
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

export default function App() {
  return (
    <div>
      <header className="site-header">
        <span className="site-header__logo">Fibertuner</span>
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="#pricing" className="site-header__link">Pricing</a>
          <a href="/changelog" className="site-header__link">Changelog</a>
        </nav>
      </header>

      {/* Hero */}
      <div className="hero">
        <div className="hero__gradient" />
        <div className="hero__inner">
          <img src="/logo.png" alt="Fibertuner" className="hero__app-logo" />
          <p className="hero__eyebrow">
            Mac · Windows · Linux{SHOW_IOS ? ' · iPhone' : ''}
          </p>
          <h1 className="hero__title">
            Your Plex library,<br />beautifully played.
          </h1>
          <p className="hero__desc">
            A native desktop app for Mac, Windows, and Linux{SHOW_IOS ? ' — plus iPhone' : ''}.
            Play your Plex library through any speakers, with deep Sonos integration,
            AI-powered features, and enough customization to make it feel like yours.
          </p>
          <div className="hero__ctas">
            <a href="#pricing" className="hero__btn">Get Fibertuner</a>
            <span className="hero__trial-note">Try free for 14 days — no credit card required</span>
            <a href="/downloads" className="hero__secondary-link">
              Already have a license? Download →
            </a>
          </div>
        </div>
      </div>

      {/* Screenshot carousel */}
      <div className="screenshot-carousel" onMouseDown={handleCarouselDrag}>
        {MAC_SCREENSHOTS.map(file => (
          <img
            key={file}
            src={`/assets/fibertuner/${file}`}
            alt={`Fibertuner — ${file}`}
            draggable={false}
            className="screenshot-carousel__img"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ))}
        <div className="screenshot-carousel__spacer" />
      </div>

      {/* About */}
      <div className="about__inner">
        <p className="about__text">
          Plex gives you a self-hosted music library. Fibertuner gives you the best
          way to listen to it — a highly customizable player with AI features built in,
          playing through whatever speakers you have, with deep Sonos integration when you want it.
        </p>
      </div>

      {/* Features */}
      <div className="features__inner">
        <div className="features__list">
          {FEATURES.map(f => (
            <div key={f.title} className="features__row">
              <div className="features__name">{f.title}</div>
              <div className="features__desc">{f.desc}</div>
              <div className="features__platforms">
                {f.mac && <span className="features__platform">Mac</span>}
                {f.mac && !f.ios && <span className="features__platform">Windows · Linux</span>}
                {f.ios && SHOW_IOS && <span className="features__platform">iPhone</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* iPhone section */}
      {SHOW_IOS && (
        <div className="iphone-section__inner">
          <div className="iphone-section__copy">
            <p className="iphone-section__eyebrow">Fibertuner for iPhone</p>
            <h2 className="iphone-section__title">
              The same library.<br />Now in your pocket.
            </h2>
            <p className="iphone-section__desc">
              Browse your full Plex library, manage the queue, and control every
              Sonos room from your phone. Stays in sync with whatever's playing on desktop.
            </p>
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener"
              className="iphone-section__cta"
            >
              Download on App Store ↓
            </a>
          </div>
          <div className="iphone-section__mockup">
            <img
              src="/assets/fibertuner/screenshot-ios.png"
              alt="Fibertuner for iPhone"
              className="iphone-section__img"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        </div>
      )}

      {/* Comparison table */}
      <div className="compare__inner">
        <h2 className="compare__eyebrow">How it compares</h2>
        <p className="compare__title">Built for Plex + Sonos together</p>
        <div className="compare__table-wrap">
          <table className="compare__table">
            <thead>
              <tr>
                <th className="compare__th compare__th--feature"></th>
                <th className="compare__th compare__th--ft">Fibertuner</th>
                <th className="compare__th">Sonos App</th>
                <th className="compare__th">Plexamp</th>
              </tr>
            </thead>
            <tbody>
              {([
                ['Plex library browser',    true,  false, true],
                ['Sonos multi-room control',true,  true,  false],
                ['AI playlist wizard',      true,  false, false],
                ['Offline downloads',       true,  false, true],
                ['TV auto-pause',           true,  false, false],
                ['Vinyl mode',              true,  false, false],
                ['Menu bar tray app',       true,  false, false],
                ['Artist radio',            true,  false, true],
                ['macOS / Windows / Linux', true,  true,  true],
              ] as [string, boolean, boolean, boolean][]).map(([label, ft, sonos, plexamp]) => (
                <tr key={label} className="compare__row">
                  <td className="compare__td compare__td--label">{label}</td>
                  <td className="compare__td compare__td--ft">{ft ? '✓' : '—'}</td>
                  <td className="compare__td">{sonos ? '✓' : '—'}</td>
                  <td className="compare__td">{plexamp ? '✓' : '—'}</td>
                </tr>
              ))}
              <tr className="compare__row compare__row--price">
                <td className="compare__td compare__td--label">Price</td>
                <td className="compare__td compare__td--ft">From $12/yr</td>
                <td className="compare__td">Free</td>
                <td className="compare__td">Free</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="pricing">
        <div className="pricing__gradient" />
        <div className="pricing__inner">
          <h2 className="pricing__eyebrow">Pricing</h2>
          <p className="pricing__title">One app. Two ways to own it.</p>
          <p className="pricing__desc">
            Personal plans cover you on up to 3 machines. Server plans unlock Fibertuner for every user on your Plex server.
          </p>
          <p className="pricing__social-proof">
            Trusted by Plex + Sonos households across 30+ countries.
          </p>

          <div className="pricing__tier">
            <div className="pricing__tier-header">
              <span className="pricing__tier-label">Personal</span>
              <span className="pricing__tier-note">For individuals with Plex access. Works on any server you can log into. Up to 3 machines.</span>
            </div>
            <div className="pricing__grid">
              <PricingCard
                name="Annual"
                price="$12"
                period="/yr"
                features={['Any Plex server you have access to', 'Up to 3 machines', 'All features included']}
                cta="Get Annual — $12/yr"
                url="https://fibertuner.lemonsqueezy.com/checkout/buy/add4dde9-bb85-4124-be19-b75627f5e60e"
                highlighted={false}
              />
              <PricingCard
                name="Lifetime"
                price="$29"
                period=" one-time"
                badge="Best value"
                features={['Any Plex server you have access to', 'Up to 3 machines', 'All features included', 'All future updates']}
                cta="Get Lifetime — $29"
                url="https://fibertuner.lemonsqueezy.com/checkout/buy/2d033d45-75e1-4ed6-aaef-b1e44b598217"
                highlighted={true}
              />
            </div>
          </div>

          <div className="pricing__tier">
            <div className="pricing__tier-header">
              <span className="pricing__tier-label">Server</span>
              <span className="pricing__tier-note">For Plex server admins. One purchase unlocks Fibertuner for every user on your Plex server.</span>
            </div>
            <div className="pricing__grid">
              <PricingCard
                name="Annual"
                price="$29"
                period="/yr"
                features={['Unlimited users on your server', 'Users just log in with Plex', 'All features included']}
                cta="Set up Server Plan — $29/yr"
                url="https://fibertuner.lemonsqueezy.com/checkout/buy/36250bf9-3443-4027-b1d6-2596321531e4"
                highlighted={false}
              />
              <PricingCard
                name="Lifetime"
                price="$69"
                period=" one-time"
                badge="One-time"
                features={['Unlimited users on your server', 'Users just log in with Plex', 'All features included', 'All future updates']}
                cta="Get Server Lifetime — $69"
                url="https://fibertuner.lemonsqueezy.com/checkout/buy/2dda2c28-66b1-458b-b399-fdc866964dd0"
                highlighted={true}
              />
            </div>
          </div>

          <p className="pricing__footnote">
            Server plans verify Plex server ownership at checkout.
          </p>
        </div>
      </div>

      {/* Requirements */}
      <div className="requirements__inner">
        <h2 className="requirements__eyebrow">What you need</h2>
        <p className="requirements__desc">
          If you have access to a Plex Media Server, Fibertuner works without any
          additional setup. No accounts, no subscriptions.
        </p>
        <div className="requirements__list">
          {([
            ['Plex Media Server', 'You just need access to one — yours, a friend\'s, or family. Free tier works.'],
            ['Sonos speakers',    'Optional — for multi-room grouping and per-speaker volume control.'],
            ['macOS 12+',        'Apple Silicon and Intel Mac.'],
            ['Windows 10+',      'x64. Download the .exe installer.'],
            ['Linux',            'x64 AppImage — no install required, works on most distros.'],
            ...(SHOW_IOS ? [['iOS 16+', 'iPhone. iPad support coming.']] : []),
          ] as [string, string][]).map(([label, note]) => (
            <div key={label} className="requirements__row">
              <span className="requirements__label">{label}</span>
              <span className="requirements__note">{note}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="page-spacer" />

      <Footer appName="Fibertuner" githubRepo={GITHUB} />
    </div>
  )
}
