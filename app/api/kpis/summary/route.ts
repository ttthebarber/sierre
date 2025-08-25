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

  // Fetch orders in range
  const { data: orders, error } = await supabaseServer
    .from('orders')
    .select('total_price')
    .eq('shop', shop)
    .gte('created_at', start)
    .lte('created_at', end)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const orderCount = orders?.length ?? 0
  const revenue = (orders ?? []).reduce((sum, o: any) => sum + Number(o.total_price ?? 0), 0)
  const aov = orderCount > 0 ? revenue / orderCount : 0

  return NextResponse.json({ shop, range, start, end, revenue, orders: orderCount, aov })
}


