import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchAlbumArt } from '../lib/albumArt'
import type {
  BroadcastSession,
  BroadcastTrack,
  BroadcastArtist,
  BroadcastAlbum,
  BroadcastPlaylist,
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

// ── Shared styles ─────────────────────────────────────────────────────────────

const ACCENT = '#e5a00d'
const BG = '#0d0d0d'
const SURFACE = 'rgba(255,255,255,0.05)'
const BORDER = 'rgba(255,255,255,0.08)'
const TEXT_PRIMARY = '#ffffff'
const TEXT_SECONDARY = 'rgba(255,255,255,0.5)'
const TEXT_MUTED = 'rgba(255,255,255,0.28)'
const FONT = '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif'

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
      minHeight: '100vh', background: BG, color: TEXT_PRIMARY,
      fontFamily: FONT,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Blurred art header */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1', maxHeight: 260, overflow: 'hidden', flexShrink: 0 }}>
        {artUrl ? (
          <>
            <img src={artUrl} alt="" style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', filter: 'blur(28px) saturate(120%) brightness(0.35)',
              transform: 'scale(1.1)',
            }} />
            <img src={artUrl} alt={session.currentTrack?.album ?? ''} style={{
              position: 'relative', zIndex: 1,
              display: 'block', margin: '0 auto',
              height: '100%', width: 'auto', maxWidth: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.7))',
            }} />
          </>
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, rgba(229,160,13,0.1) 0%, rgba(0,0,0,0) 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5">
              <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
            </svg>
          </div>
        )}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, zIndex: 2,
          background: `linear-gradient(to bottom, transparent, ${BG})`,
        }} />
      </div>

      <div style={{ flex: 1, maxWidth: 480, width: '100%', margin: '0 auto', padding: '0 20px', paddingBottom: 'max(40px, env(safe-area-inset-bottom, 0px))', boxSizing: 'border-box' }}>

        {/* LIVE badge + host */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, marginTop: 4 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(229,160,13,0.12)', border: `1px solid rgba(229,160,13,0.3)`,
            borderRadius: 20, padding: '3px 9px',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: ACCENT,
              boxShadow: `0 0 6px ${ACCENT}`,
              animation: 'livePulse 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: ACCENT, letterSpacing: '0.08em' }}>LIVE</span>
          </div>
          <span style={{ fontSize: 10, color: TEXT_MUTED, letterSpacing: '0.04em' }}>
            hosted by <strong style={{ color: TEXT_SECONDARY, fontWeight: 600 }}>{session.hostName}</strong>
          </span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>{sessionTitle}</h1>

        {session.currentTrack && (
          <div style={{
            background: SURFACE, border: `1px solid ${BORDER}`,
            borderRadius: 12, padding: '12px 14px', marginBottom: 12,
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: TEXT_MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Now Playing
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {artUrl && <img src={artUrl} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {session.currentTrack.title}
                </div>
                <div style={{ fontSize: 12, color: TEXT_SECONDARY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {session.currentTrack.artist}
                  {session.currentTrack.album ? ` · ${session.currentTrack.album}` : ''}
                </div>
              </div>
            </div>
          </div>
        )}

        {upNext.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.06)`,
            borderRadius: 12, padding: '12px 14px', marginBottom: 20,
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: TEXT_MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
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
                    <div style={{ fontSize: 11, color: TEXT_MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.artist}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_SECONDARY, marginBottom: 10 }}>
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
            background: 'rgba(255,255,255,0.07)', border: `1px solid ${BORDER}`,
            borderRadius: 10, color: TEXT_PRIMARY, fontSize: 16, outline: 'none',
            fontFamily: FONT, marginBottom: 12, boxSizing: 'border-box',
            WebkitAppearance: 'none',
          }}
        />
        <button
          onClick={() => { if (name.trim()) onJoin(name.trim()) }}
          disabled={!name.trim()}
          style={{
            width: '100%', padding: '14px 0',
            background: name.trim() ? ACCENT : 'rgba(255,255,255,0.08)',
            color: name.trim() ? '#000' : TEXT_MUTED,
            borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700,
            cursor: name.trim() ? 'pointer' : 'default', fontFamily: FONT,
            transition: 'background 0.2s',
          }}
        >
          Join Broadcast
        </button>

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <button
            onClick={() => { window.location.href = `fibertuner://broadcast/${session.code}` }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: TEXT_MUTED, fontFamily: FONT,
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

// ── Progress bar ───────────────────────────────────────────────────────────────

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
    <div style={{ marginTop: 12 }}>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${pct}%`, background: ACCENT,
          borderRadius: 2, transition: 'width 0.1s linear',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        <span style={{ fontSize: 11, color: TEXT_MUTED }}>{formatTime(displaySec)}</span>
        <span style={{ fontSize: 11, color: TEXT_MUTED }}>{formatDuration(session.currentTrack?.durationMs ?? 0)}</span>
      </div>
    </div>
  )
}

// ── Participants strip ─────────────────────────────────────────────────────────

function ParticipantsStrip({ participants, hostUserId }: { participants: BroadcastParticipant[]; hostUserId: string }) {
  if (!participants.length) return null
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none', marginBottom: 16 }}>
      {participants.map(p => (
        <div key={p.userId} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: SURFACE, borderRadius: 20,
          padding: '4px 9px', flexShrink: 0, fontSize: 11,
          border: p.userId === hostUserId ? `1px solid rgba(229,160,13,0.35)` : `1px solid ${BORDER}`,
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: p.userId === hostUserId ? `rgba(229,160,13,0.2)` : 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, fontWeight: 700, color: p.userId === hostUserId ? ACCENT : TEXT_SECONDARY,
          }}>
            {getInitials(p.displayName)}
          </div>
          <span style={{ color: TEXT_SECONDARY }}>{p.displayName}</span>
          {p.isHost && (
            <span style={{ fontSize: 9, fontWeight: 700, color: ACCENT, letterSpacing: '0.04em', textTransform: 'uppercase' }}>HOST</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Vote buttons (reusable) ────────────────────────────────────────────────────

function VoteButtons({
  track, myUserId, onVote, compact = false,
}: {
  track: BroadcastTrack
  myUserId: string
  onVote: (uri: string, vote: 'up' | 'down') => void
  compact?: boolean
}) {
  const myUp = track.votes.up.includes(myUserId)
  const myDown = track.votes.down.includes(myUserId)
  const net = track.votes.up.length - track.votes.down.length

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <button
          onClick={e => { e.stopPropagation(); onVote(track.uri, 'up') }}
          style={{
            background: myUp ? `rgba(229,160,13,0.2)` : 'transparent',
            border: 'none',
            color: myUp ? ACCENT : TEXT_MUTED,
            borderRadius: 6, padding: '6px 8px', fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', minWidth: 36, justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >👍</button>
        <span style={{ fontSize: 12, fontWeight: 600, color: net > 0 ? ACCENT : net < 0 ? '#f87171' : TEXT_MUTED, minWidth: 16, textAlign: 'center' }}>
          {net > 0 ? `+${net}` : net !== 0 ? net : '·'}
        </span>
        <button
          onClick={e => { e.stopPropagation(); onVote(track.uri, 'down') }}
          style={{
            background: myDown ? 'rgba(248,113,113,0.15)' : 'transparent',
            border: 'none',
            color: myDown ? '#f87171' : TEXT_MUTED,
            borderRadius: 6, padding: '6px 8px', fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', minWidth: 36, justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >👎</button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', marginTop: 20 }}>
      <button
        onClick={() => onVote(track.uri, 'up')}
        style={{
          background: myUp ? `rgba(229,160,13,0.15)` : SURFACE,
          border: myUp ? `1px solid rgba(229,160,13,0.4)` : `1px solid ${BORDER}`,
          color: myUp ? ACCENT : TEXT_SECONDARY,
          borderRadius: 12, padding: '12px 28px', fontSize: 20, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, minHeight: 48,
          transition: 'all 0.2s', fontFamily: FONT,
        }}
      >
        👍 <span style={{ fontSize: 15, fontWeight: 700 }}>{track.votes.up.length}</span>
      </button>
      <button
        onClick={() => onVote(track.uri, 'down')}
        style={{
          background: myDown ? 'rgba(248,113,113,0.12)' : SURFACE,
          border: myDown ? '1px solid rgba(248,113,113,0.35)' : `1px solid ${BORDER}`,
          color: myDown ? '#f87171' : TEXT_SECONDARY,
          borderRadius: 12, padding: '12px 28px', fontSize: 20, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, minHeight: 48,
          transition: 'all 0.2s', fontFamily: FONT,
        }}
      >
        👎 <span style={{ fontSize: 15, fontWeight: 700 }}>{track.votes.down.length}</span>
      </button>
    </div>
  )
}

// ── Queue row ─────────────────────────────────────────────────────────────────

function QueueRow({
  track, isCurrentTrack, myUserId, onVote,
}: {
  track: BroadcastTrack
  isCurrentTrack: boolean
  myUserId: string
  onVote: (uri: string, vote: 'up' | 'down') => void
}) {
  return (
    <div style={{
      height: 64, display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: `1px solid ${BORDER}`,
      paddingLeft: isCurrentTrack ? 8 : 0,
      borderLeft: isCurrentTrack ? `2px solid ${ACCENT}` : '2px solid transparent',
      background: isCurrentTrack ? `rgba(229,160,13,0.04)` : 'transparent',
      transition: 'background 0.2s',
    }}>
      {/* Album art thumbnail */}
      {track.artUrl ? (
        <img src={track.artUrl} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <div style={{ width: 44, height: 44, borderRadius: 6, background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />
      )}

      {/* Track info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600,
          color: isCurrentTrack ? ACCENT : TEXT_PRIMARY,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{track.title}</div>
        <div style={{
          fontSize: 11, color: TEXT_SECONDARY,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {track.artist}
          {track.addedBy ? ` · via ${track.addedBy}` : ''}
        </div>
      </div>

      {/* Compact vote controls */}
      <VoteButtons track={track} myUserId={myUserId} onVote={onVote} compact />
    </div>
  )
}

// ── Search overlay ────────────────────────────────────────────────────────────

type DrillView =
  | { kind: 'results' }
  | { kind: 'artist-albums'; artist: BroadcastArtist; albums: BroadcastAlbum[] }
  | { kind: 'album-tracks'; album: BroadcastAlbum; tracks: BroadcastTrack[] }
  | { kind: 'playlist-tracks'; playlist: BroadcastPlaylist; tracks: BroadcastTrack[] }

function SearchOverlay({
  onClose,
  onAddTrack,
  onPlayNext,
  onSearch,
  onBrowseArtist,
  onBrowseAlbum,
  onBrowsePlaylist,
  searchResults,
  searchArtists,
  searchAlbums,
  searchPlaylists,
  browseResults,
  searching,
  browsing,
  myDisplayName,
  queue,
}: {
  onClose: () => void
  onAddTrack: (track: BroadcastTrack) => void
  onPlayNext: (track: BroadcastTrack) => void
  onSearch: (query: string) => void
  onBrowseArtist: (artist: BroadcastArtist) => void
  onBrowseAlbum: (album: BroadcastAlbum) => void
  onBrowsePlaylist: (playlist: BroadcastPlaylist) => void
  searchResults: BroadcastTrack[]
  searchArtists: BroadcastArtist[]
  searchAlbums: BroadcastAlbum[]
  searchPlaylists: BroadcastPlaylist[]
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
  const [pendingPlaylist, setPendingPlaylist] = useState<BroadcastPlaylist | null>(null)
  const [confirmTrack, setConfirmTrack] = useState<BroadcastTrack | null>(null)
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set())
  const [recentlyQueued, setRecentlyQueued] = useState<Set<string>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

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
    } else if (browseResults.kind === 'tracks' && pendingPlaylist) {
      setDrillHistory(h => [...h, drillView])
      setDrillView({ kind: 'playlist-tracks', playlist: pendingPlaylist, tracks: browseResults.tracks })
      setPendingPlaylist(null)
    }
  }, [browseResults]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    setDrillView({ kind: 'results' })
    setDrillHistory([])
    setPendingArtist(null)
    setPendingAlbum(null)
    setPendingPlaylist(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onSearch(q), 350)
  }

  const handleClear = () => {
    setQuery('')
    setDrillView({ kind: 'results' })
    setDrillHistory([])
    setPendingArtist(null)
    setPendingAlbum(null)
    setPendingPlaylist(null)
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
    setPendingPlaylist(null)
    onBrowseAlbum(album)
  }

  const handlePlaylistClick = (playlist: BroadcastPlaylist) => {
    setPendingPlaylist(playlist)
    setPendingArtist(null)
    setPendingAlbum(null)
    onBrowsePlaylist(playlist)
  }

  const goBack = () => {
    setPendingArtist(null)
    setPendingAlbum(null)
    setPendingPlaylist(null)
    if (drillHistory.length > 0) {
      const prev = drillHistory[drillHistory.length - 1]
      setDrillHistory(h => h.slice(0, -1))
      setDrillView(prev)
    } else {
      setDrillView({ kind: 'results' })
    }
  }

  const hasResults = searchArtists.length > 0 || searchAlbums.length > 0 || searchPlaylists.length > 0 || searchResults.length > 0
  const tracksToShow = drillView.kind === 'album-tracks' ? drillView.tracks
    : drillView.kind === 'results' ? searchResults : []

  const sectionLabel = (label: string) => (
    <div style={{
      fontSize: 10, fontWeight: 700, color: TEXT_MUTED, letterSpacing: '0.1em',
      textTransform: 'uppercase', padding: '14px 0 6px',
    }}>{label}</div>
  )

  const drillHeader = () => {
    if (drillView.kind === 'artist-albums') return drillView.artist.title
    if (drillView.kind === 'album-tracks') return `${drillView.album.title} · ${drillView.album.artistName}`
    if (drillView.kind === 'playlist-tracks') return drillView.playlist.title
    return null
  }

  const trackActionRow = (r: BroadcastTrack, i: number, totalCount: number) => {
    const queued = recentlyQueued.has(r.uri)
    const nexted = recentlyAdded.has(r.uri)
    return (
      <div
        key={`${r.uri}-${i}`}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 0',
          borderBottom: i < totalCount - 1 ? `1px solid ${BORDER}` : 'none',
        }}
      >
        {r.artUrl ? (
          <img src={r.artUrl} alt="" style={{ width: 38, height: 38, borderRadius: 5, objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 38, height: 38, borderRadius: 5, background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: TEXT_PRIMARY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
          <div style={{ fontSize: 11, color: TEXT_SECONDARY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.artist}{r.album ? ` · ${r.album}` : ''}</div>
        </div>
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          <button
            onClick={() => handlePlayNext(r)}
            style={{
              padding: '6px 10px',
              background: nexted ? 'rgba(134,239,172,0.12)' : `rgba(229,160,13,0.12)`,
              border: nexted ? '1px solid rgba(134,239,172,0.3)' : `1px solid rgba(229,160,13,0.25)`,
              borderRadius: 7,
              color: nexted ? '#86efac' : ACCENT,
              cursor: 'pointer', fontSize: 11, fontWeight: 600,
              fontFamily: FONT, whiteSpace: 'nowrap', transition: 'all 0.2s',
            }}
          >{nexted ? '✓ Next' : '▶ Next'}</button>
          <button
            onClick={() => handleAdd(r)}
            style={{
              padding: '6px 10px',
              background: queued ? 'rgba(134,239,172,0.12)' : SURFACE,
              border: queued ? '1px solid rgba(134,239,172,0.3)' : `1px solid ${BORDER}`,
              borderRadius: 7,
              color: queued ? '#86efac' : TEXT_SECONDARY,
              cursor: 'pointer', fontSize: 11, fontWeight: 600,
              fontFamily: FONT, whiteSpace: 'nowrap', transition: 'all 0.2s',
            }}
          >{queued ? '✓ Added' : '+ Queue'}</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: BG,
      display: 'flex', flexDirection: 'column',
      fontFamily: FONT, overflowX: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 16px 12px',
        borderBottom: `1px solid ${BORDER}`,
        flexShrink: 0,
      }}>
        <button
          onClick={drillView.kind !== 'results' ? goBack : onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: TEXT_SECONDARY, fontSize: 22, padding: '0 4px',
            display: 'flex', alignItems: 'center', lineHeight: 1,
            minWidth: 32,
          }}
          aria-label="Back"
        >‹</button>

        {drillView.kind !== 'results' ? (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEXT_PRIMARY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {drillHeader()}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEXT_MUTED} strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={handleInput}
              placeholder="Artists, albums, tracks…"
              style={{
                width: '100%', padding: '10px 36px 10px 36px',
                background: 'rgba(255,255,255,0.07)', border: `1px solid ${BORDER}`,
                borderRadius: 22, color: TEXT_PRIMARY, fontSize: 15, outline: 'none',
                fontFamily: FONT, boxSizing: 'border-box', WebkitAppearance: 'none',
              }}
            />
            {(searching || browsing) && (
              <span style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 11, color: TEXT_MUTED, pointerEvents: 'none',
              }}>{searching ? '…' : '…'}</span>
            )}
            {query && !searching && !browsing && (
              <button
                onClick={handleClear}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                  width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: TEXT_SECONDARY, fontSize: 13, lineHeight: 1, padding: 0,
                }}
              >×</button>
            )}
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px', paddingBottom: 'max(32px, env(safe-area-inset-bottom, 0px))' }}>

        {/* Empty / no query state */}
        {drillView.kind === 'results' && !query && (
          <div style={{ textAlign: 'center', paddingTop: 48, color: TEXT_MUTED, fontSize: 13 }}>
            Type to search your host's library
          </div>
        )}

        {/* Searching spinner text */}
        {drillView.kind === 'results' && query && searching && (
          <div style={{ textAlign: 'center', paddingTop: 32, color: TEXT_MUTED, fontSize: 13 }}>
            Searching…
          </div>
        )}

        {/* No results */}
        {drillView.kind === 'results' && query && !searching && !browsing && !hasResults && (
          <div style={{ textAlign: 'center', paddingTop: 32, color: TEXT_MUTED, fontSize: 13 }}>
            No results for <strong style={{ color: TEXT_SECONDARY }}>"{query}"</strong>
          </div>
        )}

        {/* Top-level results */}
        {drillView.kind === 'results' && hasResults && (
          <div>
            {searchArtists.length > 0 && (
              <>
                {sectionLabel('Artists')}
                <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                  {searchArtists.map((artist, i) => (
                    <div
                      key={artist.ratingKey}
                      onClick={() => handleArtistClick(artist)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', background: SURFACE,
                        borderBottom: i < searchArtists.length - 1 ? `1px solid ${BORDER}` : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {artist.artUrl ? (
                        <img src={artist.artUrl} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 500, color: TEXT_PRIMARY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {artist.title}
                      </div>
                      <span style={{ color: TEXT_MUTED, fontSize: 16 }}>›</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {searchAlbums.length > 0 && (
              <>
                {sectionLabel('Albums')}
                <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                  {searchAlbums.map((album, i) => (
                    <div
                      key={album.ratingKey}
                      onClick={() => handleAlbumClick(album)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', background: SURFACE,
                        borderBottom: i < searchAlbums.length - 1 ? `1px solid ${BORDER}` : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {album.artUrl ? (
                        <img src={album.artUrl} alt="" style={{ width: 36, height: 36, borderRadius: 5, objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: 5, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: TEXT_PRIMARY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{album.title}</div>
                        <div style={{ fontSize: 11, color: TEXT_SECONDARY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{album.artistName}</div>
                      </div>
                      <span style={{ color: TEXT_MUTED, fontSize: 16 }}>›</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {searchPlaylists.length > 0 && (
              <>
                {sectionLabel('Playlists')}
                <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                  {searchPlaylists.map((playlist, i) => (
                    <div
                      key={playlist.ratingKey}
                      onClick={() => handlePlaylistClick(playlist)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', background: SURFACE,
                        borderBottom: i < searchPlaylists.length - 1 ? `1px solid ${BORDER}` : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {playlist.artUrl ? (
                        <img src={playlist.artUrl} alt="" style={{ width: 36, height: 36, borderRadius: 5, objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{
                          width: 36, height: 36, borderRadius: 5, background: 'rgba(255,255,255,0.08)',
                          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEXT_MUTED} strokeWidth="2">
                            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                          </svg>
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: TEXT_PRIMARY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{playlist.title}</div>
                        <div style={{ fontSize: 11, color: TEXT_SECONDARY }}>{playlist.trackCount} {playlist.trackCount === 1 ? 'track' : 'tracks'}</div>
                      </div>
                      <span style={{ color: TEXT_MUTED, fontSize: 16 }}>›</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tracksToShow.length > 0 && (
              <>
                {(searchArtists.length > 0 || searchAlbums.length > 0 || searchPlaylists.length > 0) && sectionLabel('Tracks')}
                {tracksToShow.map((r, i) => trackActionRow(r, i, tracksToShow.length))}
              </>
            )}
          </div>
        )}

        {/* Artist albums drill-down */}
        {drillView.kind === 'artist-albums' && (
          <div>
            {browsing && <div style={{ textAlign: 'center', paddingTop: 32, color: TEXT_MUTED, fontSize: 13 }}>Loading albums…</div>}
            {!browsing && drillView.albums.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: 32, color: TEXT_MUTED, fontSize: 13 }}>No albums found</div>
            )}
            {!browsing && drillView.albums.length > 0 && (
              <div style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                {drillView.albums.map((album, i) => (
                  <div
                    key={album.ratingKey}
                    onClick={() => handleAlbumClick(album)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', background: SURFACE,
                      borderBottom: i < drillView.albums.length - 1 ? `1px solid ${BORDER}` : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {album.artUrl ? (
                      <img src={album.artUrl} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: 6, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{album.title}</div>
                      <div style={{ fontSize: 11, color: TEXT_SECONDARY }}>{album.year ?? ''}</div>
                    </div>
                    <span style={{ color: TEXT_MUTED, fontSize: 16 }}>›</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Album tracks drill-down */}
        {drillView.kind === 'album-tracks' && (
          <div style={{ marginTop: 4 }}>
            {browsing && <div style={{ textAlign: 'center', paddingTop: 32, color: TEXT_MUTED, fontSize: 13 }}>Loading tracks…</div>}
            {!browsing && drillView.tracks.map((r, i) => {
              const queued = recentlyQueued.has(r.uri)
              const nexted = recentlyAdded.has(r.uri)
              return (
                <div
                  key={`${r.uri}-${i}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 0',
                    borderBottom: i < drillView.tracks.length - 1 ? `1px solid ${BORDER}` : 'none',
                  }}
                >
                  <div style={{ width: 24, minWidth: 24, textAlign: 'right', fontSize: 11, color: TEXT_MUTED }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: TEXT_PRIMARY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                    {r.artist && <div style={{ fontSize: 11, color: TEXT_SECONDARY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.artist}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    <button onClick={() => handlePlayNext(r)} style={{
                      padding: '6px 10px',
                      background: nexted ? 'rgba(134,239,172,0.12)' : `rgba(229,160,13,0.12)`,
                      border: nexted ? '1px solid rgba(134,239,172,0.3)' : `1px solid rgba(229,160,13,0.25)`,
                      borderRadius: 7, color: nexted ? '#86efac' : ACCENT,
                      cursor: 'pointer', fontSize: 11, fontWeight: 600,
                      fontFamily: FONT, whiteSpace: 'nowrap', transition: 'all 0.2s',
                    }}>{nexted ? '✓ Next' : '▶ Next'}</button>
                    <button onClick={() => handleAdd(r)} style={{
                      padding: '6px 10px',
                      background: queued ? 'rgba(134,239,172,0.12)' : SURFACE,
                      border: queued ? '1px solid rgba(134,239,172,0.3)' : `1px solid ${BORDER}`,
                      borderRadius: 7, color: queued ? '#86efac' : TEXT_SECONDARY,
                      cursor: 'pointer', fontSize: 11, fontWeight: 600,
                      fontFamily: FONT, whiteSpace: 'nowrap', transition: 'all 0.2s',
                    }}>{queued ? '✓ Added' : '+ Queue'}</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Playlist tracks drill-down */}
        {drillView.kind === 'playlist-tracks' && (
          <div style={{ marginTop: 4 }}>
            {browsing && <div style={{ textAlign: 'center', paddingTop: 32, color: TEXT_MUTED, fontSize: 13 }}>Loading tracks…</div>}
            {!browsing && drillView.tracks.map((r, i) => {
              const queued = recentlyQueued.has(r.uri)
              const nexted = recentlyAdded.has(r.uri)
              return (
                <div
                  key={`${r.uri}-${i}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 0',
                    borderBottom: i < drillView.tracks.length - 1 ? `1px solid ${BORDER}` : 'none',
                  }}
                >
                  {r.artUrl ? (
                    <img src={r.artUrl} alt="" style={{ width: 38, height: 38, borderRadius: 5, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 38, height: 38, borderRadius: 5, background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: TEXT_PRIMARY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: TEXT_SECONDARY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.artist}{r.album ? ` · ${r.album}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    <button onClick={() => handlePlayNext(r)} style={{
                      padding: '6px 10px',
                      background: nexted ? 'rgba(134,239,172,0.12)' : `rgba(229,160,13,0.12)`,
                      border: nexted ? '1px solid rgba(134,239,172,0.3)' : `1px solid rgba(229,160,13,0.25)`,
                      borderRadius: 7, color: nexted ? '#86efac' : ACCENT,
                      cursor: 'pointer', fontSize: 11, fontWeight: 600,
                      fontFamily: FONT, whiteSpace: 'nowrap', transition: 'all 0.2s',
                    }}>{nexted ? '✓ Next' : '▶ Next'}</button>
                    <button onClick={() => handleAdd(r)} style={{
                      padding: '6px 10px',
                      background: queued ? 'rgba(134,239,172,0.12)' : SURFACE,
                      border: queued ? '1px solid rgba(134,239,172,0.3)' : `1px solid ${BORDER}`,
                      borderRadius: 7, color: queued ? '#86efac' : TEXT_SECONDARY,
                      cursor: 'pointer', fontSize: 11, fontWeight: 600,
                      fontFamily: FONT, whiteSpace: 'nowrap', transition: 'all 0.2s',
                    }}>{queued ? '✓ Added' : '+ Queue'}</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Duplicate confirm modal */}
      {confirmTrack && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div style={{
            background: '#1a1a1a', border: `1px solid ${BORDER}`,
            borderRadius: 16, padding: 24, maxWidth: 320, width: '100%',
          }}>
            <p style={{ fontSize: 14, marginBottom: 20, color: TEXT_SECONDARY, lineHeight: 1.6 }}>
              <strong style={{ color: TEXT_PRIMARY }}>{confirmTrack.title}</strong> is already in the queue. Add it again?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmTrack(null)} style={{
                flex: 1, padding: '12px 0', background: SURFACE,
                border: 'none', borderRadius: 9, color: TEXT_SECONDARY, cursor: 'pointer', fontFamily: FONT, fontSize: 13,
              }}>Cancel</button>
              <button onClick={() => {
                onAddTrack({ ...confirmTrack, addedBy: myDisplayName, votes: { up: [], down: [] } })
                flashAdded(confirmTrack.uri, setRecentlyQueued)
                setConfirmTrack(null)
              }} style={{
                flex: 1, padding: '12px 0', background: ACCENT,
                border: 'none', borderRadius: 9, color: '#000', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 700,
              }}>Add Anyway</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main BroadcastPage ────────────────────────────────────────────────────────

export default function BroadcastPage() {
  const code = extractCode()

  // Bug 1 fix: prevent horizontal scroll on mobile
  useEffect(() => {
    document.body.style.overflowX = 'hidden'
    document.documentElement.style.overflowX = 'hidden'
    return () => {
      document.body.style.overflowX = ''
      document.documentElement.style.overflowX = ''
    }
  }, [])

  const [session, setSession] = useState<BroadcastSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [participants, setParticipants] = useState<BroadcastParticipant[]>([])
  const [joined, setJoined] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [artUrl, setArtUrl] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<BroadcastTrack[]>([])
  const [searchArtists, setSearchArtists] = useState<BroadcastArtist[]>([])
  const [searchAlbums, setSearchAlbums] = useState<BroadcastAlbum[]>([])
  const [searchPlaylists, setSearchPlaylists] = useState<BroadcastPlaylist[]>([])
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
  // Track whether the channel is in SUBSCRIBED state — send() silently drops
  // messages on non-SUBSCRIBED channels, so we must guard all sends.
  const channelSubscribedRef = useRef(false)
  // Queue of commands waiting to be sent once the channel is SUBSCRIBED
  const pendingSendQueue = useRef<BroadcastCommand[]>([])
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSearchQueryRef = useRef<string>('')
  const browseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deepLinkAttempted = useRef(false)

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

  // Presence + broadcast channel — only set channelRef.current AFTER SUBSCRIBED.
  // This prevents send() calls from being silently dropped on a not-yet-ready channel.
  useEffect(() => {
    if (!code || !joined) return

    channelSubscribedRef.current = false

    const ch = supabase
      .channel(`broadcast:${code}`)
      .on('presence', { event: 'sync' }, () => {
        const state = ch.presenceState() as Record<string, Array<{ userId: string; displayName: string; isHost: boolean; joinedAt: number }>>
        setParticipants(Object.values(state).flat())
      })
      .on('broadcast', { event: 'command' }, ({ payload }: { payload: BroadcastCommand }) => {
        if (payload.type === 'search-results') {
          setSearchResults(payload.results)
          setSearchArtists((payload as any).artists ?? [])
          setSearchAlbums((payload as any).albums ?? [])
          setSearchPlaylists((payload as any).playlists ?? [])
          setBrowseResults(null)
          setSearching(false)
          lastSearchQueryRef.current = ''
          if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
          if (searchRetryRef.current) clearTimeout(searchRetryRef.current)
        }
        if (payload.type === 'browse-results') {
          setBrowseResults({ kind: payload.kind, albums: payload.albums, tracks: payload.tracks })
          setBrowsing(false)
          if (browseTimeoutRef.current) clearTimeout(browseTimeoutRef.current)
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Only now is the channel ready to send — store ref and mark subscribed
          channelRef.current = ch
          channelSubscribedRef.current = true
          ch.track({ userId: myUserId, displayName: myDisplayName, isHost: false, joinedAt: Date.now() }).catch(() => {})
          // Flush any commands that arrived before the channel was ready
          const queued = pendingSendQueue.current.splice(0)
          for (const payload of queued) {
            ch.send({ type: 'broadcast', event: 'command', payload }).catch(() => {})
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          channelSubscribedRef.current = false
        }
      })

    return () => {
      channelSubscribedRef.current = false
      channelRef.current = null
      ch.unsubscribe()
    }
  }, [code, joined, myUserId, myDisplayName])

  // Polling fallback for track/queue state
  useEffect(() => {
    if (!code || !joined) return
    const id = setInterval(async () => {
      const { data } = await supabase.from('broadcast_sessions').select('*').eq('code', code).single()
      if (data) setSession(rowToSession(data as Record<string, unknown>))
    }, 5000)
    return () => clearInterval(id)
  }, [code, joined])

  const handleJoin = (name: string) => {
    try {
      localStorage.setItem('broadcastDisplayName', name)
      localStorage.setItem('broadcastUserId', myUserId)
    } catch {}
    setMyDisplayName(name)
    setShowNameModal(false)
    setJoined(true)
  }

  // Close search and reset all search state
  const closeSearch = useCallback(() => {
    setShowSearch(false)
    setSearchResults([])
    setSearchArtists([])
    setSearchAlbums([])
    setSearchPlaylists([])
    setBrowseResults(null)
    setSearching(false)
    setBrowsing(false)
    lastSearchQueryRef.current = ''
    if (searchRetryRef.current) clearTimeout(searchRetryRef.current)
  }, [])

  // Escape key closes search overlay
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeSearch])

  // Safe send — sends immediately when SUBSCRIBED; queues all commands
  // if the channel isn't ready yet so they're not silently dropped.
  const safeSend = useCallback((payload: BroadcastCommand) => {
    if (channelRef.current && channelSubscribedRef.current) {
      channelRef.current.send({ type: 'broadcast', event: 'command', payload }).catch(() => {})
    } else {
      // Queue the command — will be flushed once SUBSCRIBED fires.
      // This covers votes, search-requests, browse-requests and add/play-next
      // sent before the channel handshake completes.
      pendingSendQueue.current.push(payload)
    }
  }, [])

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
    safeSend({ type: 'vote', trackUri, vote, userId: myUserId, displayName: myDisplayName })
  }, [myUserId, myDisplayName, safeSend])

  const handleAddTrack = useCallback((track: BroadcastTrack) => {
    safeSend({ type: 'add-track', track, addedBy: myDisplayName, userId: myUserId })
  }, [myUserId, myDisplayName, safeSend])

  const handlePlayNext = useCallback((track: BroadcastTrack) => {
    safeSend({ type: 'play-next', track, addedBy: myDisplayName, userId: myUserId })
  }, [myUserId, myDisplayName, safeSend])

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setSearchArtists([])
      setSearchAlbums([])
      setSearchPlaylists([])
      setBrowseResults(null)
      setSearching(false)
      lastSearchQueryRef.current = ''
      if (searchRetryRef.current) clearTimeout(searchRetryRef.current)
      return
    }
    setSearching(true)
    setSearchResults([])
    setSearchArtists([])
    setSearchAlbums([])
    setSearchPlaylists([])
    setBrowseResults(null)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    if (searchRetryRef.current) clearTimeout(searchRetryRef.current)
    lastSearchQueryRef.current = query.trim()
    const requestId = Math.random().toString(36).slice(2)
    safeSend({ type: 'search-request', query: query.trim(), requestId, userId: myUserId })
    // Retry once after 3s in case the host channel wasn't ready on the first attempt
    searchRetryRef.current = setTimeout(() => {
      if (lastSearchQueryRef.current === query.trim()) {
        const retryId = Math.random().toString(36).slice(2)
        safeSend({ type: 'search-request', query: query.trim(), requestId: retryId, userId: myUserId })
      }
    }, 3000)
    searchTimeoutRef.current = setTimeout(() => setSearching(false), 12000)
  }, [myUserId, safeSend])

  const handleBrowseArtist = useCallback((artist: BroadcastArtist) => {
    setBrowsing(true)
    setBrowseResults(null)
    if (browseTimeoutRef.current) clearTimeout(browseTimeoutRef.current)
    const requestId = Math.random().toString(36).slice(2)
    safeSend({ type: 'browse-artist', artistRatingKey: artist.ratingKey, requestId, userId: myUserId })
    browseTimeoutRef.current = setTimeout(() => setBrowsing(false), 10000)
  }, [myUserId, safeSend])

  const handleBrowseAlbum = useCallback((album: BroadcastAlbum) => {
    setBrowsing(true)
    setBrowseResults(null)
    if (browseTimeoutRef.current) clearTimeout(browseTimeoutRef.current)
    const requestId = Math.random().toString(36).slice(2)
    safeSend({ type: 'browse-album', albumRatingKey: album.ratingKey, requestId, userId: myUserId })
    browseTimeoutRef.current = setTimeout(() => setBrowsing(false), 10000)
  }, [myUserId, safeSend])

  const handleBrowsePlaylist = useCallback((playlist: BroadcastPlaylist) => {
    setBrowsing(true)
    setBrowseResults(null)
    if (browseTimeoutRef.current) clearTimeout(browseTimeoutRef.current)
    const requestId = Math.random().toString(36).slice(2)
    safeSend({ type: 'browse-playlist', playlistRatingKey: playlist.ratingKey, requestId, userId: myUserId })
    browseTimeoutRef.current = setTimeout(() => setBrowsing(false), 10000)
  }, [myUserId, safeSend])

  // ── Render ─────────────────────────────────────────────────────────────────

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh', background: BG, color: TEXT_PRIMARY,
    fontFamily: FONT, position: 'relative', overflowX: 'hidden',
  }

  if (!code) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <p style={{ color: TEXT_MUTED, fontSize: 14 }}>Invalid broadcast URL.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: TEXT_MUTED, fontSize: 14 }}>Loading broadcast…</div>
      </div>
    )
  }

  if (error || !session || isSessionEnded(session)) {
    const sessionName = session ? (session.name || `${session.hostName}'s Broadcast`) : null
    const lastTrack = session?.currentTrack
    return (
      <div style={{ ...pageStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20, textAlign: 'center' }}>
        {artUrl ? (
          <img src={artUrl} alt="" style={{ width: 88, height: 88, borderRadius: 12, objectFit: 'cover', opacity: 0.25, filter: 'grayscale(40%)' }} />
        ) : (
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: SURFACE, border: `1px solid ${BORDER}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={TEXT_MUTED} strokeWidth="1.5">
              <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
            </svg>
          </div>
        )}
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: SURFACE, border: `1px solid ${BORDER}`,
            borderRadius: 20, padding: '4px 12px', marginBottom: 16,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: TEXT_MUTED }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: TEXT_MUTED, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Broadcast Ended
            </span>
          </div>
          {sessionName && <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>{sessionName}</h2>}
          <p style={{ fontSize: 14, color: TEXT_MUTED, margin: 0 }}>
            {sessionName ? 'This broadcast has ended.' : 'This broadcast link is no longer active.'}
          </p>
          {lastTrack && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)', marginTop: 12 }}>
              Last played: {lastTrack.title} · {lastTrack.artist}
            </p>
          )}
        </div>
        <a href="https://fibertuner.com" style={{ fontSize: 12, color: TEXT_MUTED, textDecoration: 'none', marginTop: 4 }}>
          fibertuner.com
        </a>
      </div>
    )
  }

  if (showNameModal) {
    return <JoinScreen session={session} artUrl={artUrl} onJoin={handleJoin} />
  }

  // Current and upcoming tracks
  const currentTrack = session.currentTrack
  const upcomingQueue = session.queue.slice(session.currentIndex + 1)

  const displayArt = artUrl || currentTrack?.artUrl

  return (
    <>
      {/* Global animation styles */}
      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html, body { background: ${BG}; overflow-x: hidden; max-width: 100%; }
      `}</style>

      {/* Search overlay (full-screen, above everything) */}
      {showSearch && (
        <SearchOverlay
          onClose={closeSearch}
          onAddTrack={handleAddTrack}
          onPlayNext={handlePlayNext}
          onSearch={handleSearch}
          onBrowseArtist={handleBrowseArtist}
          onBrowseAlbum={handleBrowseAlbum}
          onBrowsePlaylist={handleBrowsePlaylist}
          searchResults={searchResults}
          searchArtists={searchArtists}
          searchAlbums={searchAlbums}
          searchPlaylists={searchPlaylists}
          browseResults={browseResults}
          searching={searching}
          browsing={browsing}
          myDisplayName={myDisplayName}
          queue={session.queue}
        />
      )}

      {/* Main page */}
      <div style={pageStyle}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

          {/* ── Slim header ────────────────────────────────────────────────── */}
          <header style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px 12px',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: session.state === 'playing' ? ACCENT : 'rgba(255,255,255,0.2)',
                boxShadow: session.state === 'playing' ? `0 0 8px ${ACCENT}` : 'none',
                flexShrink: 0,
                animation: session.state === 'playing' ? 'livePulse 2s ease-in-out infinite' : 'none',
              }} />
              <span style={{
                fontSize: 13, fontWeight: 600, color: TEXT_SECONDARY,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {session.name || session.hostName}
              </span>
              {session.state === 'playing' && (
                <span style={{
                  fontSize: 9, fontWeight: 700, color: ACCENT,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: `rgba(229,160,13,0.12)`, border: `1px solid rgba(229,160,13,0.25)`,
                  borderRadius: 10, padding: '2px 7px', flexShrink: 0,
                }}>LIVE</span>
              )}
            </div>
            <span style={{
              fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.15em',
              color: TEXT_MUTED, background: SURFACE,
              padding: '3px 8px', borderRadius: 6, flexShrink: 0,
            }}>{code}</span>
          </header>

          {/* ── Album art ──────────────────────────────────────────────────── */}
          <div style={{ padding: '8px 24px 0', flexShrink: 0 }}>
            <div style={{
              width: '100%', aspectRatio: '1', borderRadius: 12, overflow: 'hidden',
              background: 'rgba(255,255,255,0.04)',
              boxShadow: displayArt ? '0 16px 48px rgba(0,0,0,0.7)' : 'none',
            }}>
              {displayArt ? (
                <img src={displayArt} alt={currentTrack?.album ?? ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1">
                    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* ── Track info + vote ──────────────────────────────────────────── */}
          <div style={{ padding: '16px 24px 0', flexShrink: 0 }}>
            {currentTrack ? (
              <>
                <h1 style={{
                  fontSize: 22, fontWeight: 700, lineHeight: 1.2, marginBottom: 4,
                  color: TEXT_PRIMARY,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {currentTrack.title}
                </h1>
                <p style={{
                  fontSize: 14, color: TEXT_SECONDARY, marginBottom: 2,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {currentTrack.artist}
                  {currentTrack.album ? <span style={{ color: TEXT_MUTED }}> · {currentTrack.album}</span> : null}
                </p>
              </>
            ) : (
              <h1 style={{ fontSize: 17, fontWeight: 600, color: TEXT_MUTED }}>
                {session.state === 'stopped' ? 'Nothing playing' : 'Loading…'}
              </h1>
            )}

            <ProgressBar session={session} />

            {/* Vote buttons for current track (if it's in the queue) */}
            {currentTrack && session.queue[session.currentIndex] && (
              <VoteButtons
                track={session.queue[session.currentIndex]}
                myUserId={myUserId}
                onVote={handleVote}
              />
            )}
          </div>

          {/* ── Participants ───────────────────────────────────────────────── */}
          {participants.length > 0 && (
            <div style={{ padding: '16px 20px 0' }}>
              <ParticipantsStrip participants={participants} hostUserId={session.hostUserId} />
            </div>
          )}

          {/* ── Search bar (tappable pill) ─────────────────────────────────── */}
          <div style={{ padding: '12px 20px 4px', flexShrink: 0 }}>
            <button
              onClick={() => setShowSearch(true)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,0.07)', border: `1px solid ${BORDER}`,
                borderRadius: 22, padding: '11px 18px',
                cursor: 'pointer', fontFamily: FONT,
                transition: 'background 0.2s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEXT_MUTED} strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <span style={{ fontSize: 14, color: TEXT_MUTED }}>Search to add a track…</span>
            </button>
          </div>

          {/* ── Queue ─────────────────────────────────────────────────────── */}
          <div style={{ flex: 1, padding: '16px 20px', paddingBottom: 'max(32px, env(safe-area-inset-bottom, 0px))' }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: TEXT_MUTED,
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8,
            }}>
              Up Next
            </div>

            {upcomingQueue.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '32px 0',
                color: TEXT_MUTED, fontSize: 13, lineHeight: 1.6,
              }}>
                Queue is empty —{' '}
                <button
                  onClick={() => setShowSearch(true)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: ACCENT, fontFamily: FONT, fontSize: 13, padding: 0,
                    textDecoration: 'underline', textUnderlineOffset: 3,
                  }}
                >
                  search for tracks
                </button>{' '}to add!
              </div>
            ) : (
              upcomingQueue.map((track, i) => (
                <QueueRow
                  key={`${track.uri}-${session.currentIndex + 1 + i}`}
                  track={track}
                  isCurrentTrack={false}
                  myUserId={myUserId}
                  onVote={handleVote}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
