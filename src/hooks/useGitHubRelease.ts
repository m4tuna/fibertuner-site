import { useState, useEffect } from 'react'

export interface GitHubRelease {
  publishedAt: string
}

export function useGitHubRelease(githubRepo: string): GitHubRelease | null {
  const [release, setRelease] = useState<GitHubRelease | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`https://api.github.com/repos/${githubRepo}/releases/latest`)
        if (!res.ok) return
        const data: { published_at: string } = await res.json()
        setRelease({ publishedAt: data.published_at })
      } catch {}
    })()
  }, [githubRepo])

  return release
}
