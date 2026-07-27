import type { Config, Context } from "@netlify/functions"
import { getStore } from "@netlify/blobs"

type LicenseRecord = {
  licenseId: string
  plan: "annual" | "lifetime"
  activeUntil: string | null
}

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  let plexMachineId: string
  try {
    const body = await req.json()
    plexMachineId = body.plexMachineId
  } catch {
    return json({ licensed: false, error: "bad_request" }, 400)
  }

  if (!plexMachineId) {
    return json({ licensed: false, error: "missing_params" })
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
