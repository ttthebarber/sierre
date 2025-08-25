import { NextRequest, NextResponse } from 'next/server'
import { buildAuthUrl } from '@/lib/integrations/shopify'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const shop = searchParams.get('shop')
  if (!shop) return NextResponse.json({ error: 'Missing shop' }, { status: 400 })

  const state = Math.random().toString(36).slice(2)
  // TODO: persist state to validate on callback
  const url = buildAuthUrl(shop, state)
  return NextResponse.redirect(url)
}


