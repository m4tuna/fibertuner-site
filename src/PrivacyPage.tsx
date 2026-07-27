import Footer from './components/Footer'

const GITHUB = 'm4tuna/fibertuner'
const CONTACT = 'm4tuna@gmail.com'

const SECTIONS = [
  {
    title: 'What we collect',
    body: `When you sign in with Plex, Fibertuner receives your Plex username, email address, and profile avatar from Plex's OAuth service. If you own a Plex Media Server, we also store your server's name and a unique machine identifier so other users on your server can be recognized. This information is stored in our database (Supabase) and used solely to provide the app's features.

We do not collect browsing data, analytics, or advertising identifiers.`,
  },
  {
    title: 'Payments',
    body: `Purchases are handled entirely by LemonSqueezy, who acts as the Merchant of Record. We never see or store your payment card details. LemonSqueezy's privacy policy governs any data collected during checkout.`,
  },
  {
    title: 'Third-party services',
    body: `Fibertuner relies on the following third parties:\n\n• Plex — authentication and library access. Your use of Plex is governed by Plex's privacy policy.\n• LemonSqueezy — payment processing and license management.\n• Supabase — secure storage of user profile data. Data is stored in the US.`,
  },
  {
    title: 'Data retention',
    body: `Your profile data is kept for as long as you use Fibertuner. You can request deletion at any time by emailing us (see below) and we will remove your data within 30 days.`,
  },
  {
    title: 'Your rights',
    body: `If you are in the EU or California, you have the right to access, correct, or delete the personal data we hold about you. To exercise these rights, contact us by email.`,
  },
  {
    title: 'Contact',
    body: `Questions or deletion requests: ${CONTACT}`,
  },
]

export default function PrivacyPage() {
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
          Last updated July 2026
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
