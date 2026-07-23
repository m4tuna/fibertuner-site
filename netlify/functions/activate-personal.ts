import type { Config } from "@netlify/functions"

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  let licenseKey: string, machineId: string, machineName: string
  try {
    const body = await req.json()
    licenseKey = body.licenseKey
    machineId = body.machineId
    machineName = body.machineName
  } catch {
    return json({ success: false, error: "bad_request" }, 400)
  }

  if (!licenseKey || !machineId) {
    return json({ success: false, error: "missing_params" })
  }

  const lsRes = await fetch("https://api.lemonsqueezy.com/v1/licenses/activate", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      license_key: licenseKey,
      instance_name: machineName || machineId,
    }),
  })

  const data = await lsRes.json() as Record<string, unknown>

  if (!lsRes.ok || !data.activated) {
    const err = data.error as string | undefined
    return json({ success: false, error: err ?? "activation_failed" })
  }

  const instance = data.instance as Record<string, unknown> | undefined
  return json({ success: true, activationId: (instance?.id as string) ?? machineId })
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export const config: Config = {
  path: "/api/license/activate-personal",
}
