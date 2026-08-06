export interface BroadcastTrack {
  title:      string
  artist:     string
  album:      string
  artUrl:     string        // '' if LAN-only or unavailable
  durationMs: number
  uri:        string
  ratingKey?: string
  addedBy:    { userId: string; displayName: string } | null  // null = host added
  votes: { up: number; down: string[] }  // up = unlimited counter; down = userId array (deduplicated)
}

export type BroadcastPlayState = 'playing' | 'paused' | 'stopped'
export type BroadcastSource    = 'sonos' | 'local' | 'airplay'

export interface PowerHourSnapshot {
  active: boolean
  songNumber: number
  songCount: number
  countdown: number
  segmentDuration: number
  paused: boolean
  completed: boolean
  sourceName: string | null
  broadcastAt: number  // timestamp (ms) when snapshot was sent — for local countdown interpolation
}

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
  powerHour:          PowerHourSnapshot | null
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
  | { type: 'remove-track';     trackUri: string; userId: string }
  | { type: 'vote';             trackUri: string; vote: 'up' | 'down'; userId: string; displayName: string; cancelDownvote?: boolean }
  | { type: 'search-request';   query: string; requestId: string; userId: string }
  | { type: 'search-results';   requestId: string; results: BroadcastTrack[]; artists: BroadcastArtist[]; albums: BroadcastAlbum[]; playlists: BroadcastPlaylist[] }
  | { type: 'browse-artist';    artistRatingKey: string; requestId: string; userId: string }
  | { type: 'browse-album';     albumRatingKey: string; requestId: string; userId: string }
  | { type: 'browse-playlist';  playlistRatingKey: string; requestId: string; userId: string }
  | { type: 'browse-results';   requestId: string; kind: 'albums' | 'tracks'; albums: BroadcastAlbum[]; tracks: BroadcastTrack[] }
  | { type: 'host-meta';        accentColor: string }
  | { type: 'broadcast-ended' }
  | { type: 'power-hour-drink'; songNumber: number }
