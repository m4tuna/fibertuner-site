import type { Context } from 'https://edge.netlify.com'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function fetchArtworkUrl(artist: string, album: string): Promise<string> {
  const fallback = 'https://fibertuner.com/assets/fibertuner/screenshot-mac.png'
  try {
    const q = encodeURIComponent(`${artist} ${album}`)
    const res = await fetch(`https://itunes.apple.com/search?term=${q}&entity=album&media=music&limit=5`)
    const data = await res.json()
    const match = (data.results ?? []).find((r: any) =>
      r.collectionType === 'Album' &&
      r.collectionName?.toLowerCase().includes(album.toLowerCase().slice(0, 6))
    ) ?? data.results?.[0]
    if (!match?.artworkUrl100) return fallback
    return match.artworkUrl100.replace('100x100bb', '600x600bb')
  } catch {
    return fallback
  }
}

export default async (request: Request, context: Context) => {
  const url = new URL(request.url)
  const title = url.searchParams.get('t') ?? ''
  const artist = url.searchParams.get('a') ?? ''
  const album = url.searchParams.get('al') ?? ''
  const isTrack = !!url.searchParams.get('rk')

  const ogTitle = isTrack
    ? (title && artist ? `${esc(title)} — ${esc(artist)}` : esc(title || artist || 'Fibertuner'))
    : (album && artist ? `${esc(album)} — ${esc(artist)}` : esc(album || 'Fibertuner'))
  const ogDesc = isTrack
    ? (album ? `Album: ${esc(album)} · Listen on Fibertuner` : 'Listen on Fibertuner')
    : 'Listen on Fibertuner'

  const ogImage = (artist || album) ? await fetchArtworkUrl(artist, album) : 'https://fibertuner.com/assets/fibertuner/screenshot-mac.png'

  const response = await context.next()
  const html = await response.text()

  const tags = `
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDesc}" />
    <meta property="og:image" content="${esc(ogImage)}" />
    <meta property="og:url" content="${esc(request.url)}" />
    <meta property="og:type" content="music.song" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${ogDesc}" />
    <meta name="twitter:image" content="${esc(ogImage)}" />`

  const patched = html.replace('</head>', `${tags}\n  </head>`)
  return new Response(patched, {
    status: response.status,
    headers: response.headers,
  })
}
