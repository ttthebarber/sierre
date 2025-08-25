import { NextRequest, NextResponse } from 'next/server';
import { getWooCommerceCredentials, getWooCommerceSyncStatus } from '@/lib/integrations/woocommerce';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get('shop');

    if (!shop) {
      return NextResponse.json({ error: 'Shop domain is required' }, { status: 400 });
    }

    const credentials = await getWooCommerceCredentials(shop);
    const syncStatus = await getWooCommerceSyncStatus(shop);

    return NextResponse.json({
      connected: !!credentials,
      connected_at: credentials ? new Date().toISOString() : null, // We don't store created_at in the current schema
      last_orders_sync_at: syncStatus?.last_orders_sync_at || null,
      last_products_sync_at: syncStatus?.last_products_sync_at || null,
    });
  } catch (error: any) {
    console.error('Failed to get WooCommerce status:', error);
    return NextResponse.json({ error: error.message || 'Failed to get WooCommerce status' }, { status: 500 });
  }
}
