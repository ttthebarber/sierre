import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { shop, date, source, amount, notes } = body || {}
  if (!shop || !date || !source) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  try {
    await supabaseServer
      .from('fees_daily')
      .upsert({ shop, date, source, amount: Number(amount ?? 0), notes: notes ?? null }, { onConflict: 'shop,date,source' })
      .throwOnError()
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Failed to save fee' }, { status: 500 })
  }
}


