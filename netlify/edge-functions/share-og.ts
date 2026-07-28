import type { Context } from 'https://edge.netlify.com'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function fetchArtworkUrl(artist: string, album: string): Promise<string> {
  const fallback = 'https://fibertuner.com/assets/fibertuner/screenshot-mac.png'
  try {
    const cleanAlbum = album.replace(/[^\w\s]/g, '').trim()
    const q = encodeURIComponent(`artist:"${artist}" AND release:"${cleanAlbum}"`)
    const mbRes = await fetch(`https://musicbrainz.org/ws/2/release/?query=${q}&limit=5&fmt=json`, {
      headers: { 'User-Agent': 'FibertunerShare/1.0 (fibertuner.com)' }
    })
    const mbData = await mbRes.json()
    const release = (mbData.releases ?? []).find((r: any) => r.status === 'Official') ?? mbData.releases?.[0]
    if (!release?.id) return fallback
    const artRes = await fetch(`https://coverartarchive.org/release/${release.id}/front`, { redirect: 'follow' })
    if (!artRes.ok) return fallback
    return artRes.url
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
  const rawHtml = await response.text()
  // Strip static OG/twitter tags so the album art injected below wins.
  const html = rawHtml.replace(/<meta\s+(?:property="og:[^"]*"|name="twitter:[^"]*")[^>]*\/?>/gi, '')

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
