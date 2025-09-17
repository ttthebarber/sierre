import { NextRequest, NextResponse } from 'next/server'
import { getShopToken } from '@/lib/integrations/shopifyDb'
import { shopifyGet } from '@/lib/integrations/shopify'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const shop = body?.shop as string
  if (!shop) return NextResponse.json({ error: 'Missing shop' }, { status: 400 })
  const creds = await getShopToken(shop)
  if (!creds) return NextResponse.json({ error: 'Shop not connected' }, { status: 400 })

  // Example backfill: fetch orders in multiple pages (simplified)
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const ordersResp = await shopifyGet<any>(shop, creds.access_token, 'orders.json?status=any&limit=250')
    const orders = ordersResp?.orders ?? []
    // Persist minimal order headers and line items (idempotent upsert)
    const orderRows = orders.map((o: any) => ({
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
    if (orderRows.length) {
      await supabase.from('orders').upsert(orderRows, { onConflict: 'id' }).throwOnError()
    }

    const itemRows = orders.flatMap((o: any) =>
      (o.line_items || []).map((li: any) => ({
        id: String(li.id),
        order_id: String(o.id),
        product_id: li.product_id ? String(li.product_id) : null,
        variant_id: li.variant_id ? String(li.variant_id) : null,
        title: li.title ?? null,
        sku: li.sku ?? null,
        quantity: Number(li.quantity ?? 0),
        price: Number(li.price ?? 0),
      }))
    )
    if (itemRows.length) {
      await supabase.from('order_items').upsert(itemRows, { onConflict: 'id' }).throwOnError()
    }

    return NextResponse.json({ ok: true, fetched: orders.length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Backfill failed' }, { status: 500 })
  }
}


