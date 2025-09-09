import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const shop = searchParams.get('shop') ?? ''
  if (!shop) return NextResponse.json({ error: 'Missing shop' }, { status: 400 })

  const { data: store } = await supabaseServer
    .from('shopify_stores')
    .select('shop, created_at')
    .eq('shop', shop)
    .maybeSingle()

  const { data: sync } = await supabaseServer
    .from('sync_status')
    .select('orders_last_sync_at, products_last_sync_at, inventory_last_sync_at, updated_at')
    .eq('shop', shop)
    .maybeSingle()

  return NextResponse.json({
    shop,
    connected: !!store,
    connected_at: store?.created_at ?? null,
    sync: sync ?? null,
  })
}


