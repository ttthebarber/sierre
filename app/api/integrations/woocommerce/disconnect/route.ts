import { NextRequest, NextResponse } from 'next/server';
import { deleteWooCommerceStore } from '@/lib/integrations/woocommerce';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  try {
    const { shop } = await req.json();
    
    if (!shop) {
      return NextResponse.json({ error: 'Shop domain is required' }, { status: 400 });
    }

    // Delete WooCommerce store credentials
    await deleteWooCommerceStore(shop);

    // Delete sync status
    await supabaseServer
      .from('sync_status')
      .delete()
      .eq('shop', shop)
      .eq('provider', 'woocommerce');

    return NextResponse.json({ 
      success: true, 
      message: `WooCommerce store ${shop} disconnected successfully.` 
    });
  } catch (error: any) {
    console.error('Failed to disconnect WooCommerce store:', error);
    return NextResponse.json({ error: error.message || 'Failed to disconnect WooCommerce store' }, { status: 500 });
  }
}
