import type { Config } from "@netlify/functions"
import { getStore } from "@netlify/blobs"
import { createHmac, timingSafeEqual } from "crypto"

type LicenseRecord = {
  licenseId: string
  plan: "annual" | "lifetime"
  activeUntil: string | null
}

type WebhookPayload = {
  meta: {
    event_name: string
    custom_data?: {
      plexMachineId?: string
      serverName?: string
    }
  }
  data: {
    id: string
    attributes: {
      renews_at?: string
      ends_at?: string
    }
  }
}

const SERVER_EVENTS_WRITE = new Set([
  "order_created",
  "subscription_created",
  "subscription_payment_success",
])

const SERVER_EVENTS_DELETE = new Set([
  "subscription_cancelled",
  "subscription_expired",
  "order_refunded",
])

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get("x-signature") ?? ""
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? ""

  // Verify HMAC-SHA256 signature
  try {
    const digest = createHmac("sha256", secret).update(rawBody).digest("hex")
    if (!timingSafeEqual(Buffer.from(digest), Buffer.from(signature))) {
      return new Response("Unauthorized", { status: 401 })
    }
  } catch {
    return new Response("Unauthorized", { status: 401 })
  }

  let payload: WebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new Response("Bad Request", { status: 400 })
  }

  const eventName = payload.meta.event_name
  const plexMachineId = payload.meta.custom_data?.plexMachineId

  // Only server-tier purchases include plexMachineId in custom_data
  if (!plexMachineId) {
    return new Response("OK", { status: 200 })
  }

  const store = getStore("licenses")
  const key = `server:${plexMachineId}`

  if (SERVER_EVENTS_WRITE.has(eventName)) {
    const isLifetime = eventName === "order_created"
    const activeUntil = isLifetime
      ? null
      : (payload.data.attributes.renews_at ?? payload.data.attributes.ends_at ?? null)

    const record: LicenseRecord = {
      licenseId: payload.data.id,
      plan: isLifetime ? "lifetime" : "annual",
      activeUntil,
    }

    await store.setJSON(key, record)
  } else if (SERVER_EVENTS_DELETE.has(eventName)) {
    await store.delete(key)
  }

  return new Response("OK", { status: 200 })
}

export const config: Config = {
  path: "/api/webhook/lemonsqueezy",
}
