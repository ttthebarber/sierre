import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhook } from '@/lib/integrations/shopify'
import { logWebhook } from '@/lib/integrations/shopifyDb'
import { supabaseServer } from '@/lib/supabaseServer'
import { insertInventorySnapshot, upsertProductAndVariants } from '@/lib/integrations/shopifyPersist'

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const hmac = req.headers.get('X-Shopify-Hmac-Sha256')
  if (!verifyWebhook(hmac, raw)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
  }

  const topic = req.headers.get('X-Shopify-Topic') || 'unknown'
  const shop = req.headers.get('X-Shopify-Shop-Domain') || 'unknown'
  const payload = JSON.parse(raw)
  try {
    await logWebhook(shop, topic, payload)
  } catch {}

  // Optional: minimal persistence on order events (idempotent upsert)
  if (topic === 'orders/create' || topic === 'orders/updated') {
    const o = payload?.id ? payload : payload?.order
    if (o?.id) {
      try {
        await supabaseServer.from('orders').upsert({
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
        }).throwOnError()
      } catch {}
    }
  }

  // Track inventory/product changes for future KPIs
  if (topic === 'products/update') {
    try { await upsertProductAndVariants(shop, payload) } catch {}
  }
  if (topic === 'inventory_levels/update') {
    try { await insertInventorySnapshot(shop, payload) } catch {}
  }

  if (topic === 'refunds/create') {
    const r = payload
    try {
      const orderId = r?.order_id ? String(r.order_id) : r?.order?.id ? String(r.order.id) : null
      const refundId = r?.id ? String(r.id) : null
      if (orderId && refundId) {
        // Derive amount from transactions if present, else sum line items (best-effort)
        let amount = 0
        if (Array.isArray(r.transactions)) {
          const tx = r.transactions.find((t: any) => t.kind === 'refund')
          if (tx?.amount) amount = Number(tx.amount)
        }
        if (!amount && Array.isArray(r.refund_line_items)) {
          amount = r.refund_line_items.reduce((s: number, li: any) => s + Number(li?.subtotal ?? 0), 0)
        }
        await supabaseServer.from('refunds').upsert({
          id: refundId,
          order_id: orderId,
          amount,
          currency: r?.currency ?? null,
          reason: r?.note ?? null,
          created_at: r?.created_at ?? null,
        }, { onConflict: 'id' }).throwOnError()
      }
    } catch {}
  }
  return NextResponse.json({ ok: true, topic, shop })
}


