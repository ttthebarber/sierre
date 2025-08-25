import { NextRequest, NextResponse } from 'next/server';
import { 
  getWooCommerceCredentials, 
  woocommerceGet, 
  updateWooCommerceSyncStatus 
} from '@/lib/integrations/woocommerce';
import { 
  persistWooCommerceOrder, 
  persistWooCommerceProduct 
} from '@/lib/integrations/woocommercePersist';

export async function POST(req: NextRequest) {
  try {
    const { shop } = await req.json();
    
    if (!shop) {
      return NextResponse.json({ error: 'Shop domain is required' }, { status: 400 });
    }

    // Get stored credentials
    const credentials = await getWooCommerceCredentials(shop);
    if (!credentials) {
      return NextResponse.json({ error: 'WooCommerce store not found' }, { status: 404 });
    }

    const { site_url, consumer_key, consumer_secret } = credentials;
    let lastOrdersSyncAt = null;
    let lastProductsSyncAt = null;

    // Sync orders
    try {
      const orders = await woocommerceGet(site_url, consumer_key, consumer_secret, 'orders', {
        per_page: 100,
        status: 'completed,processing,on-hold',
        orderby: 'date',
        order: 'desc'
      });

      if (Array.isArray(orders)) {
        for (const order of orders) {
          await persistWooCommerceOrder(order, shop);
        }
        lastOrdersSyncAt = new Date().toISOString();
      }
    } catch (error) {
      console.error('Failed to sync orders:', error);
    }

    // Sync products
    try {
      const products = await woocommerceGet(site_url, consumer_key, consumer_secret, 'products', {
        per_page: 100,
        status: 'publish',
        orderby: 'date',
        order: 'desc'
      });

      if (Array.isArray(products)) {
        for (const product of products) {
          await persistWooCommerceProduct(product, shop);
        }
        lastProductsSyncAt = new Date().toISOString();
      }
    } catch (error) {
      console.error('Failed to sync products:', error);
    }

    // Update sync status
    await updateWooCommerceSyncStatus(shop, lastOrdersSyncAt, lastProductsSyncAt);

    return NextResponse.json({ 
      success: true, 
      message: `WooCommerce store ${shop} synced successfully.`,
      last_orders_sync_at: lastOrdersSyncAt,
      last_products_sync_at: lastProductsSyncAt
    });
  } catch (error: any) {
    console.error('Failed to sync WooCommerce store:', error);
    return NextResponse.json({ error: error.message || 'Failed to sync WooCommerce store' }, { status: 500 });
  }
}
