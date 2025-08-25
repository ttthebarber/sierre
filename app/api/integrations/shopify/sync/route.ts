import { NextRequest, NextResponse } from 'next/server'
import { shopifyGet } from '@/lib/integrations/shopify'
import { getShopToken } from '@/lib/integrations/shopifyDb'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const shop = body?.shop as string
  if (!shop) return NextResponse.json({ error: 'Missing shop' }, { status: 400 })
  const creds = await getShopToken(shop)
  if (!creds) return NextResponse.json({ error: 'Shop not connected' }, { status: 400 })

  try {
    // Incremental by updated_at if available
    const { data: sync } = await supabaseServer
      .from('sync_status')
      .select('orders_last_sync_at')
      .eq('shop', shop)
      .maybeSingle()

    const since = sync?.orders_last_sync_at ? `&updated_at_min=${encodeURIComponent(sync.orders_last_sync_at)}` : ''
    const resp = await shopifyGet<any>(shop, creds.access_token, `orders.json?status=any&limit=250${since}`)
    const fetched = resp?.orders ?? []

    // Persist minimal order headers
    if (fetched.length) {
      const rows = fetched.map((o: any) => ({
        id: String(o.id),
        shop,
        created_at: o.created_at,
        closed_at: o.closed_at ?? null,
        currency: o.currency ?? null,
        subtotal_price: Number(o.subtotal_price ?? 0),
        total_price: Number(o.total_price ?? 0),
        total_tax: Number(o.total_tax ?? 0),
        total_discounts: Number(o.total_discounts ?? 0),
        financial_status: o.financial_status ?? null,
        fulfillment_status: o.fulfillment_status ?? null,
        customer_id: o.customer?.id ? String(o.customer.id) : null,
        customer_email: o.email ?? null,
      }))
      await supabaseServer.from('orders').upsert(rows, { onConflict: 'id' }).throwOnError()

      const items = fetched.flatMap((o: any) => (o.line_items || []).map((li: any) => ({
        id: String(li.id),
        order_id: String(o.id),
        product_id: li.product_id ? String(li.product_id) : null,
        variant_id: li.variant_id ? String(li.variant_id) : null,
        title: li.title ?? null,
        sku: li.sku ?? null,
        quantity: Number(li.quantity ?? 0),
        price: Number(li.price ?? 0),
      })))
      if (items.length) {
        await supabaseServer.from('order_items').upsert(items, { onConflict: 'id' }).throwOnError()
      }
    }

    await supabaseServer
      .from('sync_status')
      .upsert({ shop, orders_last_sync_at: new Date().toISOString() })
      .throwOnError()

    return NextResponse.json({ ok: true, count: fetched.length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Sync failed' }, { status: 500 })
  }
}


