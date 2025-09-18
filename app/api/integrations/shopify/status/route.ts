import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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

    // Check if user has any Shopify stores connected
    const { data: stores, error } = await supabaseAdmin
      .from('stores')
      .select('id, name, platform, connected_at')
      .eq('user_id', user.id)
      .eq('platform', 'shopify')
      .eq('is_connected', true);

    if (error) {
      console.error('Error fetching Shopify stores:', error);
      return NextResponse.json({ error: 'Failed to fetch store status' }, { status: 500 });
    }

    // Return connection status
    const isConnected = stores && stores.length > 0;
    
    return NextResponse.json({
      connected: isConnected,
      stores: stores || [],
      connected_at: isConnected ? stores[0]?.connected_at : null,
    });

  } catch (error) {
    console.error('Shopify status error:', error);
    return NextResponse.json({ error: 'Failed to check Shopify status' }, { status: 500 });
  }
}