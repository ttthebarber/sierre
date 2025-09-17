import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer'

// /api/integrations/status/route.ts - Check all integrations
export async function GET() {
    try {
      const supabase = await createSupabaseServerClient()
      
      // Get the current user from Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { data: stores } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
  
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