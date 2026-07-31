import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchAlbumArt } from '../lib/albumArt'
import type {
  BroadcastSession,
  BroadcastTrack,
  BroadcastArtist,
  BroadcastAlbum,
  BroadcastParticipant,
  BroadcastCommand,
} from '../lib/broadcastTypes'

// ── Helpers ────────────────────────────────────────────────────────────────────

function extractCode(): string {
  const m = window.location.pathname.match(/\/broadcast\/([A-Z0-9]{1,10})/i)
  return m ? m[1].toUpperCase() : ''
}

function formatTime(secs: number): string {
  if (!secs || isNaN(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatDuration(ms: number): string {
  return formatTime(ms / 1000)
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase() || '?'
}

function randomUserId(): string {
  return `guest-${Math.random().toString(36).slice(2, 10)}`
}

function getSavedName(): string | null {
  try { return localStorage.getItem('broadcastDisplayName') } catch { return null }
}

function isSessionEnded(session: BroadcastSession): boolean {
  if (new Date(session.expiresAt) < new Date()) return true
  if (session.state === 'stopped') {
    const staleSecs = (Date.now() - new Date(session.updatedAt).getTime()) / 1000
    if (staleSecs > 120) return true
  }
  return false
}

function rowToSession(row: Record<string, unknown>): BroadcastSession {
  return {
    code:          row.code as string,
    hostUserId:    row.host_user_id as string,
    hostName:      row.host_name as string,
    name:          (row.name as string | null) ?? null,
    source:        row.source as BroadcastSession['source'],
    state:         row.state as BroadcastSession['state'],
    currentTrack:  (row.current_track as BroadcastTrack | null) ?? null,
    queue:         (row.queue as BroadcastTrack[]) ?? [],
    currentIndex:  (row.current_index as number) ?? 0,
    positionSec:   (row.position_sec as number) ?? 0,
    broadcastAt:   row.broadcast_at ? new Date(row.broadcast_at as string).getTime() : Date.now(),
    expiresAt:     row.expires_at as string,
    updatedAt:     row.updated_at as string,
  }
}

// ── Join screen ────────────────────────────────────────────────────────────────

function JoinScreen({
  session,
  artUrl,
  onJoin,
}: {
  session: BroadcastSession
  artUrl: string | null
  onJoin: (name: string) => void
}) {
  const [name, setName] = useState(() => getSavedName() || '')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  const sessionTitle = session.name || `${session.hostName}'s Broadcast`
  const upNext = session.queue.slice(session.currentIndex + 1, session.currentIndex + 4)

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1', maxHeight: 280, overflow: 'hidden', flexShrink: 0 }}>
        {artUrl ? (
          <>
            <img
              src={artUrl} alt=""
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', filter: 'blur(28px) saturate(120%) brightness(0.45)',
                transform: 'scale(1.1)',
              }}
            />
            <img
              src={artUrl} alt={session.currentTrack?.album ?? ''}
              style={{
                position: 'relative', zIndex: 1,
                display: 'block', margin: '0 auto',
                height: '100%', width: 'auto', maxWidth: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.7))',
              }}
            />
          </>
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(0,0,0,0) 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5">
              <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
            </svg>
          </div>
        )}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, zIndex: 2,
          background: 'linear-gradient(to bottom, transparent, #0a0a0a)',
        }} />
      </div>

      <div style={{ flex: 1, maxWidth: 480, width: '100%', margin: '0 auto', padding: '0 20px', paddingBottom: 'max(40px, env(safe-area-inset-bottom, 0px))', boxSizing: 'border-box' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, marginTop: 4 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)',
            borderRadius: 20, padding: '3px 9px',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', letterSpacing: '0.08em' }}>LIVE</span>
          </div>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
            hosted by <strong style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{session.hostName}</strong>
          </span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, lineHeight: 1.2, color: '#fff' }}>{sessionTitle}</h1>

        {session.currentTrack && (
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '12px 14px', marginBottom: 12,
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Now Playing
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {artUrl && <img src={artUrl} alt="" style={{ width: 40, height: 40, borderRadius: 5, objectFit: 'cover', flexShrink: 0 }} />}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {session.currentTrack.title}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {session.currentTrack.artist}
                  {session.currentTrack.album ? ` · ${session.currentTrack.album}` : ''}
                </div>
              </div>
            </div>
          </div>
        )}

        {upNext.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '12px 14px', marginBottom: 20,
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Up Next
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upNext.map((t, i) => (
                <div key={`${t.uri}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {t.artUrl ? (
                    <img src={t.artUrl} alt="" style={{ width: 28, height: 28, borderRadius: 3, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 28, height: 28, borderRadius: 3, background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.artist}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
          What should we call you?
        </div>
        <input
          ref={inputRef}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onJoin(name.trim()) }}
          placeholder="Your name"
          maxLength={30}
          style={{
            width: '100%', padding: '13px 16px',
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)',
            borderRadius: 10, color: '#fff', fontSize: 16, outline: 'none',
            fontFamily: 'inherit', marginBottom: 12, boxSizing: 'border-box',
            WebkitAppearance: 'none',
          }}
        />
        <button
          onClick={() => { if (name.trim()) onJoin(name.trim()) }}
          disabled={!name.trim()}
          style={{
            width: '100%', padding: '14px 0',
            background: name.trim() ? 'var(--accent, #a78bfa)' : 'rgba(255,255,255,0.08)',
            color: name.trim() ? '#fff' : 'rgba(255,255,255,0.25)',
            borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 600,
            cursor: name.trim() ? 'pointer' : 'default', fontFamily: 'inherit',
            transition: 'background 0.15s',
          }}
        >
          Join Broadcast
        </button>

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <button
            onClick={() => { window.location.href = `fibertuner://broadcast/${session.code}` }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'inherit',
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}
          >
            Open in Fibertuner app instead
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Smart app banner ───────────────────────────────────────────────────────────

function AppBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.07)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '10px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <img src="/favicon.png" alt="" style={{ width: 32, height: 32, borderRadius: 8 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Fibertuner</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Better experience in the app</div>
      </div>
      <a
        href="https://fibertuner.com"
        style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent, #a78bfa)', textDecoration: 'none', whiteSpace: 'nowrap' }}
      >
        Get App →
      </a>
      <button
        onClick={onDismiss}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18, padding: '0 4px', lineHeight: 1 }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}

