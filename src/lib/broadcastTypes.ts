export interface BroadcastTrack {
  title:      string
  artist:     string
  album:      string
  artUrl:     string        // '' if LAN-only or unavailable
  durationMs: number
  uri:        string
  ratingKey?: string
  addedBy:    string        // display name, '' = host
  votes: { up: string[]; down: string[] }
}

export type BroadcastPlayState = 'playing' | 'paused' | 'stopped'
export type BroadcastSource    = 'sonos' | 'local' | 'airplay'

export interface BroadcastSession {
  code:               string
  hostUserId:         string
  hostName:           string
  name:               string | null
  source:             BroadcastSource
  state:              BroadcastPlayState
  currentTrack:       BroadcastTrack | null
  queue:              BroadcastTrack[]
  currentIndex:       number
  positionSec:        number
  broadcastAt:        number        // Unix ms
  expiresAt:          string
  updatedAt:          string
}

export interface BroadcastParticipant {
  userId:      string
  displayName: string
  isHost:      boolean
  joinedAt:    number
}

export interface BroadcastArtist {
  ratingKey: string
  title:     string
  artUrl:    string
}

export interface BroadcastAlbum {
  ratingKey:    string
  title:        string
  artistName:   string
  year?:        number
  artUrl:       string
}

export interface BroadcastPlaylist {
  ratingKey:   string
  title:       string
  trackCount:  number
  artUrl:      string
}

export type BroadcastCommand =
  | { type: 'add-track';        track: BroadcastTrack; addedBy: string; userId: string }
  | { type: 'play-next';        track: BroadcastTrack; addedBy: string; userId: string }
  | { type: 'vote';             trackUri: string; vote: 'up' | 'down'; userId: string; displayName: string }
  | { type: 'search-request';   query: string; requestId: string; userId: string }
  | { type: 'search-results';   requestId: string; results: BroadcastTrack[]; artists: BroadcastArtist[]; albums: BroadcastAlbum[]; playlists: BroadcastPlaylist[] }
  | { type: 'browse-artist';    artistRatingKey: string; requestId: string; userId: string }
  | { type: 'browse-album';     albumRatingKey: string; requestId: string; userId: string }
  | { type: 'browse-playlist';  playlistRatingKey: string; requestId: string; userId: string }
  | { type: 'browse-results';   requestId: string; kind: 'albums' | 'tracks'; albums: BroadcastAlbum[]; tracks: BroadcastTrack[] }
