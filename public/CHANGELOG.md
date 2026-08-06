# Changelog

All notable changes to Fibertuner are documented here.

## [2.31.2] - 2026-08-06

## What's Changed
* fix: improve radio artist matching via client-side library scan by @m4tuna in https://github.com/m4tuna/fibertuner/pull/107


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.31.1...v2.31.2

## [2.31.1] - 2026-08-06

## What's Changed
* fix: sync play/pause state to UI immediately when TV mute/unmute fires by @m4tuna in https://github.com/m4tuna/fibertuner/pull/105


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.31.0...v2.31.1

## [2.31.0] - 2026-08-06

## What's Changed
* fix: AI playlist modal polish by @m4tuna in https://github.com/m4tuna/fibertuner/pull/104
* feat: sort home playlists by most recently played by @m4tuna in https://github.com/m4tuna/fibertuner/pull/106


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.30.0...v2.31.0

## [2.30.0] - 2026-08-05

## What's Changed
* feat: replace GitHub compare link with fibertuner.com/changelog in release notes modal by @m4tuna in https://github.com/m4tuna/fibertuner/pull/103


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.29.0...v2.30.0

## [2.29.0] - 2026-08-05

## What's Changed
* feat: radius dropdown + 6-hour Bandsintown cache for Events page by @m4tuna in https://github.com/m4tuna/fibertuner/pull/101


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.28.0...v2.29.0

## [2.28.0] - 2026-08-05

## What's Changed
* feat: AI Playlist modal revamp + drawer stays open during modal by @m4tuna in https://github.com/m4tuna/fibertuner/pull/102


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.27.0...v2.28.0

## [2.27.0] - 2026-08-05

## What's Changed
* feat: auto changelog pipeline by @m4tuna in https://github.com/m4tuna/fibertuner/pull/100


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.26.1...v2.27.0

## [2.26.1] - 2026-08-04

## What's Changed
* fix: wire events:fetch IPC handler to correct per-artist Bandsintown endpoint by @m4tuna in https://github.com/m4tuna/fibertuner/pull/96
* fix: restore release entry extraction in release-notes:get IPC handler by @m4tuna in https://github.com/m4tuna/fibertuner/pull/97


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.26.0...v2.26.1

## [2.26.0] - 2026-08-04

## What's Changed
* feat: Events page UX improvements — radius, loading message, pagination by @m4tuna in https://github.com/m4tuna/fibertuner/pull/98


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.25.10...v2.26.0

## [2.25.10] - 2026-08-04

## What's Changed
* fix: play/pause button updates instantly; retry getPlexConfig after restart by @m4tuna in https://github.com/m4tuna/fibertuner/pull/93
* fix: startup and post-login black screen by @m4tuna in https://github.com/m4tuna/fibertuner/pull/94


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.25.9...v2.25.10

## [2.25.9] - 2026-08-04

