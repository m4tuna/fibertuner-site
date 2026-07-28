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

export type BroadcastCommand =
  | { type: 'add-track';      track: BroadcastTrack; addedBy: string; userId: string }
  | { type: 'vote';           trackUri: string; vote: 'up' | 'down'; userId: string; displayName: string }
  | { type: 'search-request'; query: string; requestId: string; userId: string }
  | { type: 'search-results'; requestId: string; results: BroadcastTrack[] }
