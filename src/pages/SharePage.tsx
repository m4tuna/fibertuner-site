import { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { fetchAlbumArt } from '../lib/albumArt'
import '../styles/app.css'

const GITHUB = 'm4tuna/fibertuner-site'

interface SharerInfo {
  username: string
  serverName: string
}

export default function SharePage() {
  const params = new URLSearchParams(window.location.search)
  const title = params.get('t') ?? ''
  const artist = params.get('a') ?? ''
  const album = params.get('al') ?? ''
  const rk = params.get('rk') ?? ''
  const server = params.get('s') ?? ''

  const isTrack = !!rk
  const deepLinkUrl = `fibertuner://share?${window.location.search.slice(1)}`
  const displayTitle = isTrack ? title : album
  const displaySub = isTrack ? `${artist} · ${album}` : artist

  const [artUrl, setArtUrl] = useState<string | null>(null)
  const [sharer, setSharer] = useState<SharerInfo | null>(null)

  useEffect(() => {
    if (!artist && !album) return
    fetchAlbumArt(artist, album).then(setArtUrl)
  }, [artist, album])

  useEffect(() => {
    if (!server) return
    supabase
      .from('profiles')
      .select('plex_username, server_name')
      .eq('server_machine_id', server)
      .eq('server_owned', true)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setSharer({ username: data[0].plex_username, serverName: data[0].server_name })
        }
      })
  }, [server])

  return (
    <div>
      <header className="site-header">
        <a href="/" className="site-header__logo">Fibertuner</a>
      </header>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '64px 40px 40px', textAlign: 'center' }}>
        {sharer && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 32 }}>
            Shared by <strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{sharer.username}</strong>
            {sharer.serverName ? <> · {sharer.serverName}</> : null}
          </p>
        )}

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