## What's Changed
* fix: eliminate play/pause flicker and permanent blank screen (regressions from #91) by @m4tuna in https://github.com/m4tuna/fibertuner/pull/92


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.25.8...v2.25.9

## [2.25.8] - 2026-08-04

## What's Changed
* fix: blank screen on restart and play/pause button not toggling by @m4tuna in https://github.com/m4tuna/fibertuner/pull/91


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.25.7...v2.25.8

## [2.25.7] - 2026-08-04

## What's Changed
* revert: PR #87 — TV mute state machine broke play/pause state globally by @m4tuna in https://github.com/m4tuna/fibertuner/pull/88
* fix: surgical TV mute state machine (wasPlayingBeforeMute) by @m4tuna in https://github.com/m4tuna/fibertuner/pull/90


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.25.6...v2.25.7

## [2.25.6] - 2026-08-04

## What's Changed
* fix: TV mute state machine + renderer pause sync by @m4tuna in https://github.com/m4tuna/fibertuner/pull/87


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.25.5...v2.25.6

## [2.25.5] - 2026-08-04

## What's Changed
* fix: Events page city picker, auto-load, and correct date mapping by @m4tuna in https://github.com/m4tuna/fibertuner/pull/86


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.25.4...v2.25.5

## [2.25.4] - 2026-08-03

## What's Changed
* fix: update release notes to v2.25.3; switch to multi-entry format by @m4tuna in https://github.com/m4tuna/fibertuner/pull/85


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.25.3...v2.25.4

## [2.25.3] - 2026-08-03

## What's Changed
* fix: wire Events page end-to-end by @m4tuna in https://github.com/m4tuna/fibertuner/pull/83


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.25.2...v2.25.3

## [2.25.2] - 2026-08-03

## What's Changed
* fix: release notes show correct version and auto-display after update by @m4tuna in https://github.com/m4tuna/fibertuner/pull/82


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.25.1...v2.25.2

## [2.25.1] - 2026-08-03

## What's Changed
* chore: route planning requests through background Plan agent by @m4tuna in https://github.com/m4tuna/fibertuner/pull/76
* fix: About is first and default tab in Settings; tabs alphabetized by @m4tuna in https://github.com/m4tuna/fibertuner/pull/79
* chore: add paths-ignore to release workflow by @m4tuna in https://github.com/m4tuna/fibertuner/pull/80


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.25.0...v2.25.1

## [2.25.0] - 2026-08-03

## What's Changed
* ui: match Friends and Events page headers to Radio/Playlists style by @m4tuna in https://github.com/m4tuna/fibertuner/pull/75
* feat: auto-resume Sonos playback on network reconnect by @m4tuna in https://github.com/m4tuna/fibertuner/pull/74


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.24.1...v2.25.0

## [2.24.1] - 2026-08-03

## What's Changed
* fix: Events page blocked by Bandsintown API — switch to js_sdk, strip city state suffix by @m4tuna in https://github.com/m4tuna/fibertuner/pull/71


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.24.0...v2.24.1

## [2.24.0] - 2026-08-03

## What's Changed
* feat: Events page with inline city autocomplete and NYC default by @m4tuna in https://github.com/m4tuna/fibertuner/pull/70


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.23.3...v2.24.0

## [2.23.3] - 2026-08-03

## What's Changed
* fix: sort Settings tabs alphabetically by @m4tuna in https://github.com/m4tuna/fibertuner/pull/69


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.23.2...v2.23.3

## [2.23.2] - 2026-08-03

## What's Changed
* fix: make About the first and default tab in Settings by @m4tuna in https://github.com/m4tuna/fibertuner/pull/68


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.23.1...v2.23.2

## [2.23.1] - 2026-08-03

## What's Changed
* fix: resolve stuck focus/highlight on sidenav items after click by @m4tuna in https://github.com/m4tuna/fibertuner/pull/67
* feat: Events page — upcoming concerts for Plex library artists by @m4tuna in https://github.com/m4tuna/fibertuner/pull/66


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.23.0...v2.23.1

## [2.23.0] - 2026-08-03

## What's Changed
* feat: sync crossfade, schedule, and vim mode to Supabase by @m4tuna in https://github.com/m4tuna/fibertuner/pull/65


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.22.6...v2.23.0

## [2.22.6] - 2026-08-03

## What's Changed
* fix: favorites buttons re-render on Realtime sync (Zustand selector bug) by @m4tuna in https://github.com/m4tuna/fibertuner/pull/64


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.22.5...v2.22.6

## [2.22.5] - 2026-08-03

## What's Changed
* chore: update bundled release notes to v2.22.4 by @m4tuna in https://github.com/m4tuna/fibertuner/pull/61
* fix: change Radio shortcut from ⌘R to ⌘D by @m4tuna in https://github.com/m4tuna/fibertuner/pull/63


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.22.4...v2.22.5

## [2.22.4] - 2026-08-03

## What's Changed
* fix: Chromecast button never appears — wire device-found push and fix mDNS discovery by @m4tuna in https://github.com/m4tuna/fibertuner/pull/60


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.22.3...v2.22.4

## [2.22.3] - 2026-08-03

## What's Changed
* fix: subscribe to Supabase Realtime on desktop for instant cross-device ratings/favorites sync by @m4tuna in https://github.com/m4tuna/fibertuner/pull/59


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.22.2...v2.22.3

## [2.22.2] - 2026-08-03

## What's Changed
* fix: Friends experience — presence logging, invite link, re-login notice by @m4tuna in https://github.com/m4tuna/fibertuner/pull/56


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.22.1...v2.22.2

## [2.22.1] - 2026-08-03

## What's Changed
* fix: nav shell UI — Go Live icon-only, hover bug, Friends shortcut, VIM labels, Search tab by @m4tuna in https://github.com/m4tuna/fibertuner/pull/57
* fix: playlist modal — toast on add, no click-outside close, tracks tab by @m4tuna in https://github.com/m4tuna/fibertuner/pull/58


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.22.0...v2.22.1

## [2.22.0] - 2026-08-03

## What's Changed
* feat: add persistent daily playback schedule by @m4tuna in https://github.com/m4tuna/fibertuner/pull/55


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.21.5...v2.22.0

## [2.21.5] - 2026-08-03

## What's Changed
* fix: correct presence UUID mismatch so friends show as 'on Fibertuner' by @m4tuna in https://github.com/m4tuna/fibertuner/pull/54


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.21.4...v2.21.5

## [2.21.4] - 2026-08-03

## What's Changed
* fix: Friends view — replace removed Plex API endpoint by @m4tuna in https://github.com/m4tuna/fibertuner/pull/53


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.21.3...v2.21.4

## [2.21.3] - 2026-08-03

## What's Changed
* fix: clear friends cache on login; log API errors in getPlexFriends by @m4tuna in https://github.com/m4tuna/fibertuner/pull/52


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.21.2...v2.21.3

## [2.21.2] - 2026-08-03

## What's Changed
* fix: show all Plex friends; fall back to server token for friends fetch by @m4tuna in https://github.com/m4tuna/fibertuner/pull/51


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.21.1...v2.21.2

## [2.21.1] - 2026-08-02

## What's Changed
* fix: correct plex_uuid in presence and restore friends list for existing users by @m4tuna in https://github.com/m4tuna/fibertuner/pull/49
* fix: bundle release notes via IPC, remove GitHub API dependency by @m4tuna in https://github.com/m4tuna/fibertuner/pull/48
* fix: remove duplicate ReleaseNotesModal import breaking CI by @m4tuna in https://github.com/m4tuna/fibertuner/pull/50


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.21.0...v2.21.1

## [2.21.0] - 2026-08-01

## What's Changed
* feat: release notes modal on About page by @m4tuna in https://github.com/m4tuna/fibertuner/pull/42


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.20.0...v2.21.0

## [2.20.0] - 2026-08-01

## What's Changed
* feat: crossfade playback by @m4tuna in https://github.com/m4tuna/fibertuner/pull/46


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.19.1...v2.20.0

## [2.19.1] - 2026-08-01

## What's Changed
* fix: use correct logo path in update modal for dev and production by @m4tuna in https://github.com/m4tuna/fibertuner/pull/43
* fix: TS error — .catch() on PostgrestFilterBuilder in poller.ts by @m4tuna in https://github.com/m4tuna/fibertuner/pull/47


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.19.0...v2.19.1

## [2.19.0] - 2026-08-01

## What's Changed
* feat: redesign Create Playlist flow with type modal and add-tracks step by @m4tuna in https://github.com/m4tuna/fibertuner/pull/41
* feat: social & friends — Plex friend presence and now-playing sharing by @m4tuna in https://github.com/m4tuna/fibertuner/pull/39


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.18.2...v2.19.0

## [2.18.2] - 2026-08-01

## What's Changed
* ui: replace magic icon with app logo in update/restart modal by @m4tuna in https://github.com/m4tuna/fibertuner/pull/37
* fix: restore album art in lower-left PlayerBar by @m4tuna in https://github.com/m4tuna/fibertuner/pull/38
* feat: Chromecast casting support (view-only and view+audio) by @m4tuna in https://github.com/m4tuna/fibertuner/pull/40


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.18.1...v2.18.2

## [2.18.1] - 2026-08-01

## What's Changed
* fix: restore per-member volumes on unmute to prevent coordinator spike by @m4tuna in https://github.com/m4tuna/fibertuner/pull/35
* ui: dynamic search tooltip shortcut and fake Search tab in library bar by @m4tuna in https://github.com/m4tuna/fibertuner/pull/36


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.18.0...v2.18.1

## [2.18.0] - 2026-08-01

## What's Changed
* feat(airplay): native AirPlay source routing with queue transfer by @m4tuna in https://github.com/m4tuna/fibertuner/pull/20


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.17.1...v2.18.0

## [2.17.1] - 2026-08-01

## What's Changed
* fix: guard window.api.onDeepLinkShare against undefined in browser context by @m4tuna in https://github.com/m4tuna/fibertuner/pull/34
* feat: add track count selector to regenerate radio modal by @m4tuna in https://github.com/m4tuna/fibertuner/pull/32
* ui: relocate search button to header and library tab bar by @m4tuna in https://github.com/m4tuna/fibertuner/pull/33


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.17.0...v2.17.1

## [2.17.0] - 2026-08-01

## What's Changed
* feat: Broadcast Queue — Electron host by @m4tuna in https://github.com/m4tuna/fibertuner/pull/27


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.16.5...v2.17.0

## [2.16.5] - 2026-08-01

## What's Changed
* fix: replace bare share sheet with submenu popover (Copy Link + Share via macOS) by @m4tuna in https://github.com/m4tuna/fibertuner/pull/28


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.16.4...v2.16.5

## [2.16.4] - 2026-08-01

## What's Changed
* fix: clear stale radio state when the other app replaces the Sonos queue by @m4tuna in https://github.com/m4tuna/fibertuner/pull/31


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.16.3...v2.16.4

## [2.16.3] - 2026-07-31

## What's Changed
* refactor: CSS extraction — BEM classes replace inline styles (Phases -1 through 4) by @m4tuna in https://github.com/m4tuna/fibertuner/pull/15
* fix: cross-device sync for ratings and favorites by @m4tuna in https://github.com/m4tuna/fibertuner/pull/30


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.16.2...v2.16.3

## [2.16.2] - 2026-07-29

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.16.1...v2.16.2

## [2.16.1] - 2026-07-29

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.16.0...v2.16.1

## [2.16.0] - 2026-07-29

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.15.4...v2.16.0

## [2.15.4] - 2026-07-29

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.15.3...v2.15.4

## [2.15.3] - 2026-07-29

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.15.2...v2.15.3

## [2.15.2] - 2026-07-28

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.15.1...v2.15.2

## [2.15.1] - 2026-07-28

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.15.0...v2.15.1

## [2.15.0] - 2026-07-28

## What's Changed
* feat: Remove from Playlist in track context menu by @m4tuna in https://github.com/m4tuna/fibertuner/pull/26


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.14.1...v2.15.0

## [2.14.1] - 2026-07-27

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.14.0...v2.14.1

## [2.14.0] - 2026-07-27

## What's Changed
* feat: Add to Playlist from track context menu by @m4tuna in https://github.com/m4tuna/fibertuner/pull/25


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.13.2...v2.14.0

## [2.13.2] - 2026-07-27

## What's Changed
* fix(icons): replace app icon with correct astronaut-on-moon logo by @m4tuna in https://github.com/m4tuna/fibertuner/pull/24
* fix: show album art in macOS track-change notification by @m4tuna in https://github.com/m4tuna/fibertuner/pull/23


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.13.1...v2.13.2

## [2.13.1] - 2026-07-27

## What's Changed
* fix(updater): show correct state when autoDownload finishes before modal opens by @m4tuna in https://github.com/m4tuna/fibertuner/pull/22


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.13.0...v2.13.1

## [2.13.0] - 2026-07-27

## What's Changed
* feat(vim-mode): opt-in VIM keyboard mode by @m4tuna in https://github.com/m4tuna/fibertuner/pull/19


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.12.2...v2.13.0

## [2.12.2] - 2026-07-27

## What's Changed
* fix(notifications): show album art in track-change notifications by @m4tuna in https://github.com/m4tuna/fibertuner/pull/21


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.12.1...v2.12.2

## [2.12.1] - 2026-07-27

## What's Changed
* fix(share): use Electron Menu shareMenu role for native OS share sheet by @m4tuna in https://github.com/m4tuna/fibertuner/pull/18


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.12.0...v2.12.1

## [2.12.0] - 2026-07-27

## What's Changed
* feat(queue): add Replenish Now link to queue footer by @m4tuna in https://github.com/m4tuna/fibertuner/pull/17


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.11.3...v2.12.0

## [2.11.3] - 2026-07-27

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.11.2...v2.11.3

## [2.11.2] - 2026-07-27

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.11.1...v2.11.2

## [2.11.1] - 2026-07-27

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.11.0...v2.11.1

## [2.11.0] - 2026-07-27

## What's Changed
* feat(share): track and album share links with deep link + OG landing page by @m4tuna in https://github.com/m4tuna/fibertuner/pull/16


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.10.1...v2.11.0

## [2.10.1] - 2026-07-27

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.10.0...v2.10.1

## [2.10.0] - 2026-07-27

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.9.1...v2.10.0

## [2.9.1] - 2026-07-27

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.9.0...v2.9.1

## [2.9.0] - 2026-07-27

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.8.0...v2.9.0

## [2.8.0] - 2026-07-27

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.7.1...v2.8.0

## [2.7.1] - 2026-07-27

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.7.0...v2.7.1

## [2.7.0] - 2026-07-27

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.6.8...v2.7.0

## [2.6.8] - 2026-07-27

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.6.6...v2.6.8

## [2.6.6] - 2026-07-27

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.6.5...v2.6.6

## [2.6.5] - 2026-07-27

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.6.4...v2.6.5

## [2.6.4] - 2026-07-27

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.6.3...v2.6.4

## [2.6.3] - 2026-07-27

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.6.2...v2.6.3

## [2.6.2] - 2026-07-27

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.6.1...v2.6.2

## [2.6.1] - 2026-07-27

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.6.0...v2.6.1

## [2.6.0] - 2026-07-27

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.5.3...v2.6.0

## [2.5.3] - 2026-07-25

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.5.2...v2.5.3

## [2.5.2] - 2026-07-25

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.5.1...v2.5.2

## [2.5.1] - 2026-07-25

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.5.0...v2.5.1

## [2.5.0] - 2026-07-25

## What's Changed
* feat: update download progress overlay by @m4tuna in https://github.com/m4tuna/fibertuner/pull/14


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.4.4...v2.5.0

## [2.4.4] - 2026-07-25

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.4.3...v2.4.4

## [2.4.3] - 2026-07-25

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.4.2...v2.4.3

## [2.4.2] - 2026-07-25

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.4.1...v2.4.2

## [2.4.1] - 2026-07-25

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.4.0...v2.4.1

## [2.4.0] - 2026-07-25

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.2.4...v2.4.0

## [2.2.4] - 2026-07-25

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.2.3...v2.2.4

## [2.2.3] - 2026-07-25

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.2.2...v2.2.3

## [2.2.2] - 2026-07-25

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.2.1...v2.2.2

## [2.2.1] - 2026-07-25

## What's Changed
* fix: add PNG type declarations and setPlexConfig plexAccountToken type by @m4tuna in https://github.com/m4tuna/fibertuner/pull/13


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.2.0...v2.2.1

## [2.2.0] - 2026-07-25

## What's Changed
* fix: use Plex account token for server license checks + settings sync by @m4tuna in https://github.com/m4tuna/fibertuner/pull/12


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.1.4...v2.2.0

## [2.1.4] - 2026-07-25

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.1.3...v2.1.4

## [2.1.3] - 2026-07-25

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.1.1...v2.1.3

## [2.1.1] - 2026-07-25

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.1.0...v2.1.1

## [2.1.0] - 2026-07-25

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.0.5...v2.1.0

## [2.0.5] - 2026-07-25

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.0.4...v2.0.5

## [2.0.4] - 2026-07-25

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.0.3...v2.0.4

## [2.0.3] - 2026-07-25

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.0.2...v2.0.3

## [2.0.2] - 2026-07-24

**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.0.1...v2.0.2

## [2.0.1] - 2026-07-24

## What's Changed
* feat: licensing system + automatic cloud sync by @m4tuna in https://github.com/m4tuna/fibertuner/pull/11


**Full Changelog**: https://github.com/m4tuna/fibertuner/compare/v2.0.0...v2.0.1

## [2.0.0] - 2026-07-20

## What's new in 2.0

- **AI Playlist Wizard** — describe a playlist in plain English; Claude builds it from your Plex library using tool calls
- **Lyric quotes** — rotating lines from your recently played albums on the home screen
- **AI Features settings** — bring your own Anthropic API key; choose Haiku, Sonnet, or Opus
- **Vinyl disc** — spinning record art in the fullscreen now playing view
- **Toast notifications** — rating feedback, shuffle errors, and more via sonner
- **UI polish** — play/pause shadow removed, About page cleaned up, and many small fixes

## [1.0.1] - 2026-07-17

## Fibertuner v1.0.1

### What's New

**Artist Info Panel**
- Now Playing card on the home page now shows an artist panel to the right — upcoming tour dates (via Bandsintown) or a Wikipedia bio excerpt with a drop cap
- Artist photo pulled from your Plex library, displayed as a circular image
- Click the artist photo or "Go to [Artist]" to jump directly to their artist page

**Smart Artist Links**
- Artist names throughout the app (Now Playing card, drawer, fullscreen) are now parsed correctly — "Nas feat. Anderson .Paak" renders as two separate links, each navigating to their own artist page
- Featured artist IDs are resolved from the current queue instantly, then searched in your library as a fallback
- Fixes artist names showing track-level credits (e.g. "Re-up Gang" instead of "Clipse") or full featuring strings as a single broken link

**Navigation**
- Clicking the Now Playing card on the home page now navigates to the currently playing context — album, radio station, or playlist — instead of toggling the drawer

**Cleanup**
- Removed the Now Playing card from the Radio page

**Requirements:** macOS 12+, Plex Media Server

## [1.0.0] - 2026-07-17

## Fibertuner v1.0.0

A full-featured macOS music player for Plex — lives in your menu bar, plays through Sonos or locally, generates AI radio stations, syncs lyrics, and downloads for offline.

### Highlights
- Library browser — artists, albums, playlists, favorites, downloads
- Sonos speaker control + local audio engine for offline playback
- AI radio stations seeded by artist or album with continuous playback
- Fullscreen now-playing with synced lyrics
- Gradient themes with animated color flow
- Cmd+K global search
- AI Playlist Creator
- Sleep timer & alarm
- Mini player mode

**Requirements:** macOS 12+, Plex Media Server
