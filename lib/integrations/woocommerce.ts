import { supabaseServer } from '../supabaseServer';

// WooCommerce REST API client with retry logic
export async function woocommerceGet(siteUrl: string, consumerKey: string, consumerSecret: string, endpoint: string, params: Record<string, any> = {}) {
  const url = new URL(`/wp-json/wc/v3/${endpoint}`, siteUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  
  let lastError: any;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (!response.ok) {
        throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      lastError = error;
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  throw lastError;
}

export async function woocommercePost(siteUrl: string, consumerKey: string, consumerSecret: string, endpoint: string, data: any) {
  const url = new URL(`/wp-json/wc/v3/${endpoint}`, siteUrl);
  
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  
  let lastError: any;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (!response.ok) {
        throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      lastError = error;
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  throw lastError;
}

// Database helpers for WooCommerce
export async function storeWooCommerceCredentials(shop: string, siteUrl: string, consumerKey: string, consumerSecret: string) {
  const { data, error } = await supabaseServer
    .from('woocommerce_stores')
    .upsert({ 
      shop, 
      site_url: siteUrl, 
      consumer_key: consumerKey, 
      consumer_secret: consumerSecret,
      created_at: new Date().toISOString()
    })
    .select();
  if (error) throw error;
  return data[0];
}

export async function getWooCommerceCredentials(shop: string) {
  const { data, error } = await supabaseServer
    .from('woocommerce_stores')
    .select('site_url, consumer_key, consumer_secret')
    .eq('shop', shop)
    .single();
  if (error) throw error;
  return data;
}

export async function updateWooCommerceSyncStatus(shop: string, lastOrdersSyncAt: string | null, lastProductsSyncAt: string | null) {
  const { data, error } = await supabaseServer
    .from('sync_status')
    .upsert({ 
      shop, 
      last_orders_sync_at: lastOrdersSyncAt, 
      last_products_sync_at: lastProductsSyncAt,
      provider: 'woocommerce'
    }, { onConflict: 'shop' })
    .select();
  if (error) throw error;
  return data[0];
}

export async function getWooCommerceSyncStatus(shop: string) {
  const { data, error } = await supabaseServer
    .from('sync_status')
    .select('*')
    .eq('shop', shop)
    .eq('provider', 'woocommerce')
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows found
  return data;
}

export async function deleteWooCommerceStore(shop: string) {
  const { error } = await supabaseServer
    .from('woocommerce_stores')
    .delete()
    .eq('shop', shop);
  if (error) throw error;
}

export async function logWooCommerceWebhook(shop: string, topic: string, payload: any) {
  const { data, error } = await supabaseServer
    .from('woocommerce_webhook_logs')
    .insert({ shop, topic, payload })
    .select();
  if (error) throw error;
  return data[0];
}

// Data transformation helpers
export function transformWooCommerceOrder(order: any) {
  return {
    id: String(order.id),
    shop: order.shop || null,
    order_number: order.number || String(order.id),
    customer_id: order.customer_id ? String(order.customer_id) : null,
    customer_email: order.billing?.email || null,
    customer_name: order.billing?.first_name && order.billing?.last_name 
      ? `${order.billing.first_name} ${order.billing.last_name}` 
      : order.billing?.first_name || order.billing?.last_name || null,
    total_amount: Number(order.total || 0),
    subtotal_amount: Number(order.subtotal || 0),
    tax_amount: Number(order.total_tax || 0),
    shipping_amount: Number(order.shipping_total || 0),
    discount_amount: Number(order.discount_total || 0),
    currency: order.currency || 'USD',
    status: order.status || 'pending',
    payment_method: order.payment_method || null,
    shipping_method: order.shipping_lines?.[0]?.method_title || null,
    created_at: order.date_created || null,
    updated_at: order.date_modified || null,
    billing_address: order.billing ? JSON.stringify(order.billing) : null,
    shipping_address: order.shipping ? JSON.stringify(order.shipping) : null,
  };
}

export function transformWooCommerceProduct(product: any) {
  return {
    id: String(product.id),
    shop: product.shop || null,
    name: product.name || '',
    description: product.description || null,
    short_description: product.short_description || null,
    sku: product.sku || null,
    price: Number(product.price || 0),
    regular_price: Number(product.regular_price || 0),
    sale_price: Number(product.sale_price || 0),
    status: product.status || 'draft',
    type: product.type || 'simple',
    weight: Number(product.weight || 0),
    dimensions: product.dimensions ? JSON.stringify(product.dimensions) : null,
    categories: product.categories ? JSON.stringify(product.categories) : null,
    tags: product.tags ? JSON.stringify(product.tags) : null,
    images: product.images ? JSON.stringify(product.images) : null,
    created_at: product.date_created || null,
    updated_at: product.date_modified || null,
  };
}

export function transformWooCommerceProductVariant(variant: any, productId: string, shop: string) {
  return {
    id: String(variant.id),
    product_id: productId,
    shop,
    sku: variant.sku || null,
    price: Number(variant.price || 0),
    regular_price: Number(variant.regular_price || 0),
    sale_price: Number(variant.sale_price || 0),
    weight: Number(variant.weight || 0),
    dimensions: variant.dimensions ? JSON.stringify(variant.dimensions) : null,
    attributes: variant.attributes ? JSON.stringify(variant.attributes) : null,
    stock_quantity: variant.stock_quantity || 0,
    stock_status: variant.stock_status || 'instock',
    manage_stock: variant.manage_stock || false,
    created_at: variant.date_created || null,
    updated_at: variant.date_modified || null,
  };
}
