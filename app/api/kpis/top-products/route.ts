import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

function rangeToDates(range?: string) {
  const now = new Date()
  const end = now.toISOString()
  let startDate = new Date()
  switch (range) {
    case '7d':
      startDate.setDate(now.getDate() - 7)
      break
    case '30d':
      startDate.setDate(now.getDate() - 30)
      break
    case '90d':
      startDate.setDate(now.getDate() - 90)
      break
    default:
      startDate.setDate(now.getDate() - 30)
  }
  const start = startDate.toISOString()
  return { start, end }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const shop = searchParams.get('shop') ?? ''
  if (!shop) return NextResponse.json({ error: 'Missing shop' }, { status: 400 })
  const range = searchParams.get('range') ?? '30d'
  const { start, end } = rangeToDates(range)

  // Select order_items joined by orders for date filtering
  const { data, error } = await supabaseServer
    .from('order_items')
    .select('product_id, title, quantity, price, orders!inner(created_at, shop)')
    .eq('orders.shop', shop)
    .gte('orders.created_at', start)
    .lte('orders.created_at', end)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const map = new Map<string, { product_id: string; title: string | null; quantity: number; revenue: number }>()
  for (const row of data as any[]) {
    const key = row.product_id ?? row.title ?? 'unknown'
    const entry = map.get(key) ?? { product_id: String(row.product_id ?? 'unknown'), title: row.title ?? 'Unknown', quantity: 0, revenue: 0 }
    entry.quantity += Number(row.quantity ?? 0)
    entry.revenue += Number(row.price ?? 0) * Number(row.quantity ?? 0)
    map.set(key, entry)
  }

  const top = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
  return NextResponse.json({ shop, range, start, end, products: top })
}