// ── Now-playing progress bar ───────────────────────────────────────────────────

function ProgressBar({ session }: { session: BroadcastSession }) {
  const [displaySec, setDisplaySec] = useState(session.positionSec)

  useEffect(() => {
    if (session.state !== 'playing') {
      setDisplaySec(session.positionSec)
      return
    }
    const t = setInterval(() => {
      const elapsed = (Date.now() - session.broadcastAt) / 1000
      const dur = (session.currentTrack?.durationMs ?? 0) / 1000
      setDisplaySec(Math.min(session.positionSec + elapsed, dur))
    }, 100)
    return () => clearInterval(t)
  }, [session.state, session.broadcastAt, session.positionSec, session.currentTrack?.durationMs])

  const dur = (session.currentTrack?.durationMs ?? 0) / 1000
  const pct = dur > 0 ? Math.min(displaySec / dur, 1) * 100 : 0

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 2, position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${pct}%`, background: 'var(--accent, #a78bfa)',
          borderRadius: 2, transition: 'width 0.1s linear',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{formatTime(displaySec)}</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{formatDuration(session.currentTrack?.durationMs ?? 0)}</span>
      </div>
    </div>
  )
}

// ── Participants strip ─────────────────────────────────────────────────────────

function ParticipantsStrip({ participants, hostUserId }: { participants: BroadcastParticipant[]; hostUserId: string }) {
  if (!participants.length) return null
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
      {participants.map(p => (
        <div key={p.userId} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.07)', borderRadius: 20,
          padding: '4px 10px', flexShrink: 0, fontSize: 12,
          border: p.userId === hostUserId ? '1px solid rgba(167,139,250,0.4)' : '1px solid transparent',
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: 'rgba(167,139,250,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: '#a78bfa',
          }}>
            {getInitials(p.displayName)}
          </div>
          <span style={{ color: 'rgba(255,255,255,0.8)' }}>{p.displayName}</span>
          {p.isHost && (
            <span style={{ fontSize: 9, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.05em', textTransform: 'uppercase' }}>HOST</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Queue track row ────────────────────────────────────────────────────────────

function QueueRow({
  track, isCurrentTrack, myUserId, onVote, rowRef,
}: {
  track: BroadcastTrack
  isCurrentTrack: boolean
  myUserId: string
  onVote: (uri: string, vote: 'up' | 'down') => void
  rowRef?: React.Ref<HTMLDivElement>
}) {
  const myUp = track.votes.up.includes(myUserId)
  const myDown = track.votes.down.includes(myUserId)

  return (
    <div ref={rowRef} style={{
      padding: '10px 0',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', gap: 10,
      borderLeft: isCurrentTrack ? '2px solid var(--accent, #a78bfa)' : '2px solid transparent',
      paddingLeft: isCurrentTrack ? 10 : 0,
      background: isCurrentTrack ? 'rgba(167,139,250,0.05)' : 'transparent',
    }}>
      {track.artUrl ? (
        <img src={track.artUrl} alt="" style={{ width: 38, height: 38, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <div style={{ width: 38, height: 38, borderRadius: 4, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: isCurrentTrack ? 'var(--accent, #a78bfa)' : '#fff',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{track.title}</div>
        <div style={{
          fontSize: 11, color: 'rgba(255,255,255,0.45)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{track.artist}{track.addedBy ? ` · added by ${track.addedBy}` : ''}</div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => onVote(track.uri, 'up')}
          style={{
            background: myUp ? 'rgba(134,239,172,0.2)' : 'rgba(255,255,255,0.07)',
            border: myUp ? '1px solid rgba(134,239,172,0.4)' : '1px solid transparent',
            color: myUp ? '#86efac' : 'rgba(255,255,255,0.4)',
            borderRadius: 8, padding: '10px 12px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 4, minWidth: 44, justifyContent: 'center',
          }}
        >
          ↑ {track.votes.up.length}
        </button>
        <button
          onClick={() => onVote(track.uri, 'down')}
          style={{
            background: myDown ? 'rgba(252,165,165,0.2)' : 'rgba(255,255,255,0.07)',
            border: myDown ? '1px solid rgba(252,165,165,0.4)' : '1px solid transparent',
            color: myDown ? '#fca5a5' : 'rgba(255,255,255,0.4)',
            borderRadius: 8, padding: '10px 12px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 4, minWidth: 44, justifyContent: 'center',
          }}
        >
          ↓ {track.votes.down.length}
        </button>
      </div>
    </div>
  )
}

// ── Search section ─────────────────────────────────────────────────────────────

type DrillView =
  | { kind: 'results' }
  | { kind: 'artist-albums'; artist: BroadcastArtist; albums: BroadcastAlbum[] }
  | { kind: 'album-tracks'; album: BroadcastAlbum; tracks: BroadcastTrack[] }

function SearchSection({
  onAddTrack,
  onPlayNext,
  onSearch,
  onBrowseArtist,
  onBrowseAlbum,
  searchResults,
  searchArtists,
  searchAlbums,
  browseResults,
  searching,
  browsing,
  myDisplayName,
  queue,
}: {
  onAddTrack: (track: BroadcastTrack) => void
  onPlayNext: (track: BroadcastTrack) => void
  onSearch: (query: string) => void
  onBrowseArtist: (artist: BroadcastArtist) => void
  onBrowseAlbum: (album: BroadcastAlbum) => void
  searchResults: BroadcastTrack[]
  searchArtists: BroadcastArtist[]
  searchAlbums: BroadcastAlbum[]
  browseResults: { kind: 'albums' | 'tracks'; albums: BroadcastAlbum[]; tracks: BroadcastTrack[] } | null
  searching: boolean
  browsing: boolean
  myDisplayName: string
  queue: BroadcastTrack[]
}) {
  const [query, setQuery] = useState('')
  const [drillView, setDrillView] = useState<DrillView>({ kind: 'results' })
  const [drillHistory, setDrillHistory] = useState<DrillView[]>([])
  const [pendingArtist, setPendingArtist] = useState<BroadcastArtist | null>(null)
  const [pendingAlbum, setPendingAlbum] = useState<BroadcastAlbum | null>(null)
  const [confirmTrack, setConfirmTrack] = useState<BroadcastTrack | null>(null)
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set())
  const [recentlyQueued, setRecentlyQueued] = useState<Set<string>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // When browseResults arrive, advance the drill view (push current view onto history first)
  useEffect(() => {
    if (!browseResults) return
    if (browseResults.kind === 'albums' && pendingArtist) {
      setDrillHistory(h => [...h, drillView])
      setDrillView({ kind: 'artist-albums', artist: pendingArtist, albums: browseResults.albums })
      setPendingArtist(null)
    } else if (browseResults.kind === 'tracks' && pendingAlbum) {
      setDrillHistory(h => [...h, drillView])
      setDrillView({ kind: 'album-tracks', album: pendingAlbum, tracks: browseResults.tracks })
      setPendingAlbum(null)
    }
  }, [browseResults]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    setDrillView({ kind: 'results' })
    setDrillHistory([])
    setPendingArtist(null)
    setPendingAlbum(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onSearch(q), 300)
  }

  const handleClear = () => {
    setQuery('')
    setDrillView({ kind: 'results' })
    setDrillHistory([])
    setPendingArtist(null)
    setPendingAlbum(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    onSearch('')
  }

  const flashAdded = (uri: string, set: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    set(prev => new Set([...prev, uri]))
    setTimeout(() => set(prev => { const n = new Set(prev); n.delete(uri); return n }), 2000)
  }

  const handleAdd = (track: BroadcastTrack) => {
    const isDuplicate = queue.some(t => t.uri === track.uri)
    if (isDuplicate) {
      setConfirmTrack(track)
    } else {
      onAddTrack({ ...track, addedBy: myDisplayName, votes: { up: [], down: [] } })
      flashAdded(track.uri, setRecentlyQueued)
    }
  }

  const handlePlayNext = (track: BroadcastTrack) => {
    onPlayNext({ ...track, addedBy: myDisplayName, votes: { up: [], down: [] } })
    flashAdded(track.uri, setRecentlyAdded)
  }

  const handleArtistClick = (artist: BroadcastArtist) => {
    setPendingArtist(artist)
    setPendingAlbum(null)
    onBrowseArtist(artist)
  }

  const handleAlbumClick = (album: BroadcastAlbum) => {
    setPendingAlbum(album)
    setPendingArtist(null)
    onBrowseAlbum(album)
  }

  const goBack = () => {
    setPendingArtist(null)
    setPendingAlbum(null)
    if (drillHistory.length > 0) {
      const prev = drillHistory[drillHistory.length - 1]
      setDrillHistory(h => h.slice(0, -1))
      setDrillView(prev)
    } else {
      setDrillView({ kind: 'results' })
    }
  }

  const hasResults = searchArtists.length > 0 || searchAlbums.length > 0 || searchResults.length > 0

  // Determine what list of tracks to show in track rows
  const tracksToShow = drillView.kind === 'album-tracks'
    ? drillView.tracks
    : drillView.kind === 'results'
    ? searchResults
    : []

  const sectionHeader = (label: string) => (
    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 14px 6px' }}>
      {label}
    </div>
  )

  return (
    <div>
      {/* Back button when drilling */}
      {drillView.kind !== 'results' && (
        <button
          onClick={goBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'inherit',
            padding: '0 0 12px', fontWeight: 500,
          }}
        >
          ← Back
        </button>
      )}

      <div style={{ position: 'relative' }}>
        <input
          value={query}
          onChange={handleInput}
          placeholder="Artists, albums, tracks…"
          style={{
            width: '100%', padding: '11px 44px 11px 16px',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, color: '#fff', fontSize: 16, outline: 'none',
            fontFamily: 'inherit', boxSizing: 'border-box', WebkitAppearance: 'none',
          }}
        />
        {(searching || browsing) && (
          <span style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            fontSize: 11, color: 'rgba(255,255,255,0.4)', pointerEvents: 'none',
          }}>{searching ? 'Searching…' : 'Loading…'}</span>
        )}
        {query && !searching && !browsing && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
              width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1,
              padding: 0,
            }}
          >×</button>
        )}
      </div>

      {/* Empty state when search completes but has no results */}
      {drillView.kind === 'results' && query && !searching && !browsing &&
        searchResults.length === 0 && searchArtists.length === 0 && searchAlbums.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '32px 0',
          color: 'rgba(255,255,255,0.3)', fontSize: 13,
        }}>
          No results for <strong style={{ color: 'rgba(255,255,255,0.5)' }}>"{query}"</strong>
        </div>
      )}

      {/* Confirm duplicate modal */}
      {confirmTrack && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div style={{
            background: '#111', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, padding: 24, maxWidth: 320, width: '100%',
          }}>
            <p style={{ fontSize: 14, marginBottom: 20, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
              <strong style={{ color: '#fff' }}>{confirmTrack.title}</strong> is already in the queue. Add it again?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmTrack(null)} style={{
                flex: 1, padding: '11px 0', background: 'rgba(255,255,255,0.08)',
                border: 'none', borderRadius: 9, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
              }}>Cancel</button>
              <button onClick={() => {
                onAddTrack({ ...confirmTrack, addedBy: myDisplayName, votes: { up: [], down: [] } })
                flashAdded(confirmTrack.uri, setRecentlyQueued)
                setConfirmTrack(null)
              }} style={{
                flex: 1, padding: '11px 0', background: 'var(--accent, #a78bfa)',
                border: 'none', borderRadius: 9, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
              }}>Add Anyway</button>
            </div>
          </div>
        </div>
      )}

      {/* Artist albums drill-down */}
      {drillView.kind === 'artist-albums' && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{drillView.artist.title}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>Select an album</div>
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.09)' }}>
            {drillView.albums.map((album, i) => (
              <div
                key={album.ratingKey}
                onClick={() => handleAlbumClick(album)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
                  borderBottom: i < drillView.albums.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  cursor: 'pointer',
                }}
              >
                {album.artUrl ? (
                  <img src={album.artUrl} alt="" style={{ width: 38, height: 38, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 38, height: 38, borderRadius: 4, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{album.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{album.year ?? ''}</div>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top-level search results: Artists + Albums + Tracks sections */}
      {drillView.kind === 'results' && hasResults && (
        <div style={{ marginTop: 8, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.09)' }}>
          {/* Artists section */}
          {searchArtists.length > 0 && (
            <>
              {sectionHeader('Artists')}
              {searchArtists.map((artist) => (
                <div
                  key={artist.ratingKey}
                  onClick={() => handleArtistClick(artist)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 14px', background: 'rgba(255,255,255,0.03)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                  }}
                >
                  {artist.artUrl ? (
                    <img src={artist.artUrl} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {artist.title}
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>›</span>
                </div>
              ))}
            </>
          )}

          {/* Albums section */}
          {searchAlbums.length > 0 && (
            <>
              {sectionHeader('Albums')}
              {searchAlbums.map((album) => (
                <div
                  key={album.ratingKey}
                  onClick={() => handleAlbumClick(album)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 14px', background: 'rgba(255,255,255,0.03)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                  }}
                >
                  {album.artUrl ? (
                    <img src={album.artUrl} alt="" style={{ width: 34, height: 34, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 34, height: 34, borderRadius: 4, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{album.title}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{album.artistName}</div>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>›</span>
                </div>
              ))}
            </>
          )}

          {/* Tracks section */}
          {searchResults.length > 0 && (
            <>
              {(searchArtists.length > 0 || searchAlbums.length > 0) && sectionHeader('Tracks')}
              {tracksToShow.map((r, i) => {
                const queued = recentlyQueued.has(r.uri)
                const nexted = recentlyAdded.has(r.uri)
                return (
                  <div
                    key={`${r.uri}-${i}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
                      borderBottom: i < tracksToShow.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    }}
                  >
                    {r.artUrl ? (
                      <img src={r.artUrl} alt="" style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: 4, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{r.title}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.artist} · {r.album}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => handlePlayNext(r)}
                        style={{
                          padding: '6px 10px',
                          background: nexted ? 'rgba(134,239,172,0.15)' : 'rgba(167,139,250,0.15)',
                          border: nexted ? '1px solid rgba(134,239,172,0.35)' : '1px solid rgba(167,139,250,0.3)',
                          borderRadius: 7,
                          color: nexted ? '#86efac' : '#a78bfa',
                          cursor: 'pointer', fontSize: 11, fontWeight: 600,
                          fontFamily: 'inherit', whiteSpace: 'nowrap',
                          transition: 'all 0.2s',
                        }}
                      >{nexted ? '✓ Next' : '▶︎ Next'}</button>
                      <button
                        onClick={() => handleAdd(r)}
                        style={{
                          padding: '6px 10px',
                          background: queued ? 'rgba(134,239,172,0.15)' : 'rgba(255,255,255,0.06)',
                          border: queued ? '1px solid rgba(134,239,172,0.35)' : '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 7,
                          color: queued ? '#86efac' : 'rgba(255,255,255,0.8)',
                          cursor: 'pointer', fontSize: 11, fontWeight: 600,
                          fontFamily: 'inherit', whiteSpace: 'nowrap',
                          transition: 'all 0.2s',
                        }}
                      >{queued ? '✓ Added' : '+ Queue'}</button>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* Album tracks drill-down */}
      {drillView.kind === 'album-tracks' && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{drillView.album.title}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>{drillView.album.artistName}</div>
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.09)' }}>
            {drillView.tracks.map((r, i) => {
              const queued = recentlyQueued.has(r.uri)
              const nexted = recentlyAdded.has(r.uri)
              return (
                <div
                  key={`${r.uri}-${i}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
                    borderBottom: i < drillView.tracks.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  <div style={{ width: 22, minWidth: 22, textAlign: 'right', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{r.title}</div>
                    {r.artist && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.artist}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => handlePlayNext(r)}
                      style={{
                        padding: '6px 10px',
                        background: nexted ? 'rgba(134,239,172,0.15)' : 'rgba(167,139,250,0.15)',
                        border: nexted ? '1px solid rgba(134,239,172,0.35)' : '1px solid rgba(167,139,250,0.3)',
                        borderRadius: 7, color: nexted ? '#86efac' : '#a78bfa',
                        cursor: 'pointer', fontSize: 11, fontWeight: 600,
                        fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.2s',
                      }}
                    >{nexted ? '✓ Next' : '▶︎ Next'}</button>
                    <button
                      onClick={() => handleAdd(r)}
                      style={{
                        padding: '6px 10px',
                        background: queued ? 'rgba(134,239,172,0.15)' : 'rgba(255,255,255,0.06)',
                        border: queued ? '1px solid rgba(134,239,172,0.35)' : '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 7, color: queued ? '#86efac' : 'rgba(255,255,255,0.8)',
                        cursor: 'pointer', fontSize: 11, fontWeight: 600,
                        fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.2s',
                      }}
                    >{queued ? '✓ Added' : '+ Queue'}</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main BroadcastPage ────────────────────────────────────────────────────────

export default function BroadcastPage() {
  const code = extractCode()

  const [session, setSession] = useState<BroadcastSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [participants, setParticipants] = useState<BroadcastParticipant[]>([])
  const [showNameModal, setShowNameModal] = useState(false)
  const [joined, setJoined] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const [activeTab, setActiveTab] = useState<'queue' | 'search'>('queue')
  const [artUrl, setArtUrl] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<BroadcastTrack[]>([])
  const [searchArtists, setSearchArtists] = useState<BroadcastArtist[]>([])
  const [searchAlbums, setSearchAlbums] = useState<BroadcastAlbum[]>([])
  const [browseResults, setBrowseResults] = useState<{ kind: 'albums' | 'tracks'; albums: BroadcastAlbum[]; tracks: BroadcastTrack[] } | null>(null)
  const [searching, setSearching] = useState(false)
  const [browsing, setBrowsing] = useState(false)

  const [myUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('broadcastUserId')
      if (saved) return saved
      const id = randomUserId()
      localStorage.setItem('broadcastUserId', id)
      return id
    } catch { return randomUserId() }
  })
  const [myDisplayName, setMyDisplayName] = useState<string>(() => getSavedName() || '')

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const browseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deepLinkAttempted = useRef(false)
  const currentTrackRowRef = useRef<HTMLDivElement | null>(null)

  // Fetch initial session row
  useEffect(() => {
    if (!code) {
      setError('Invalid broadcast code.')
      setLoading(false)
      return
    }

    supabase
      .from('broadcast_sessions')
      .select('*')
      .eq('code', code)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError('Broadcast not found.')
          setLoading(false)
          return
        }
        const s = rowToSession(data as Record<string, unknown>)
        setSession(s)
        setLoading(false)

        if (!isSessionEnded(s)) {
          if (!deepLinkAttempted.current) {
            deepLinkAttempted.current = true
            window.location.href = `fibertuner://broadcast/${code}`
          }
          // Auto-rejoin returning users — skip the name modal if we have a saved name
          const savedName = getSavedName()
          if (savedName) {
            setJoined(true)
          } else {
            setShowNameModal(true)
          }
        }
      })
  }, [code])

  // Fetch album art
  useEffect(() => {
    if (!session?.currentTrack) return
    const { artist, album } = session.currentTrack
    if (artist || album) {
      fetchAlbumArt(artist, album).then(url => { if (url) setArtUrl(url) })
    }
  }, [session?.currentTrack?.title])

  // Single channel: postgres_changes + presence + broadcast (search results)
  // All subscriptions on one channel so nothing stomps on each other.
  useEffect(() => {
    if (!code || !joined) return

    const ch = supabase
      .channel(`broadcast:${code}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'broadcast_sessions', filter: `code=eq.${code}` },
        (payload) => {
          if (payload.new) setSession(rowToSession(payload.new as Record<string, unknown>))
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = ch.presenceState() as Record<string, Array<{ userId: string; displayName: string; isHost: boolean; joinedAt: number }>>
        setParticipants(Object.values(state).flat())
      })
      .on('broadcast', { event: 'command' }, ({ payload }: { payload: BroadcastCommand }) => {
        if (payload.type === 'search-results') {
          setSearchResults(payload.results)
          setSearchArtists((payload as any).artists ?? [])
          setSearchAlbums((payload as any).albums ?? [])
          setBrowseResults(null)
          setSearching(false)
          if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
        }
        if (payload.type === 'browse-results') {
          setBrowseResults({ kind: payload.kind, albums: payload.albums, tracks: payload.tracks })
          setBrowsing(false)
          if (browseTimeoutRef.current) clearTimeout(browseTimeoutRef.current)
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await ch.track({ userId: myUserId, displayName: myDisplayName, isHost: false, joinedAt: Date.now() })
        }
      })

    channelRef.current = ch
    return () => { ch.unsubscribe() }
  }, [code, joined, myUserId, myDisplayName])

  // Polling fallback — ensures live track/queue updates even if Realtime postgres_changes
  // doesn't fire (e.g. Realtime not enabled on the table, or connection hiccup).
  useEffect(() => {
    if (!code || !joined) return
    const id = setInterval(async () => {
      const { data } = await supabase.from('broadcast_sessions').select('*').eq('code', code).single()
      if (data) setSession(rowToSession(data as Record<string, unknown>))
    }, 5000)
    return () => clearInterval(id)
  }, [code, joined])

  // Auto-scroll queue to current track on initial load or track change
  useEffect(() => {
    if (!joined || !session?.currentIndex) return
    const el = currentTrackRowRef.current
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [joined, session?.currentIndex])

  const handleJoin = (name: string) => {
    try {
      localStorage.setItem('broadcastDisplayName', name)
      localStorage.setItem('broadcastUserId', myUserId)
    } catch {}
    setMyDisplayName(name)
    setShowNameModal(false)
    setJoined(true)
  }

  const handleVote = useCallback((trackUri: string, vote: 'up' | 'down') => {
    setSession(prev => {
      if (!prev) return prev
      return {
        ...prev,
        queue: prev.queue.map(t => {
          if (t.uri !== trackUri) return t
          const wasUp = t.votes.up.includes(myUserId)
          const wasDown = t.votes.down.includes(myUserId)
          let up = t.votes.up.filter(id => id !== myUserId)
          let down = t.votes.down.filter(id => id !== myUserId)
          if (vote === 'up' && !wasUp) up = [...up, myUserId]
          if (vote === 'down' && !wasDown) down = [...down, myUserId]
          return { ...t, votes: { up, down } }
        }),
      }
    })
    const cmd: BroadcastCommand = { type: 'vote', trackUri, vote, userId: myUserId, displayName: myDisplayName }
    channelRef.current?.send({ type: 'broadcast', event: 'command', payload: cmd })
  }, [myUserId, myDisplayName])

  const handleAddTrack = useCallback((track: BroadcastTrack) => {
    const cmd: BroadcastCommand = { type: 'add-track', track, addedBy: myDisplayName, userId: myUserId }
    channelRef.current?.send({ type: 'broadcast', event: 'command', payload: cmd })
  }, [myUserId, myDisplayName])

  const handlePlayNext = useCallback((track: BroadcastTrack) => {
    const cmd: BroadcastCommand = { type: 'play-next', track, addedBy: myDisplayName, userId: myUserId }
    channelRef.current?.send({ type: 'broadcast', event: 'command', payload: cmd })
  }, [myUserId, myDisplayName])

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setSearchArtists([])
      setSearchAlbums([])
      setBrowseResults(null)
      setSearching(false)
      return
    }
    setSearching(true)
    setSearchResults([])
    setSearchArtists([])
    setSearchAlbums([])
    setBrowseResults(null)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    const requestId = Math.random().toString(36).slice(2)
    const cmd: BroadcastCommand = { type: 'search-request', query: query.trim(), requestId, userId: myUserId }
    channelRef.current?.send({ type: 'broadcast', event: 'command', payload: cmd })
    searchTimeoutRef.current = setTimeout(() => setSearching(false), 10000)
  }, [myUserId])

  const handleBrowseArtist = useCallback((artist: BroadcastArtist) => {
    setBrowsing(true)
    setBrowseResults(null)
    if (browseTimeoutRef.current) clearTimeout(browseTimeoutRef.current)
    const requestId = Math.random().toString(36).slice(2)
    const cmd: BroadcastCommand = { type: 'browse-artist', artistRatingKey: artist.ratingKey, requestId, userId: myUserId }
    channelRef.current?.send({ type: 'broadcast', event: 'command', payload: cmd })
    browseTimeoutRef.current = setTimeout(() => setBrowsing(false), 10000)
  }, [myUserId])

  const handleBrowseAlbum = useCallback((album: BroadcastAlbum) => {
    setBrowsing(true)
    setBrowseResults(null)
    if (browseTimeoutRef.current) clearTimeout(browseTimeoutRef.current)
    const requestId = Math.random().toString(36).slice(2)
    const cmd: BroadcastCommand = { type: 'browse-album', albumRatingKey: album.ratingKey, requestId, userId: myUserId }
    channelRef.current?.send({ type: 'broadcast', event: 'command', payload: cmd })
    browseTimeoutRef.current = setTimeout(() => setBrowsing(false), 10000)
  }, [myUserId])

  // ── Render ────────────────────────────────────────────────────────────────────

  const pageStyle = {
    minHeight: '100vh', background: '#0a0a0a', color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
  }

  if (!code) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Invalid broadcast URL.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading broadcast…</div>
      </div>
    )
  }

  if (error || !session || isSessionEnded(session)) {
    const sessionName = session ? (session.name || `${session.hostName}'s Broadcast`) : null
    const lastTrack = session?.currentTrack
    return (
      <div style={{ ...pageStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20, textAlign: 'center' }}>
        {artUrl ? (
          <img src={artUrl} alt="" style={{ width: 96, height: 96, borderRadius: 12, objectFit: 'cover', opacity: 0.3, filter: 'grayscale(40%)' }} />
        ) : (
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
              <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
            </svg>
          </div>
        )}
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20, padding: '4px 12px', marginBottom: 16,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Broadcast Ended
            </span>
          </div>
          {sessionName && <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>{sessionName}</h2>}
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            {sessionName ? 'This broadcast has ended.' : 'This broadcast link is no longer active.'}
          </p>
          {lastTrack && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 12 }}>
              Last played: {lastTrack.title} · {lastTrack.artist}
            </p>
          )}
        </div>
        <a href="https://fibertuner.com" style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textDecoration: 'none', marginTop: 8 }}>
          fibertuner.com
        </a>
      </div>
    )
  }

  if (showNameModal) {
    return <JoinScreen session={session} artUrl={artUrl} onJoin={handleJoin} />
  }

  return (
    <div style={pageStyle}>
      {showBanner && <AppBanner onDismiss={() => setShowBanner(false)} />}

      <header style={{
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: session.state === 'playing' ? '#4ade80' : 'rgba(255,255,255,0.25)',
            boxShadow: session.state === 'playing' ? '0 0 6px #4ade80' : 'none',
          }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
            {session.name || `${session.hostName}'s Broadcast`}
          </span>
        </div>
        <span style={{
          fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.06)',
          padding: '3px 8px', borderRadius: 6,
        }}>{code}</span>
      </header>

      <div style={{
        padding: '10px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.02)',
        fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6,
      }}>
        <strong style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{session.hostName}</strong>
        {' '}is broadcasting their Plex queue live on Fibertuner — add tracks and vote on what's next.
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px' }}>

        {/* Now Playing */}
        <section style={{ paddingTop: 24, paddingBottom: 20 }}>
          {(() => {
            const displayArt = artUrl || session.currentTrack?.artUrl
            return (
              <div style={{
                width: '100%', aspectRatio: '1', borderRadius: 12, overflow: 'hidden',
                background: 'rgba(255,255,255,0.06)', marginBottom: 20,
                boxShadow: displayArt ? '0 20px 60px rgba(0,0,0,0.6)' : 'none',
              }}>
                {displayArt ? (
                  <img src={displayArt} alt={session.currentTrack?.album ?? ''}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%' }} />
                )}
              </div>
            )
          })()}

          {session.currentTrack ? (
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, lineHeight: 1.2 }}>{session.currentTrack.title}</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{session.currentTrack.artist}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{session.currentTrack.album}</p>
            </div>
          ) : (
            <h1 style={{ fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>
              {session.state === 'stopped' ? 'Nothing playing' : 'Loading…'}
            </h1>
          )}

          <ProgressBar session={session} />
        </section>

        {/* Participants */}
        {participants.length > 0 && (
          <section style={{ paddingBottom: 20 }}>
            <ParticipantsStrip participants={participants} hostUserId={session.hostUserId} />
          </section>
        )}

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {(['queue', 'search'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '10px 0',
                background: 'none', border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--accent, #a78bfa)' : '2px solid transparent',
                color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'color 0.15s', marginBottom: -1,
              }}
            >
              {tab === 'queue' ? 'Queue' : 'Search'}
            </button>
          ))}
        </div>

        {/* Queue tab */}
        {activeTab === 'queue' && (
          <section style={{ paddingBottom: 'max(40px, env(safe-area-inset-bottom, 0px))' }}>
            {session.queue.length === 0 ? (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '32px 0' }}>
                Queue is empty — search for tracks to add!
              </p>
            ) : (
              session.queue.map((track, i) => (
                <QueueRow
                  key={`${track.uri}-${i}`}
                  track={track}
                  isCurrentTrack={i === session.currentIndex}
                  myUserId={myUserId}
                  onVote={handleVote}
                  rowRef={i === session.currentIndex ? currentTrackRowRef : undefined}
                />
              ))
            )}
          </section>
        )}

        {/* Search tab */}
        {activeTab === 'search' && (
          <section style={{ paddingBottom: 'max(40px, env(safe-area-inset-bottom, 0px))' }}>
            <SearchSection
              onAddTrack={handleAddTrack}
              onPlayNext={handlePlayNext}
              onSearch={handleSearch}
              onBrowseArtist={handleBrowseArtist}
              onBrowseAlbum={handleBrowseAlbum}
              searchResults={searchResults}
              searchArtists={searchArtists}
              searchAlbums={searchAlbums}
              browseResults={browseResults}
              searching={searching}
              browsing={browsing}
              myDisplayName={myDisplayName}
              queue={session.queue}
            />
          </section>
        )}

      </div>
    </div>
  )
}
