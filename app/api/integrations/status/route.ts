import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// /api/integrations/status/route.ts - Check all integrations
export async function GET(request: NextRequest) {
    try {
      let response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
              response = NextResponse.next({
                request,
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              );
            },
          },
        }
      );
      
      // Get the current user from Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Create service role client for database operations
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: stores } = await supabaseAdmin
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