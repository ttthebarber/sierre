import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import type { SupabaseClient } from '@supabase/supabase-js'
// /api/integrations/sync/route.ts - Universal sync endpoint
export async function POST(request: NextRequest) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
    try {
      const { storeId, platform } = await request.json()
      
      const supabase = await createSupabaseServerClient()
      const { data: store } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .eq('user_id', userId)
        .single()
  
      if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  
      let syncedCount = 0
  
      if (platform === 'shopify') {
        syncedCount = await syncShopifyOrders(supabase, store)
      }
  
      // Update last sync time
      await supabase
        .from('stores')
        .update({ 
          last_sync_at: new Date().toISOString(),
          health_status: 'good' 
        })
        .eq('id', storeId)
  
      return NextResponse.json({ synced: syncedCount })
    } catch (error) {
      try {
        const supabase = await createSupabaseServerClient()
        const { storeId } = await request.json()
        await supabase
          .from('stores')
          .update({ health_status: 'bad' })
          .eq('id', storeId)
      } catch (updateError) {
        console.error('Failed to update store health status:', updateError)
      }
        
      return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
    }
  }
  
  async function syncShopifyOrders(supabase: SupabaseClient, store: any) {
    const ordersResponse = await fetch(`https://${store.name}.myshopify.com/admin/api/2023-01/orders.json?limit=250&status=any`, {
      headers: { 'X-Shopify-Access-Token': store.access_token }
    })
    const { orders } = await ordersResponse.json()
  
    for (const order of orders) {
      await supabase.from('orders').upsert({
        store_id: store.id,
        external_id: order.id.toString(),
        total_price: parseFloat(order.total_price),
        currency: order.currency,
        status: order.financial_status,
        customer_email: order.email,
        line_items_count: order.line_items?.length || 0,
        created_at: order.created_at
      }, {
        onConflict: 'store_id,external_id'
      })
    }
  
    return orders.length
  }
  