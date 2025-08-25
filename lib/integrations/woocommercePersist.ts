import { supabaseServer } from '../supabaseServer';
import { transformWooCommerceOrder, transformWooCommerceProduct, transformWooCommerceProductVariant } from './woocommerce';

export async function persistWooCommerceOrder(order: any, shop: string) {
  const transformedOrder = transformWooCommerceOrder({ ...order, shop });
  
  const { data: orderData, error: orderError } = await supabaseServer
    .from('orders')
    .upsert(transformedOrder, { onConflict: 'id' })
    .select()
    .single();
  
  if (orderError) throw orderError;

  // Persist order items
  if (Array.isArray(order.line_items)) {
    for (const item of order.line_items) {
      const orderItem = {
        id: `${order.id}-${item.id}`,
        order_id: String(order.id),
        shop,
        product_id: item.product_id ? String(item.product_id) : null,
        variant_id: item.variation_id ? String(item.variation_id) : null,
        name: item.name || '',
        sku: item.sku || null,
        quantity: Number(item.quantity || 0),
        unit_price: Number(item.price || 0),
        total_price: Number(item.total || 0),
        tax_amount: Number(item.total_tax || 0),
        created_at: order.date_created || null,
      };

      await supabaseServer
        .from('order_items')
        .upsert(orderItem, { onConflict: 'id' });
    }
  }

  return orderData;
}

export async function persistWooCommerceProduct(product: any, shop: string) {
  const transformedProduct = transformWooCommerceProduct({ ...product, shop });
  
  const { data: productData, error: productError } = await supabaseServer
    .from('products')
    .upsert(transformedProduct, { onConflict: 'id' })
    .select()
    .single();
  
  if (productError) throw productError;

  // Persist product variants
  if (Array.isArray(product.variations)) {
    for (const variation of product.variations) {
      const variant = transformWooCommerceProductVariant(variation, String(product.id), shop);
      
      await supabaseServer
        .from('product_variants')
        .upsert(variant, { onConflict: 'id' });
    }
  }

  return productData;
}

export async function persistWooCommerceInventoryLevel(productId: string, shop: string, stockQuantity: number, stockStatus: string) {
  const { data, error } = await supabaseServer
    .from('inventory_snapshots')
    .insert({
      product_id: productId,
      shop,
      stock_quantity: stockQuantity,
      stock_status: stockStatus,
      recorded_at: new Date().toISOString(),
    })
    .select();

  if (error) throw error;
  return data[0];
}

export async function persistWooCommerceRefund(refund: any, shop: string) {
  const { data, error } = await supabaseServer
    .from('refunds')
    .upsert({
      id: String(refund.id),
      order_id: String(refund.order_id),
      amount: Number(refund.amount || 0),
      currency: refund.currency || 'USD',
      reason: refund.reason || null,
      created_at: refund.date_created || null,
    }, { onConflict: 'id' })
    .select();

  if (error) throw error;
  return data[0];
}
