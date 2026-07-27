import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useDownloadStats, fmt, type DownloadStats } from '../hooks/useDownloadStats'
import '../styles/stats-panel.css'

const GITHUB = 'm4tuna/fibertuner-site'

const PLATFORM_COLORS = {
  mac:     { fill: 'var(--accent)' },
  windows: { fill: '#60a5fa' },
  linux:   { fill: '#34d399' },
}

interface ProfileRow {
  user_id: string
  plex_uuid: string | null
  plex_email: string | null
  plex_username: string | null
  plex_thumb: string | null
  server_owned: boolean | null
  server_name: string | null
  server_machine_id: string | null
  app_version: string | null
  updated_at: string | null
}

function MiniBar({ value, max, fill }: { value: number; max: number; fill: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="mini-bar">
      <div className="mini-bar__track">
        <div className="mini-bar__fill" style={{ width: `${pct}%`, background: fill }} />
      </div>
      <span className="mini-bar__value">{fmt(value)}</span>
    </div>
  )
}

function GithubStats({ stats }: { stats: DownloadStats }) {
  const { totals, uniqueEst, versions } = stats
  const platformMax = Math.max(totals.mac, totals.windows, totals.linux)
  const uniqueMax   = Math.max(uniqueEst.mac, uniqueEst.windows, uniqueEst.linux)

  const platforms = [
    { label: 'macOS',   key: 'mac'     as const },
    { label: 'Windows', key: 'windows' as const },
    { label: 'Linux',   key: 'linux'   as const },
  ]

  return (
    <div className="github-stats__grid">
      <div className="github-stats__left">
        <div className="stats-card">
          <div className="section-label">All-Time Downloads</div>
          <div className="github-stats__total">{fmt(totals.total)}</div>
          <div className="github-stats__platform-rows">
            {platforms.map(p => (
              <div key={p.label}>
                <div className="github-stats__platform-header">
                  <span className="github-stats__platform-name">{p.label}</span>
                  <span className="github-stats__platform-pct">
                    {totals.total > 0 ? Math.round((totals[p.key] / totals.total) * 100) : 0}%
                  </span>
                </div>
                <MiniBar value={totals[p.key]} max={platformMax} fill={PLATFORM_COLORS[p.key].fill} />
              </div>
            ))}
          </div>
        </div>

        <div className="stats-card">
          <div className="section-label">Unique Installs</div>
          <div className="github-stats__unique-row">
            <span className="github-stats__unique-value">{fmt(uniqueEst.total)}</span>
            <span className="github-stats__unique-pct">
              {totals.total > 0 ? Math.round((uniqueEst.total / totals.total) * 100) : 0}% of total
            </span>
          </div>
          <div className="github-stats__platform-rows">
            {platforms.map(p => (
              <div key={p.label}>
                <div className="github-stats__platform-header">
                  <span className="github-stats__platform-name">{p.label}</span>
                  <span className="github-stats__platform-pct">
                    {uniqueEst.total > 0 ? Math.round((uniqueEst[p.key] / uniqueEst.total) * 100) : 0}%
                  </span>
                </div>
                <MiniBar value={uniqueEst[p.key]} max={uniqueMax} fill={PLATFORM_COLORS[p.key].fill} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="stats-card stats-card--flex">
        <div className="section-label">By Version</div>
        <div className="version-table">
          <div className="version-table__header">
            {['Version', 'Mac', 'Win', 'Lin', 'Total'].map(h => (
              <span key={h} className="version-table__col-head">{h}</span>
            ))}
          </div>
          <div className="version-table__rows">
            {versions.slice(0, 20).map(v => (
              <div key={v.version} className="version-table__row">
                <span className="version-table__version">v{v.version}</span>
                <span className="version-table__count">{fmt(v.mac)}</span>
                <span className="version-table__count">{fmt(v.windows)}</span>
                <span className="version-table__count">{fmt(v.linux)}</span>
                <span className="version-table__total">{fmt(v.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function UserStats({ profiles }: { profiles: ProfileRow[] }) {
  const totalUsers    = profiles.length
  const serverOwners  = profiles.filter(p => p.server_owned).length
  const personalUsers = profiles.filter(p => !p.server_owned).length
  const uniqueServers = new Set(profiles.map(p => p.server_machine_id).filter(Boolean)).size

  const now      = Date.now()
  const active30d = profiles.filter(p => p.updated_at && now - new Date(p.updated_at).getTime() < 30 * 86400_000).length
  const active7d  = profiles.filter(p => p.updated_at && now - new Date(p.updated_at).getTime() < 7 * 86400_000).length

  const serverCounts: Record<string, number> = {}
  for (const p of profiles) {
    if (p.server_name) serverCounts[p.server_name] = (serverCounts[p.server_name] ?? 0) + 1
  }
  const topServers = Object.entries(serverCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const serverMax  = topServers[0]?.[1] ?? 1

  const sorted = [...profiles].sort((a, b) =>
    new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime()
  )

  const topRow = [
    { label: 'Total Users',     value: totalUsers },
    { label: 'Active 7d',       value: active7d },
    { label: 'Active 30d',      value: active30d },
    { label: 'Server Owners',   value: serverOwners },
    { label: 'Personal',        value: personalUsers },
    { label: 'Unique Servers',  value: uniqueServers },
  ]

  return (
    <div>
      <div className="user-stats__top">
        {topRow.map(s => (
          <div key={s.label} className="stats-card">
            <div className="stat__value">{s.value}</div>
            <div className="stat__label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="user-stats__grid">
        <div className="stats-card">
          <div className="section-label">Top Plex Servers by Users</div>
          <div className="user-stats__server-rows">
            {topServers.map(([name, n]) => (
              <div key={name}>
                <div className="user-stats__server-name">{name}</div>
                <MiniBar value={n} max={serverMax} fill="var(--accent)" />
              </div>
            ))}
          </div>
        </div>

        <div className="stats-card">
          <div className="section-label">Recently Active Users</div>
          <div className="user-list__header">
            {['', 'User', 'Server', 'Version', 'Seen'].map(h => (
              <span key={h} className="user-list__col-head">{h}</span>
            ))}
          </div>
          <div className="user-list">
            {sorted.slice(0, 30).map(p => (
              <div key={p.user_id} className="user-list__row">
                <img
                  src={p.plex_thumb ?? ''}
                  alt=""
                  className="user-list__avatar"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <div className="user-list__info">
                  <div className="user-list__username">{p.plex_username ?? '—'}</div>
                  <div className="user-list__email">{p.plex_email ?? ''}</div>
                </div>
                <span className="user-list__server">
                  {p.server_name ?? '—'}
                  {p.server_owned && <span className="user-list__server-star">★</span>}
                </span>
                <span className="user-list__version">{p.app_version ?? '—'}</span>
                <span className="user-list__seen">
                  {p.updated_at
                    ? new Date(p.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StatsPanel() {
  const stats = useDownloadStats(GITHUB)
  const [profiles, setProfiles]       = useState<ProfileRow[] | null>(null)
  const [profileError, setProfileError] = useState(false)

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { setProfileError(true); return }
        setProfiles(data as ProfileRow[])
      })
  }, [])

  return (
    <div className="stats-panel">
      <h1 className="stats-panel__title">Stats</h1>

      <div className="stats-section">
        <div className="section-label">Downloads — GitHub Release Assets</div>
        {stats
          ? <GithubStats stats={stats} />
          : <div className="stats-card"><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Loading…</span></div>
        }
      </div>

      <div className="stats-section">
        <div className="section-label">Users — Supabase Profiles</div>
        {profileError && (
          <div className="stats-card">
            <span style={{ fontSize: 12, color: 'rgba(255,100,100,0.7)' }}>
              Failed to load profiles — RLS may be blocking anon reads.
            </span>
          </div>
        )}
        {!profiles && !profileError && (
          <div className="stats-card"><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Loading…</span></div>
        )}
        {profiles && profiles.length === 0 && (
          <div className="stats-card"><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>No profiles yet.</span></div>
        )}
        {profiles && profiles.length > 0 && <UserStats profiles={profiles} />}
      </div>
    </div>
  )
}
