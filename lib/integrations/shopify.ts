import crypto from 'crypto'

export type StoredShopifyAuth = {
  accessToken: string
  scopes: string
}

export const shopifyStores = new Map<string, StoredShopifyAuth>()

const getEnv = (key: string, fallback?: string) => {
  const v = process.env[key]
  if (!v && fallback === undefined) {
    throw new Error(`Missing env: ${key}`)
  }
  return v ?? fallback!
}

export function buildAuthUrl(shop: string, state: string) {
  const apiKey = getEnv('SHOPIFY_API_KEY')
  const scopes = getEnv('SHOPIFY_SCOPES')
  const redirectUri = getEnv('SHOPIFY_REDIRECT_URL')

  const url = new URL(`https://${shop}/admin/oauth/authorize`)
  url.searchParams.set('client_id', apiKey)
  url.searchParams.set('scope', scopes)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('state', state)
  // offline access mode for background processing
  url.searchParams.set('access_mode', 'offline')
  return url.toString()
}

export function verifyOAuthHmac(shop: string, searchParams: URLSearchParams) {
  const secret = getEnv('SHOPIFY_API_SECRET')
  const hmac = searchParams.get('hmac')
  if (!hmac) return false

  const sorted = new URLSearchParams()
  Array.from(searchParams.entries())
    .filter(([k]) => k !== 'hmac' && k !== 'signature')
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .forEach(([k, v]) => sorted.append(k, v))

  const message = sorted.toString()
  const computed = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex')

  return crypto.timingSafeEqual(Buffer.from(hmac, 'utf8'), Buffer.from(computed, 'utf8'))
}

export async function exchangeCodeForToken(shop: string, code: string) {
  const clientId = getEnv('SHOPIFY_API_KEY')
  const clientSecret = getEnv('SHOPIFY_API_SECRET')

  const resp = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  })
  if (!resp.ok) {
    throw new Error(`Failed token exchange: ${resp.status} ${await resp.text()}`)
  }
  const json = (await resp.json()) as { access_token: string; scope: string }
  return json
}

export function verifyWebhook(hmacHeader: string | null, rawBody: string) {
  const secret = getEnv('SHOPIFY_API_SECRET')
  if (!hmacHeader) return false
  const digest = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64')
  try {
    return crypto.timingSafeEqual(Buffer.from(hmacHeader, 'utf8'), Buffer.from(digest, 'utf8'))
  } catch {
    return false
  }
}

export async function shopifyGet<T>(shop: string, accessToken: string, path: string) {
  return shopifyRequest<T>(shop, accessToken, path, 'GET')
}

export async function shopifyPost<T>(shop: string, accessToken: string, path: string, body: any) {
  return shopifyRequest<T>(shop, accessToken, path, 'POST', body)
}

function getAppBaseUrl() {
  // Derive origin from redirect URL to avoid adding another env
  const redirect = getEnv('SHOPIFY_REDIRECT_URL')
  const u = new URL(redirect)
  return `${u.protocol}//${u.host}`
}

export async function registerDefaultWebhooks(shop: string, accessToken: string) {
  const base = getAppBaseUrl()
  const address = `${base}/api/integrations/shopify/webhooks`
  const topics = ['orders/create', 'orders/updated', 'refunds/create', 'products/update', 'inventory_levels/update']

  await Promise.all(
    topics.map((topic) =>
      shopifyPost<any>(shop, accessToken, 'webhooks.json', {
        webhook: { topic, address, format: 'json' },
      }).catch(() => undefined)
    )
  )
}

// Retry with exponential backoff and rate-limit handling
async function shopifyRequest<T>(shop: string, accessToken: string, path: string, method: 'GET'|'POST', body?: any, retries = 3): Promise<T> {
  const url = `https://${shop}/admin/api/2024-10/${path}`
  let lastErr: any
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, {
        method,
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      })
      if (resp.status === 429) {
        const ra = Number(resp.headers.get('Retry-After') || 1)
        await new Promise(r => setTimeout(r, (attempt + 1) * ra * 1000))
        continue
      }
      if (!resp.ok) {
        const text = await resp.text()
        throw new Error(`Shopify ${method} ${path} failed: ${resp.status} ${text}`)
      }
      return (await resp.json()) as T
    } catch (e) {
      lastErr = e
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, (attempt + 1) * 500))
        continue
      }
    }
  }
  throw lastErr
}


