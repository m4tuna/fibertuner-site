// Races MusicBrainz/Cover Art Archive against iTunes and returns whichever
// resolves first with a usable URL. Resolves to null if both fail.

async function fromMusicBrainz(artist: string, album: string): Promise<string | null> {
  try {
    const clean = album.replace(/[^\w\s]/g, '').trim()
    const q = encodeURIComponent(`artist:"${artist}" AND release:"${clean}"`)
    const res = await fetch(
      `https://musicbrainz.org/ws/2/release/?query=${q}&limit=5&fmt=json`,
      { headers: { 'Accept': 'application/json' } }
    )
    const data = await res.json()
    const release = (data.releases ?? []).find((r: any) => r.status === 'Official') ?? data.releases?.[0]
    if (!release?.id) return null
    // CAA returns the image directly (follows redirect automatically)
    return `https://coverartarchive.org/release/${release.id}/front`
  } catch {
    return null
  }
}

async function fromItunes(artist: string, album: string): Promise<string | null> {
  try {
    const term = album ? `${artist} ${album}` : artist
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=album&limit=5&media=music`
    )
    const data = await res.json()
    const artistWord = artist.toLowerCase().split(' ')[0]
    const best =
      (data.results ?? []).find((r: any) =>
        r.artistName?.toLowerCase().includes(artistWord)
      ) ?? data.results?.[0]
    if (!best?.artworkUrl100) return null
    return best.artworkUrl100.replace('100x100bb', '500x500bb')
  } catch {
    return null
  }
}

// Races both sources; resolves as soon as one returns a URL (or null if both fail)
export function fetchAlbumArt(artist: string, album: string): Promise<string | null> {
  if (!artist && !album) return Promise.resolve(null)
  return new Promise((resolve) => {
    let settled = false
    let remaining = 2
    const finish = (url: string | null) => {
      if (url && !settled) { settled = true; resolve(url) }
      else if (--remaining === 0 && !settled) resolve(null)
    }
    fromMusicBrainz(artist, album).then(finish).catch(() => finish(null))
    fromItunes(artist, album).then(finish).catch(() => finish(null))
  })
}
