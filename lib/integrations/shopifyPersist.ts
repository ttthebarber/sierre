import { supabaseServer } from '@/lib/supabaseServer'

export async function upsertProductAndVariants(shop: string, product: any) {
  if (!product || !product.id) return
  const productRow = {
    id: String(product.id),
    shop,
    title: product.title ?? null,
    product_type: product.product_type ?? null,
    vendor: product.vendor ?? null,
    status: product.status ?? null,
    created_at: product.created_at ?? null,
    updated_at: product.updated_at ?? null,
  }
  await supabaseServer.from('products').upsert(productRow, { onConflict: 'id' }).throwOnError()

  const variants = Array.isArray(product.variants) ? product.variants : []
  if (variants.length) {
    const rows = variants.map((v: any) => ({
      id: String(v.id),
      product_id: String(product.id),
      title: v.title ?? null,
      sku: v.sku ?? null,
      price: v.price != null ? Number(v.price) : null,
      inventory_quantity: typeof v.inventory_quantity === 'number' ? v.inventory_quantity : null,
    }))
    await supabaseServer.from('product_variants').upsert(rows, { onConflict: 'id' }).throwOnError()
  }
}

export async function insertInventorySnapshot(shop: string, payload: any) {
  // Shopify inventory_levels/update payload includes: inventory_item_id, location_id, available
  const quantity = typeof payload?.available === 'number' ? payload.available : null
  if (quantity == null) return
  await supabaseServer.from('inventory_snapshots').insert({
    shop,
    product_id: null,
    variant_id: null,
    quantity,
  }).throwOnError()
}


