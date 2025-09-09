import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const shop = (body?.shop as string) || ''
  if (!shop) return NextResponse.json({ error: 'Missing shop' }, { status: 400 })

  // Aggregate yesterday (or today if specified)
  const dateStr = (body?.date as string) || new Date().toISOString().slice(0, 10)
  const start = new Date(dateStr + 'T00:00:00.000Z').toISOString()
  const end = new Date(dateStr + 'T23:59:59.999Z').toISOString()

  const { data: orders, error } = await supabaseServer
    .from('orders')
    .select('total_price')
    .eq('shop', shop)
    .gte('created_at', start)
    .lte('created_at', end)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const orderCount = orders?.length ?? 0
  const revenue = (orders ?? []).reduce((s: number, o: any) => s + Number(o.total_price ?? 0), 0)
  const aov = orderCount > 0 ? revenue / orderCount : 0

  // Fees (sum for the day)
  const { data: fees } = await supabaseServer
    .from('fees_daily')
    .select('amount')
    .eq('shop', shop)
    .eq('date', dateStr)

  const feesTotal = (fees ?? []).reduce((s: number, f: any) => s + Number(f.amount ?? 0), 0)

  await supabaseServer
    .from('kpi_daily')
    .upsert({ shop, date: dateStr, revenue, orders: orderCount, aov, refunds: 0, sessions: 0, conversions: 0, conversion_rate: 0, ad_spend: 0, roas: 0, cac: 0 })
    .throwOnError()

  return NextResponse.json({ ok: true, shop, date: dateStr, revenue, orders: orderCount, aov, fees: feesTotal })
}


