import { useState, useEffect } from 'react'

export interface PlatformCounts {
  mac: number
  windows: number
  linux: number
  total: number
}

export interface VersionStats {
  version: string
  publishedAt: string
  mac: number
  windows: number
  linux: number
  total: number
}

export interface DownloadStats {
  totals: PlatformCounts
  versions: VersionStats[]
  latestPublishedAt: string | null
}

const ASSET_MAP: Record<string, keyof Omit<PlatformCounts, 'total'>> = {
  'Fibertuner-mac.dmg':        'mac',
  'Fibertuner-win.exe':        'windows',
  'Fibertuner-linux.AppImage': 'linux',
}

export function useDownloadStats(githubRepo: string): DownloadStats | null {
  const [stats, setStats] = useState<DownloadStats | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const headers: Record<string, string> = {}
        const ghToken = import.meta.env.VITE_GH_TOKEN
        if (ghToken) headers['Authorization'] = `Bearer ${ghToken}`
        const res = await fetch(`https://api.github.com/repos/${githubRepo}/releases?per_page=100`, { headers })
        if (!res.ok) return
        const releases: {
          tag_name: string
          published_at: string
          assets: { name: string; download_count: number }[]
        }[] = await res.json()

        const totals: PlatformCounts = { mac: 0, windows: 0, linux: 0, total: 0 }
        const versions: VersionStats[] = []

        for (const r of releases) {
          const v: VersionStats = {
            version: r.tag_name.replace(/^v/, ''),
            publishedAt: r.published_at,
            mac: 0, windows: 0, linux: 0, total: 0,
          }
          for (const asset of r.assets) {
            const platform = ASSET_MAP[asset.name]
            if (!platform) continue
            v[platform] += asset.download_count
            v.total += asset.download_count
            totals[platform] += asset.download_count
            totals.total += asset.download_count
          }
          if (v.total > 0) versions.push(v)
        }

        const latestPublishedAt = releases[0]?.published_at ?? null
        setStats({ totals, versions, latestPublishedAt })
      } catch {}
    })()
  }, [githubRepo])

  return stats
}

export function fmt(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.0', '') + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace('.0', '') + 'k'
  return String(n)
}
