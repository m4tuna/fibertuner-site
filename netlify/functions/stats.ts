import type { Config } from "@netlify/functions"

const SUPABASE_URL = 'https://rfvcpnnbqihfwatrxhib.supabase.co'

export default async (req: Request) => {
  if (req.method !== "GET") {
    return json({ error: "method_not_allowed" }, 405)
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    console.error('[stats] SUPABASE_SERVICE_ROLE_KEY not set')
    return json({ error: "server_error" }, 500)
  }

  // Query profiles table using service role key — bypasses RLS entirely
  const query = new URLSearchParams({
    select: 'user_id,plex_uuid,plex_email,plex_username,plex_thumb,server_owned,server_name,server_machine_id,app_version,updated_at',
    order: 'updated_at.desc',
  })

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?${query}`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: 'application/json',
        'Accept-Profile': 'public',
      },
    }
  )

  if (!res.ok) {
    const text = await res.text()
    console.error('[stats] Supabase error:', res.status, text)
    return json({ error: "supabase_error" }, 502)
  }

  const rows = await res.json()
  return json({ profiles: rows ?? [] }, 200)
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  })
}

export const config: Config = {
  path: "/api/stats",
}
