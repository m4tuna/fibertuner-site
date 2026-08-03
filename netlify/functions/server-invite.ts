import type { Config } from "@netlify/functions"

const SUPABASE_URL = 'https://rfvcpnnbqihfwatrxhib.supabase.co'

export default async (req: Request) => {
  if (req.method !== "GET") {
    return json({ error: "method_not_allowed" }, 405)
  }

  const url = new URL(req.url)
  const machineId = url.searchParams.get('server')

  if (!machineId || machineId.trim() === '') {
    return json({ error: "missing_server_param" }, 400)
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    console.error('[server-invite] SUPABASE_SERVICE_ROLE_KEY not set')
    return json({ error: "server_error" }, 500)
  }

  // Query profiles table using service role key — bypasses RLS entirely.
  // We filter only on server_machine_id (not server_owned) because profiles
  // written by older app versions may have server_owned = null even for real
  // server owners, which would cause eq.true to silently exclude them.
  const query = new URLSearchParams({
    select: 'plex_username,server_name',
    server_machine_id: `eq.${machineId}`,
    limit: '1',
  })
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?${query}`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: 'application/json',
      },
    }
  )

  if (!res.ok) {
    const text = await res.text()
    console.error('[server-invite] Supabase error:', res.status, text)
    return json({ error: "supabase_error" }, 502)
  }

  const rows: Array<{ plex_username: string; server_name: string }> = await res.json()

  if (!rows || rows.length === 0) {
    return json({ found: false }, 200)
  }

  const row = rows[0]
  return json({
    found: true,
    username: row.plex_username ?? '',
    serverName: row.server_name ?? '',
  }, 200)
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
    },
  })
}

export const config: Config = {
  path: "/api/server-invite",
}
