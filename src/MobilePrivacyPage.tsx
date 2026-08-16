import Footer from './components/Footer'

const GITHUB = 'm4tuna/fibertuner'

const SECTIONS = [
  {
    title: 'Overview',
    body: `Fibertuner does not collect, transmit, or store any personal data. There are no analytics, no crash reporting services, and no data that we as the developer can access from your device.`,
  },
  {
    title: 'What the app does',
    body: `Fibertuner is a Sonos controller with optional Plex integration. It lets you browse your Plex music library, control playback, and manage Sonos speakers and groups — all from your iPhone.`,
  },
  {
    title: 'Network connections',
    body: `Fibertuner connects to two services on your behalf:\n\n• Sonos — device discovery and control happens entirely on your local network via standard Sonos protocols. No data leaves your home network.\n\n• Plex — the app connects to your own Plex Media Server or plex.tv account to read your library and send playback commands. Any playback history recorded by Plex stays in your own Plex account; we cannot access it.`,
  },
  {
    title: 'Third-party services',
    body: `Fibertuner itself has no third-party SDKs, analytics tools, or advertising networks.\n\n• Plex — acts as your own music server. Your use of Plex is governed by Plex's privacy policy.\n\n• Apple TestFlight — the beta version of Fibertuner is distributed via Apple's TestFlight program. Apple may collect crash logs and usage statistics for beta apps per Apple's own privacy policy. Fibertuner collects nothing additional beyond what Apple handles automatically.`,
  },
  {
    title: 'Data retention',
    body: `Because we collect no data, there is nothing to retain or delete.`,
  },
  {
    title: 'Contact',
    body: `Questions? Email m4tuna@gmail.com.`,
  },
]

export default function MobilePrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="site-header">
        <a href="/" className="site-header__logo">Fibertuner</a>
      </header>

      <div style={{ flex: 1, maxWidth: 640, margin: '0 auto', padding: '72px 40px 80px', width: '100%' }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 16 }}>
          Legal
        </p>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 600, letterSpacing: '-0.5px', marginBottom: 8 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 56 }}>
          Last updated August 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {SECTIONS.map(s => (
            <div key={s.title}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 12 }}>
                {s.title}
              </h2>
              {s.body.split('\n\n').map((para, i) => (
                <p key={i} style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: i < s.body.split('\n\n').length - 1 ? 12 : 0 }}>
                  {para}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Footer appName="Fibertuner" githubRepo={GITHUB} />
    </div>
  )
}
