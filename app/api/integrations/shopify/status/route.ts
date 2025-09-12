import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();

    // Check if user has any Shopify stores connected
    const { data: stores, error } = await supabase
      .from('stores')
      .select('id, name, platform, connected_at')
      .eq('user_id', userId)
      .eq('platform', 'shopify')
      .eq('connected', true);

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