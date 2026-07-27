import type { Context } from 'https://edge.netlify.com'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
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

  const response = await context.next()
  const html = await response.text()

  const tags = `
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDesc}" />
    <meta property="og:image" content="https://fibertuner.com/assets/fibertuner/screenshot-mac.png" />
    <meta property="og:url" content="${esc(request.url)}" />
    <meta property="og:type" content="music.song" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${ogDesc}" />
    <meta name="twitter:image" content="https://fibertuner.com/assets/fibertuner/screenshot-mac.png" />`

  const patched = html.replace('</head>', `${tags}\n  </head>`)
  return new Response(patched, {
    status: response.status,
    headers: response.headers,
  })
}
