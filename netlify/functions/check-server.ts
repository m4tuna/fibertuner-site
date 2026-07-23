import type { Config, Context } from "@netlify/functions"
import { getStore } from "@netlify/blobs"

type LicenseRecord = {
  licenseId: string
  plan: "annual" | "lifetime"
  activeUntil: string | null
}

type PlexResource = {
  clientIdentifier: string
  provides: string
}

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  let plexToken: string, plexMachineId: string
  try {
    const body = await req.json()
    plexToken = body.plexToken
    plexMachineId = body.plexMachineId
  } catch {
    return json({ licensed: false, error: "bad_request" }, 400)
  }

  if (!plexToken || !plexMachineId) {
    return json({ licensed: false, error: "missing_params" })
  }

  // Verify the user actually has access to this Plex server
  try {
    const plexRes = await fetch(
      `https://plex.tv/api/v2/resources?includeHttps=1&X-Plex-Token=${plexToken}&X-Plex-Client-Identifier=fibertuner`,
      { headers: { Accept: "application/json" } }
    )
    if (!plexRes.ok) {
      return json({ licensed: false, error: "plex_auth_failed" })
    }
    const resources: PlexResource[] = await plexRes.json()
    const hasAccess = resources.some((r) => r.clientIdentifier === plexMachineId)
    if (!hasAccess) {
      return json({ licensed: false, error: "no_plex_access" })
    }
  } catch {
    return json({ licensed: false, error: "plex_check_failed" })
  }

  // Check blob store for an active server license
  const store = getStore("licenses")
  const record = await store.get(`server:${plexMachineId}`, { type: "json" }) as LicenseRecord | null

  if (!record) {
    return json({ licensed: false })
  }

  if (record.activeUntil !== null && new Date(record.activeUntil) < new Date()) {
    return json({ licensed: false, expired: true })
  }

  return json({ licensed: true, plan: record.plan, activeUntil: record.activeUntil })
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export const config: Config = {
  path: "/api/license/check-server",
}
