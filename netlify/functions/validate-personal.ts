import type { Config } from "@netlify/functions"

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  let licenseKey: string, machineId: string | undefined
  try {
    const body = await req.json()
    licenseKey = body.licenseKey
    machineId = body.machineId
  } catch {
    return json({ valid: false, error: "bad_request" }, 400)
  }

  if (!licenseKey) {
    return json({ valid: false, error: "missing_license_key" })
  }

  const lsRes = await fetch("https://api.lemonsqueezy.com/v1/licenses/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ license_key: licenseKey }),
  })

  const data = await lsRes.json() as Record<string, unknown>

  if (!lsRes.ok || !data.valid) {
    const err = data.error as string | undefined
    return json({ valid: false, error: err ?? "invalid_key" })
  }

  const meta = data.meta as Record<string, unknown> | undefined
  const variantName = (meta?.variant_name as string | undefined) ?? ""
  const plan = variantName.toLowerCase().includes("lifetime") ? "lifetime" : "annual"
  const licenseKeyData = data.license_key as Record<string, unknown> | undefined
  const expiresAt = (licenseKeyData?.expires_at as string | null) ?? null

  return json({ valid: true, plan, expiresAt })
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export const config: Config = {
  path: "/api/license/validate-personal",
}
