import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get the current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has any Shopify stores connected
    const { data: stores, error } = await supabase
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