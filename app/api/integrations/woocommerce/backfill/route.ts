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
    const { shop, days = 30 } = await req.json();
    
    if (!shop) {
      return NextResponse.json({ error: 'Shop domain is required' }, { status: 400 });
    }

    // Get stored credentials
    const credentials = await getWooCommerceCredentials(shop);
    if (!credentials) {
      return NextResponse.json({ error: 'WooCommerce store not found' }, { status: 404 });
    }

    const { site_url, consumer_key, consumer_secret } = credentials;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let lastOrdersSyncAt = null;
    let lastProductsSyncAt = null;
    let ordersCount = 0;
    let productsCount = 0;

    // Backfill orders
    try {
      let page = 1;
      let hasMoreOrders = true;
      
      while (hasMoreOrders) {
        const orders = await woocommerceGet(site_url, consumer_key, consumer_secret, 'orders', {
          per_page: 100,
          page,
          after: startDate.toISOString(),
          status: 'completed,processing,on-hold,cancelled,refunded',
          orderby: 'date',
          order: 'desc'
        });

        if (Array.isArray(orders) && orders.length > 0) {
          for (const order of orders) {
            await persistWooCommerceOrder(order, shop);
            ordersCount++;
          }
          page++;
        } else {
          hasMoreOrders = false;
        }
      }
      lastOrdersSyncAt = new Date().toISOString();
    } catch (error) {
      console.error('Failed to backfill orders:', error);
    }

    // Backfill products
    try {
      let page = 1;
      let hasMoreProducts = true;
      
      while (hasMoreProducts) {
        const products = await woocommerceGet(site_url, consumer_key, consumer_secret, 'products', {
          per_page: 100,
          page,
          status: 'publish,draft',
          orderby: 'date',
          order: 'desc'
        });

        if (Array.isArray(products) && products.length > 0) {
          for (const product of products) {
            await persistWooCommerceProduct(product, shop);
            productsCount++;
          }
          page++;
        } else {
          hasMoreProducts = false;
        }
      }
      lastProductsSyncAt = new Date().toISOString();
    } catch (error) {
      console.error('Failed to backfill products:', error);
    }

    // Update sync status
    await updateWooCommerceSyncStatus(shop, lastOrdersSyncAt, lastProductsSyncAt);

    return NextResponse.json({ 
      success: true, 
      message: `WooCommerce store ${shop} backfilled successfully.`,
      orders_count: ordersCount,
      products_count: productsCount,
      last_orders_sync_at: lastOrdersSyncAt,
      last_products_sync_at: lastProductsSyncAt
    });
  } catch (error: any) {
    console.error('Failed to backfill WooCommerce store:', error);
    return NextResponse.json({ error: error.message || 'Failed to backfill WooCommerce store' }, { status: 500 });
  }
}
