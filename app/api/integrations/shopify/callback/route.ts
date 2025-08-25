import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, verifyOAuthHmac, registerDefaultWebhooks } from '@/lib/integrations/shopify'
import { saveShopToken } from '@/lib/integrations/shopifyDb'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const params = url.searchParams
  const shop = params.get('shop')
  const code = params.get('code')
  const state = params.get('state')

  if (!shop || !code || !state) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  // TODO: verify state
  if (!verifyOAuthHmac(shop, params)) {
    return NextResponse.json({ error: 'HMAC verification failed' }, { status: 400 })
  }

  try {
    const token = await exchangeCodeForToken(shop, code)
    await saveShopToken(shop, token.access_token, token.scope)
    await registerDefaultWebhooks(shop, token.access_token)
    return NextResponse.redirect(new URL('/integrations?connected=shopify', req.url))
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Token exchange failed' }, { status: 500 })
  }
}


