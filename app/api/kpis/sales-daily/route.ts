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

  const { data, error } = await supabaseServer
    .from('orders')
    .select('created_at, total_price')
    .eq('shop', shop)
    .gte('created_at', start)
    .lte('created_at', end)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const byDay = new Map<string, { day: string; revenue: number; orders: number }>()
  for (const row of (data ?? []) as any[]) {
    const day = new Date(row.created_at).toISOString().slice(0, 10)
    const entry = byDay.get(day) ?? { day, revenue: 0, orders: 0 }
    entry.revenue += Number(row.total_price ?? 0)
    entry.orders += 1
    byDay.set(day, entry)
  }

  const series = Array.from(byDay.values()).sort((a, b) => a.day.localeCompare(b.day))
  return NextResponse.json({ shop, range, start, end, series })
}


