import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchAlbumArt } from '../lib/albumArt'
import type {
  BroadcastSession,
  BroadcastTrack,
  BroadcastParticipant,
  BroadcastCommand,
} from '../lib/broadcastTypes'

// ── Helpers ────────────────────────────────────────────────────────────────────

function extractCode(): string {
  // Matches /broadcast/XXXXX
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

// Map DB snake_case row → camelCase BroadcastSession
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
  const [name, setName] = useState(() => {
    try { return localStorage.getItem('broadcastDisplayName') || '' } catch { return '' }
  })
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  const sessionTitle = session.name || `${session.hostName}'s Broadcast`
  const upNext = session.queue.slice(
    session.currentIndex + 1,
    session.currentIndex + 4
  )

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Art hero — blurred bg + centered image */}
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
        {/* Bottom gradient fade into page */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, zIndex: 2,
          background: 'linear-gradient(to bottom, transparent, #0a0a0a)',
        }} />
      </div>

      <div style={{ flex: 1, maxWidth: 480, width: '100%', margin: '0 auto', padding: '0 20px', paddingBottom: 'max(40px, env(safe-area-inset-bottom, 0px))', boxSizing: 'border-box' }}>

        {/* LIVE badge + session title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, marginTop: 4 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)',
            borderRadius: 20, padding: '3px 9px',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: '#4ade80',
              boxShadow: '0 0 6px #4ade80',
            }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', letterSpacing: '0.08em' }}>LIVE</span>
          </div>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
            hosted by <strong style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{session.hostName}</strong>
          </span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, lineHeight: 1.2, color: '#fff' }}>
          {sessionTitle}
        </h1>

        {/* Now playing */}
        {session.currentTrack && (
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '12px 14px', marginBottom: 12,
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Now Playing
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {artUrl && (
                <img src={artUrl} alt="" style={{ width: 40, height: 40, borderRadius: 5, objectFit: 'cover', flexShrink: 0 }} />
              )}
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

        {/* Up next */}
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
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.artist}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Name input + join */}
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
        style={{
          fontSize: 12, fontWeight: 600, color: 'var(--accent, #a78bfa)',
          textDecoration: 'none', whiteSpace: 'nowrap',
        }}
      >
        Get App →
      </a>
      <button
        onClick={onDismiss}
        style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
          cursor: 'pointer', fontSize: 18, padding: '0 4px', lineHeight: 1,
        }}
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
      <div style={{
        height: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 2, position: 'relative',
      }}>
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
    <div style={{
      display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4,
      scrollbarWidth: 'none',
    }}>
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
            <span style={{
              fontSize: 9, fontWeight: 700, color: '#a78bfa',
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>HOST</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Queue track row ────────────────────────────────────────────────────────────

function QueueRow({
  track, isCurrentTrack, myUserId, onVote,
}: {
  track: BroadcastTrack
  isCurrentTrack: boolean
  myUserId: string
  onVote: (uri: string, vote: 'up' | 'down') => void
}) {
  const myUp = track.votes.up.includes(myUserId)
  const myDown = track.votes.down.includes(myUserId)

  return (
    <div style={{
      padding: '10px 0',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', gap: 10,
      borderLeft: isCurrentTrack ? '2px solid var(--accent, #a78bfa)' : '2px solid transparent',
      paddingLeft: isCurrentTrack ? 10 : 0,
    }}>
      {/* Art */}
      {track.artUrl ? (
        <img src={track.artUrl} alt="" style={{ width: 38, height: 38, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <div style={{
          width: 38, height: 38, borderRadius: 4, background: 'rgba(255,255,255,0.08)', flexShrink: 0,
        }} />
      )}

      {/* Info */}
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

      {/* Vote buttons */}
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

function SearchSection({
  onAddTrack,
  onPlayNext,
  broadcastCode,
  myUserId,
  myDisplayName,
  queue,
}: {
  onAddTrack: (track: BroadcastTrack) => void
  onPlayNext: (track: BroadcastTrack) => void
  broadcastCode: string
  myUserId: string
  myDisplayName: string
  queue: BroadcastTrack[]
}) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<BroadcastTrack[]>([])
  const [confirmTrack, setConfirmTrack] = useState<BroadcastTrack | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Subscribe to search results via Broadcast channel
  useEffect(() => {
    const ch = supabase.channel(`broadcast:${broadcastCode}`)
      .on('broadcast', { event: 'command' }, ({ payload }: { payload: BroadcastCommand }) => {
        if (payload.type === 'search-results') {
          setResults(payload.results)
          setSearching(false)
        }
      })
      .subscribe()
    channelRef.current = ch
    return () => { ch.unsubscribe() }
  }, [broadcastCode])

  const doSearch = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); setSearching(false); return }
    setSearching(true)
    const requestId = Math.random().toString(36).slice(2)
    const cmd: BroadcastCommand = { type: 'search-request', query: q.trim(), requestId, userId: myUserId }
    channelRef.current?.send({ type: 'broadcast', event: 'command', payload: cmd })
    // Auto-clear searching after 10s timeout
    setTimeout(() => setSearching(false), 10000)
  }, [broadcastCode, myUserId])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(q), 300)
  }

  const handleAdd = (track: BroadcastTrack) => {
    const isDuplicate = queue.some(t => t.uri === track.uri)
    if (isDuplicate) {
      setConfirmTrack(track)
    } else {
      onAddTrack(track)
      setResults([])
      setQuery('')
    }
  }

  const handlePlayNext = (track: BroadcastTrack) => {
    onPlayNext(track)
    setResults([])
    setQuery('')
  }

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <input
          value={query}
          onChange={handleInput}
          placeholder="Artists, albums, tracks…"
          style={{
            width: '100%', padding: '11px 16px',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, color: '#fff', fontSize: 16, outline: 'none',
            fontFamily: 'inherit', boxSizing: 'border-box', WebkitAppearance: 'none',
          }}
        />
        {searching && (
          <span style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            fontSize: 11, color: 'rgba(255,255,255,0.4)',
          }}>Searching…</span>
        )}
      </div>

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
              <button onClick={() => { onAddTrack(confirmTrack); setConfirmTrack(null); setResults([]); setQuery('') }} style={{
                flex: 1, padding: '11px 0', background: 'var(--accent, #a78bfa)',
                border: 'none', borderRadius: 9, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
              }}>Add Anyway</button>
            </div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: 8, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.09)' }}>
          {results.map((r, i) => (
            <div
              key={`${r.uri}-${i}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
                borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
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
                  onClick={() => handlePlayNext({ ...r, addedBy: myDisplayName, votes: { up: [], down: [] } })}
                  title="Play Next"
                  style={{
                    padding: '6px 10px', background: 'rgba(167,139,250,0.15)',
                    border: '1px solid rgba(167,139,250,0.3)', borderRadius: 7,
                    color: '#a78bfa', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                    fontFamily: 'inherit', whiteSpace: 'nowrap',
                  }}
                >▶︎ Next</button>
                <button
                  onClick={() => handleAdd({ ...r, addedBy: myDisplayName, votes: { up: [], down: [] } })}
                  title="Add to Queue"
                  style={{
                    padding: '6px 10px', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7,
                    color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                    fontFamily: 'inherit', whiteSpace: 'nowrap',
                  }}
                >+ Queue</button>
              </div>
            </div>
          ))}
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

  // Guest identity
  const [myUserId] = useState<string>(() => {
    try { return localStorage.getItem('broadcastUserId') || (() => { const id = randomUserId(); localStorage.setItem('broadcastUserId', id); return id })() } catch { return randomUserId() }
  })
  const [myDisplayName, setMyDisplayName] = useState<string>(() => {
    try { return localStorage.getItem('broadcastDisplayName') || '' } catch { return '' }
  })

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const deepLinkAttempted = useRef(false)

  // Fetch session row — no expiry filter so we can show context even for ended sessions
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
        setSession(rowToSession(data as Record<string, unknown>))
        setLoading(false)

        const isExpired = new Date((data as any).expires_at) < new Date()
        if (!isExpired) {
          // Fire deep link only for live sessions — opens the app if installed
          if (!deepLinkAttempted.current) {
            deepLinkAttempted.current = true
            window.location.href = `fibertuner://broadcast/${code}`
          }
          // Always show the name screen so users can change their name.
          // JoinScreen pre-fills the stored name so returning users just tap Join.
          setShowNameModal(true)
        }
      })
  }, [code])

  // Fetch album art via shared utility (races MusicBrainz and iTunes)
  useEffect(() => {
    if (!session?.currentTrack) return
    const { artist, album } = session.currentTrack
    if (artist || album) {
      fetchAlbumArt(artist, album).then(url => { if (url) setArtUrl(url) })
    }
  }, [session?.currentTrack?.title])

  // Subscribe to Postgres Realtime changes
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
        const all: BroadcastParticipant[] = Object.values(state).flat()
        setParticipants(all)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await ch.track({ userId: myUserId, displayName: myDisplayName, isHost: false, joinedAt: Date.now() })
        }
      })

    channelRef.current = ch
    return () => { ch.unsubscribe() }
  }, [code, joined, myUserId, myDisplayName])

  const handleJoin = (name: string) => {
    try { localStorage.setItem('broadcastDisplayName', name); localStorage.setItem('broadcastUserId', myUserId) } catch {}
    setMyDisplayName(name)
    setShowNameModal(false)
    setJoined(true)
  }

  const handleVote = useCallback((trackUri: string, vote: 'up' | 'down') => {
    // Optimistic update
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

    // Send via already-subscribed Broadcast channel
    const cmd: BroadcastCommand = { type: 'vote', trackUri, vote, userId: myUserId, displayName: myDisplayName }
    channelRef.current?.send({ type: 'broadcast', event: 'command', payload: cmd })
  }, [code, myUserId, myDisplayName])

  const handleAddTrack = useCallback((track: BroadcastTrack) => {
    const cmd: BroadcastCommand = { type: 'add-track', track, addedBy: myDisplayName, userId: myUserId }
    channelRef.current?.send({ type: 'broadcast', event: 'command', payload: cmd })
  }, [myUserId, myDisplayName])

  const handlePlayNext = useCallback((track: BroadcastTrack) => {
    const cmd: BroadcastCommand = { type: 'play-next', track, addedBy: myDisplayName, userId: myUserId }
    channelRef.current?.send({ type: 'broadcast', event: 'command', payload: cmd })
  }, [myUserId, myDisplayName])

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

  if (error || !session) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Broadcast not found</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>This broadcast has ended.</p>
        </div>
      </div>
    )
  }

  const isExpired = new Date(session.expiresAt) < new Date()

  if (isExpired) {
    return (
      <div style={{ ...pageStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16, textAlign: 'center' }}>
        {artUrl && (
          <img src={artUrl} alt="" style={{ width: 100, height: 100, borderRadius: 10, objectFit: 'cover', opacity: 0.35 }} />
        )}
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Broadcast Ended</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{session.name || `${session.hostName}'s Broadcast`}</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 0 }}>This broadcast has ended.</p>
          {session.currentTrack && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 8 }}>
              Last playing: {session.currentTrack.title} · {session.currentTrack.artist}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (showNameModal) {
    return <JoinScreen session={session} artUrl={artUrl} onJoin={handleJoin} />
  }

  return (
    <div style={pageStyle}>
      {/* App banner */}
      {showBanner && <AppBanner onDismiss={() => setShowBanner(false)} />}

      {/* Header */}
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

      {/* Host context */}
      <div style={{
        padding: '10px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.02)',
        fontSize: 12,
        color: 'rgba(255,255,255,0.38)',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{session.hostName}</strong>
        {' '}is broadcasting their Plex queue live on Fibertuner — add tracks and vote on what's next.
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px' }}>

        {/* Now Playing */}
        <section style={{ paddingTop: 24, paddingBottom: 20 }}>
          {/* Album art */}
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

          {/* Track info */}
          {session.currentTrack ? (
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, lineHeight: 1.2 }}>{session.currentTrack.title}</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{session.currentTrack.artist}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{session.currentTrack.album}</p>
            </div>
          ) : (
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>
                {session.state === 'stopped' ? 'Nothing playing' : 'Loading…'}
              </h1>
            </div>
          )}

          {/* Progress */}
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
                transition: 'color 0.15s',
                marginBottom: -1,
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
                />
              ))
            )}
          </section>
        )}

        {/* Search tab */}
        {activeTab === 'search' && joined && (
          <section style={{ paddingBottom: 'max(40px, env(safe-area-inset-bottom, 0px))' }}>
            <SearchSection
              onAddTrack={handleAddTrack}
              onPlayNext={handlePlayNext}
              broadcastCode={code}
              myUserId={myUserId}
              myDisplayName={myDisplayName}
              queue={session.queue}
            />
          </section>
        )}

      </div>
    </div>
  )
}
