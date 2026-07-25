import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useDownloadStats, fmt, type DownloadStats } from '../hooks/useDownloadStats'

const ACCENT = '#a78bfa'
const GITHUB = 'm4tuna/fibertuner-site'

interface ClickRow {
  id: number
  created_at: string
  platform: string | null
  version: string | null
  user_agent: string | null
  referrer: string | null
  detected_os: string | null
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
  updated_at: string | null
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', width: 36, textAlign: 'right' }}>{fmt(value)}</span>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
      marginBottom: 16,
    }}>{children}</div>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14, padding: '20px 24px',
      ...style,
    }}>{children}</div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1px', color: 'rgba(255,255,255,0.92)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function GithubStats({ stats }: { stats: DownloadStats }) {
  const { totals, versions } = stats
  const platformMax = Math.max(totals.mac, totals.windows, totals.linux)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <Card>
        <SectionLabel>All-Time Downloads</SectionLabel>
        <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-1px', color: 'rgba(255,255,255,0.92)', marginBottom: 20 }}>
          {fmt(totals.total)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'macOS', value: totals.mac, color: ACCENT },
            { label: 'Windows', value: totals.windows, color: '#60a5fa' },
            { label: 'Linux', value: totals.linux, color: '#34d399' },
          ].map(p => (
            <div key={p.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{p.label}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                  {totals.total > 0 ? Math.round((p.value / totals.total) * 100) : 0}%
                </span>
              </div>
              <MiniBar value={p.value} max={platformMax} color={p.color} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionLabel>By Version</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr 60px',
            gap: 8, paddingBottom: 8, marginBottom: 4,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            {['Version', 'Mac', 'Win', 'Lin', 'Total'].map(h => (
              <span key={h} style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>{h}</span>
            ))}
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {versions.slice(0, 20).map(v => (
              <div key={v.version} style={{
                display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr 60px',
                gap: 8, padding: '6px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>v{v.version}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{fmt(v.mac)}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{fmt(v.windows)}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{fmt(v.linux)}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{fmt(v.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

function UserStats({ profiles }: { profiles: ProfileRow[] }) {
  const totalUsers = profiles.length
  const serverOwners = profiles.filter(p => p.server_owned).length
  const personalUsers = profiles.filter(p => !p.server_owned).length
  const uniqueServers = new Set(profiles.map(p => p.server_machine_id).filter(Boolean)).size

  const now = Date.now()
  const active30d = profiles.filter(p => p.updated_at && now - new Date(p.updated_at).getTime() < 30 * 86400_000).length
  const active7d  = profiles.filter(p => p.updated_at && now - new Date(p.updated_at).getTime() < 7 * 86400_000).length

  const serverCounts: Record<string, number> = {}
  for (const p of profiles) {
    if (p.server_name) serverCounts[p.server_name] = (serverCounts[p.server_name] ?? 0) + 1
  }
  const topServers = Object.entries(serverCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const serverMax = topServers[0]?.[1] ?? 1

  const sorted = [...profiles].sort((a, b) =>
    new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime()
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Top stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Users', value: totalUsers },
          { label: 'Active 7d', value: active7d },
          { label: 'Active 30d', value: active30d },
          { label: 'Server Owners', value: serverOwners },
          { label: 'Personal', value: personalUsers },
          { label: 'Unique Servers', value: uniqueServers },
        ].map(s => (
          <Card key={s.label}>
            <Stat label={s.label} value={s.value} />
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Top servers */}
        <Card>
          <SectionLabel>Top Plex Servers by Users</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topServers.map(([name, n]) => (
              <div key={name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{name}</span>
                </div>
                <MiniBar value={n} max={serverMax} color={ACCENT} />
              </div>
            ))}
          </div>
        </Card>

        {/* Recent users */}
        <Card>
          <SectionLabel>Recently Active Users</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '28px 1fr 100px 80px',
              gap: 10, paddingBottom: 8, marginBottom: 4,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              {['', 'User', 'Server', 'Seen'].map(h => (
                <span key={h} style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>{h}</span>
              ))}
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {sorted.slice(0, 30).map(p => (
                <div key={p.user_id} style={{
                  display: 'grid', gridTemplateColumns: '28px 1fr 100px 80px',
                  gap: 10, padding: '6px 0', alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <img
                    src={p.plex_thumb ?? ''}
                    alt=""
                    style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', opacity: 0.7 }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.plex_username ?? '—'}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.plex_email ?? ''}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.server_name ?? '—'}
                    {p.server_owned && <span style={{ color: ACCENT, marginLeft: 4 }}>★</span>}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', whiteSpace: 'nowrap' }}>
                    {p.updated_at ? new Date(p.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function ClickStats({ clicks }: { clicks: ClickRow[] }) {
  const platformCounts: Record<string, number> = {}
  const referrerCounts: Record<string, number> = {}
  const osCounts: Record<string, number> = {}

  for (const c of clicks) {
    const p = c.platform ?? 'unknown'
    platformCounts[p] = (platformCounts[p] ?? 0) + 1
    const ref = c.referrer ? (() => { try { return new URL(c.referrer!).hostname || 'direct' } catch { return c.referrer! } })() : 'direct'
    referrerCounts[ref] = (referrerCounts[ref] ?? 0) + 1
    const os = c.detected_os ?? 'unknown'
    osCounts[os] = (osCounts[os] ?? 0) + 1
  }

  const platformMax = Math.max(...Object.values(platformCounts), 1)
  const referrerMax = Math.max(...Object.values(referrerCounts), 1)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
      <Card>
        <SectionLabel>Download Clicks — By Platform</SectionLabel>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1px', color: 'rgba(255,255,255,0.9)', marginBottom: 16 }}>
          {fmt(clicks.length)}
          <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.35)', marginLeft: 8 }}>total clicks</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(platformCounts).sort((a, b) => b[1] - a[1]).map(([p, n]) => (
            <div key={p}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{p}</span>
              </div>
              <MiniBar value={n} max={platformMax} color={ACCENT} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionLabel>By Referrer</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(referrerCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([ref, n]) => (
            <div key={ref}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140, display: 'block' }}>{ref || 'direct'}</span>
              </div>
              <MiniBar value={n} max={referrerMax} color='#60a5fa' />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionLabel>By Detected OS</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(osCounts).sort((a, b) => b[1] - a[1]).map(([os, n]) => (
            <div key={os}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{os}</span>
              </div>
              <MiniBar value={n} max={Math.max(...Object.values(osCounts), 1)} color='#34d399' />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function RecentClicks({ clicks }: { clicks: ClickRow[] }) {
  return (
    <Card>
      <SectionLabel>Recent Download Clicks ({clicks.length})</SectionLabel>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              {['Time', 'Platform', 'Version', 'OS', 'Referrer', 'User Agent'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '4px 12px 8px 0',
                  color: 'rgba(255,255,255,0.25)', fontWeight: 600,
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clicks.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '6px 12px 6px 0', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
                  {new Date(c.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </td>
                <td style={{ padding: '6px 12px 6px 0', color: 'rgba(255,255,255,0.6)' }}>{c.platform ?? '—'}</td>
                <td style={{ padding: '6px 12px 6px 0', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{c.version ?? '—'}</td>
                <td style={{ padding: '6px 12px 6px 0', color: 'rgba(255,255,255,0.4)' }}>{c.detected_os ?? '—'}</td>
                <td style={{ padding: '6px 12px 6px 0', color: 'rgba(255,255,255,0.35)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.referrer ? (() => { try { return new URL(c.referrer).hostname } catch { return c.referrer } })() : 'direct'}
                </td>
                <td style={{ padding: '6px 0', color: 'rgba(255,255,255,0.25)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.user_agent ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default function StatsPanel() {
  const stats = useDownloadStats(GITHUB)
  const [clicks, setClicks] = useState<ClickRow[] | null>(null)
  const [clickError, setClickError] = useState(false)
  const [profiles, setProfiles] = useState<ProfileRow[] | null>(null)
  const [profileError, setProfileError] = useState(false)

  useEffect(() => {
    supabase
      .from('download_clicks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (error) { setClickError(true); return }
        setClicks(data as ClickRow[])
      })

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
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 40px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.5px', marginBottom: 48 }}>Stats</h1>

      {/* GitHub download stats */}
      <div style={{ marginBottom: 32 }}>
        <SectionLabel>Downloads — GitHub Release Assets</SectionLabel>
        {stats ? (
          <GithubStats stats={stats} />
        ) : (
          <Card><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Loading…</span></Card>
        )}
      </div>

      {/* Users */}
      <div style={{ marginBottom: 32 }}>
        <SectionLabel>Users — Supabase Profiles</SectionLabel>
        {profileError && (
          <Card><span style={{ fontSize: 12, color: 'rgba(255,100,100,0.7)' }}>Failed to load profiles — RLS may be blocking anon reads.</span></Card>
        )}
        {!profiles && !profileError && (
          <Card><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Loading…</span></Card>
        )}
        {profiles && profiles.length === 0 && (
          <Card><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>No profiles yet.</span></Card>
        )}
        {profiles && profiles.length > 0 && <UserStats profiles={profiles} />}
      </div>

      {/* Download click tracking */}
      <div style={{ marginBottom: 32 }}>
        <SectionLabel>Download Clicks — Supabase</SectionLabel>
        {clickError && (
          <Card><span style={{ fontSize: 12, color: 'rgba(255,100,100,0.7)' }}>Failed to load — check that the download_clicks table exists in Supabase.</span></Card>
        )}
        {!clicks && !clickError && (
          <Card><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Loading…</span></Card>
        )}
        {clicks && clicks.length === 0 && (
          <Card><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>No click data yet.</span></Card>
        )}
        {clicks && clicks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ClickStats clicks={clicks} />
            <RecentClicks clicks={clicks} />
          </div>
        )}
        {clickError && (
          <Card style={{ marginTop: 12, borderColor: 'rgba(255,100,100,0.2)' }}>
            <SectionLabel>Setup SQL</SectionLabel>
            <pre style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.7, overflowX: 'auto' }}>{`create table download_clicks (
  id bigserial primary key,
  created_at timestamptz default now(),
  platform text, version text,
  user_agent text, referrer text, detected_os text
);
alter table download_clicks enable row level security;
create policy "anon insert" on download_clicks for insert to anon with check (true);`}</pre>
          </Card>
        )}
      </div>
    </div>
  )
}
