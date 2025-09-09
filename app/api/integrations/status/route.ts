import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server"
import { createSupabaseServerClient } from '@/lib/supabaseServer'

// /api/integrations/status/route.ts - Check all integrations
export async function GET() {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
    try {
      const supabase = await createSupabaseServerClient()
      const { data: stores } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', userId)
  
      return NextResponse.json({
        stores: stores?.map(store => ({
          id: store.id,
          name: store.name,
          platform: store.platform,
          connected: store.is_connected,
          last_sync: store.last_sync_at,
          health: store.health_status
        })) || []
      })
    } catch {
      return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 })
    }
  }