import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const shop = body?.shop as string
  if (!shop) return NextResponse.json({ error: 'Missing shop' }, { status: 400 })

  try {
    await supabaseServer.from('shopify_stores').delete().eq('shop', shop).throwOnError()
    await supabaseServer.from('sync_status').delete().eq('shop', shop).throwOnError()
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Disconnect failed' }, { status: 500 })
  }
}


