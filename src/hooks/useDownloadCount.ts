import { useState, useEffect } from 'react'

function fmt(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.0', '') + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace('.0', '') + 'k'
  return String(n)
}

export function useDownloadCount(githubRepo: string): string | null {
  const [count, setCount] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`https://api.github.com/repos/${githubRepo}/releases`)
        if (!res.ok) return
        const releases: { assets: { download_count: number }[] }[] = await res.json()
        const total = releases.reduce(
          (t, r) => t + r.assets.reduce((s, a) => s + a.download_count, 0),
          0
        )
        if (total > 0) setCount(fmt(total))
      } catch {}
    })()
  }, [githubRepo])

  return count
}
