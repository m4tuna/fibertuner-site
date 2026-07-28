import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
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

// ── Name prompt modal ──────────────────────────────────────────────────────────

function NameModal({ onJoin }: { onJoin: (name: string) => void }) {
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#111', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: '32px 28px', width: '100%', maxWidth: 360,
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Join the Broadcast</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
          What should we call you?
        </p>
        <input
          ref={inputRef}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onJoin(name.trim()) }}
          placeholder="Your name"
          maxLength={30}
          style={{
            width: '100%', padding: '12px 16px',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10, color: '#fff', fontSize: 16, outline: 'none',
            fontFamily: 'inherit', marginBottom: 16,
          }}
        />
        <button
          onClick={() => { if (name.trim()) onJoin(name.trim()) }}
          disabled={!name.trim()}
          style={{
            width: '100%', padding: '13px 0',
            background: name.trim() ? 'var(--accent, #a78bfa)' : 'rgba(255,255,255,0.1)',
            color: name.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
            borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 600,
            cursor: name.trim() ? 'pointer' : 'default', fontFamily: 'inherit',
          }}
        >
          Join
        </button>
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
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button
          onClick={() => onVote(track.uri, 'up')}
          style={{
            background: myUp ? 'rgba(134,239,172,0.2)' : 'rgba(255,255,255,0.07)',
            border: myUp ? '1px solid rgba(134,239,172,0.4)' : '1px solid transparent',
            color: myUp ? '#86efac' : 'rgba(255,255,255,0.4)',
            borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 3,
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
            borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 3,
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
  broadcastCode,
  myUserId,
  myDisplayName,
  queue,
}: {
  onAddTrack: (track: BroadcastTrack) => void
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

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <input
          value={query}
          onChange={handleInput}
          placeholder="Search tracks..."
          style={{
            width: '100%', padding: '11px 16px',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none',
            fontFamily: 'inherit', boxSizing: 'border-box',
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
            <button
              key={`${r.uri}-${i}`}
              onClick={() => handleAdd({ ...r, addedBy: myDisplayName, votes: { up: [], down: [] } })}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
                border: 'none', borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                cursor: 'pointer', textAlign: 'left', color: '#fff', fontFamily: 'inherit',
              }}
            >
              {r.artUrl ? (
                <img src={r.artUrl} alt="" style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: 4, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.artist} · {r.album}</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--accent, #a78bfa)', flexShrink: 0 }}>+ Add</span>
            </button>
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
  // True for the first 2s after the deep link fires — prevents showing the error
  // state while iOS is still deciding whether to open the app.
  const [deepLinkPending, setDeepLinkPending] = useState(!!code)

  // Guest identity
  const [myUserId] = useState<string>(() => {
    try { return localStorage.getItem('broadcastUserId') || (() => { const id = randomUserId(); localStorage.setItem('broadcastUserId', id); return id })() } catch { return randomUserId() }
  })
  const [myDisplayName, setMyDisplayName] = useState<string>(() => {
    try { return localStorage.getItem('broadcastDisplayName') || '' } catch { return '' }
  })

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const deepLinkAttempted = useRef(false)
  const deepLinkFired = useRef(false)

  // Fire deep link; after 2s clear pending so the page can show normally
  useEffect(() => {
    if (!code || deepLinkAttempted.current) return
    deepLinkAttempted.current = true
    window.location.href = `fibertuner://broadcast/${code}`
    deepLinkFired.current = true
    const timer = setTimeout(() => setDeepLinkPending(false), 2000)
    return () => clearTimeout(timer)
  }, [code])

  // Fetch session row
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
      .gt('expires_at', new Date().toISOString())
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError('Broadcast session not found or has expired.')
          setLoading(false)
          return
        }
        setSession(rowToSession(data as Record<string, unknown>))
        setLoading(false)

        // Show name modal if no display name
        if (!localStorage.getItem('broadcastDisplayName')) {
          setShowNameModal(true)
        } else {
          setJoined(true)
        }
      })
  }, [code])

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

  // While the deep link is pending, show a transitional screen regardless of
  // whether the session fetch has finished — the user may be opening the app.
  if (deepLinkPending) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          {session ? (
            <>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Joining
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
                {session.name || `${session.hostName}'s Broadcast`}
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
                with {session.hostName}
              </p>
            </>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Opening Fibertuner…</div>
          )}
        </div>
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

  // If the deep link fired (user was sent to the app) but the session lookup
  // failed, don't show a confusing "expired" error — offer to reopen the app.
  if (error || (!loading && !session)) {
    if (deepLinkFired.current) {
      return (
        <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Broadcast
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Open in Fibertuner</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24, lineHeight: 1.6 }}>
              You were redirected to the app. Tap below if it didn't open.
            </p>
            <button
              onClick={() => { window.location.href = `fibertuner://broadcast/${code}` }}
              style={{
                padding: '13px 28px', background: 'var(--accent, #a78bfa)',
                color: '#fff', border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Open Fibertuner
            </button>
          </div>
        </div>
      )
    }
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{error ?? 'Broadcast session not found.'}</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Ask the host to start a new broadcast session.</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const isExpired = new Date(session.expiresAt) < new Date()
  if (isExpired) {
    if (deepLinkFired.current) {
      return (
        <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Open in Fibertuner</h2>
            <button
              onClick={() => { window.location.href = `fibertuner://broadcast/${code}` }}
              style={{
                padding: '13px 28px', background: 'var(--accent, #a78bfa)',
                color: '#fff', border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Open Fibertuner
            </button>
          </div>
        </div>
      )
    }
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Broadcast Ended</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>This session has expired.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      {/* Name modal */}
      {showNameModal && <NameModal onJoin={handleJoin} />}

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
          <div style={{
            width: '100%', aspectRatio: '1', borderRadius: 12, overflow: 'hidden',
            background: 'rgba(255,255,255,0.06)', marginBottom: 20,
            boxShadow: session.currentTrack?.artUrl ? '0 20px 60px rgba(0,0,0,0.6)' : 'none',
          }}>
            {session.currentTrack?.artUrl ? (
              <img src={session.currentTrack.artUrl} alt={session.currentTrack.album}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: '100%' }} />
            )}
          </div>

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
          <section style={{ paddingBottom: 40 }}>
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
          <section style={{ paddingBottom: 40 }}>
            <SearchSection
              onAddTrack={handleAddTrack}
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
