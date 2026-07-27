import { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import '../styles/app.css'

const GITHUB = 'm4tuna/fibertuner-site'

async function fetchArtworkUrl(artist: string, album: string): Promise<string | null> {
  try {
    const q = encodeURIComponent(`${artist} ${album}`)
    const res = await fetch(`https://itunes.apple.com/search?term=${q}&entity=album&media=music&limit=5`)
    const data = await res.json()
    const match = (data.results ?? []).find((r: any) =>
      r.collectionType === 'Album' &&
      r.collectionName?.toLowerCase().includes(album.toLowerCase().slice(0, 6))
    ) ?? data.results?.[0]
    if (!match?.artworkUrl100) return null
    return match.artworkUrl100.replace('100x100bb', '600x600bb')
  } catch {
    return null
  }
}

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

  const [artUrl, setArtUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!artist && !album) return
    fetchArtworkUrl(artist, album).then(setArtUrl)
  }, [artist, album])

  return (
    <div>
      <header className="site-header">
        <a href="/" className="site-header__logo">Fibertuner</a>
      </header>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '64px 40px 40px', textAlign: 'center' }}>
        {artUrl && (
          <div style={{
            width: 200, height: 200,
            margin: '0 auto 32px',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            background: 'rgba(255,255,255,0.05)',
          }}>
            <img src={artUrl} alt={album} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        )}
        {!artUrl && (
          <div style={{
            width: 200, height: 200,
            margin: '0 auto 32px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.05)',
          }} />
        )}

        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          {isTrack ? 'Track' : 'Album'}
        </div>
        {displayTitle && (
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, lineHeight: 1.2 }}>
            {displayTitle}
          </h1>
        )}
        {displaySub && (
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 36 }}>
            {displaySub}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <a
            href={deepLinkUrl}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '13px 32px', borderRadius: 24, fontSize: 15, fontWeight: 600,
              background: 'var(--accent)', color: '#fff', textDecoration: 'none',
              transition: 'opacity 0.1s',
            }}
          >
            Open in Fibertuner
          </a>
          <a
            href="/"
            style={{
              fontSize: 13, color: 'rgba(255,255,255,0.4)',
              textDecoration: 'none',
              transition: 'color 0.1s',
            }}
          >
            Learn more →
          </a>
        </div>
      </div>

      <Footer appName="Fibertuner" githubRepo={GITHUB} />
    </div>
  )
}
