import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer'

// /api/kpis/portfolio/route.ts - Portfolio overview
export async function GET() {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
    try {
      const supabase = await createSupabaseServerClient()
      // Get all user stores
      const { data: stores } = await supabase
        .from('stores')
        .select('id, name, platform, health_status')
        .eq('user_id', userId)
        .eq('is_connected', true)
  
      if (!stores?.length) {
        return NextResponse.json({
          totalRevenue: 0,
          totalOrders: 0,
          avgAOV: 0,
          healthScore: 0,
          stores: []
        })
      }
  
      // Get last 30 days of orders
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const storeIds = stores.map(s => s.id)
      
      const { data: orders } = await supabase
        .from('orders')
        .select('store_id, total_price, created_at')
        .in('store_id', storeIds)
        .gte('created_at', thirtyDaysAgo)
  
      // Calculate metrics per store
      const storeMetrics = stores.map(store => {
        const storeOrders = orders?.filter(o => o.store_id === store.id) || []
        const revenue = storeOrders.reduce((sum, order) => sum + Number(order.total_price), 0)
        const orderCount = storeOrders.length
        const aov = orderCount > 0 ? revenue / orderCount : 0
        
        return {
          id: store.id,
          name: store.name,
          platform: store.platform,
          revenue,
          orders: orderCount,
          aov,
          health: revenue > 1000 ? 'good' : revenue > 500 ? 'warn' : 'bad',
          series: generateTimeSeries(storeOrders) // For charts
        }
      })
  
      const totalRevenue = storeMetrics.reduce((sum, s) => sum + s.revenue, 0)
      const totalOrders = storeMetrics.reduce((sum, s) => sum + s.orders, 0)
      const avgAOV = totalOrders > 0 ? totalRevenue / totalOrders : 0
      
      // Health score based on store performance
      const healthScore = Math.min(95, Math.max(10, 
        storeMetrics.reduce((sum, s) => sum + (s.health === 'good' ? 85 : s.health === 'warn' ? 60 : 35), 0) / storeMetrics.length
      ))
  
      return NextResponse.json({
        totalRevenue,
        totalOrders,
        avgAOV,
        healthScore: Math.round(healthScore),
        bestStoreId: storeMetrics.sort((a, b) => b.revenue - a.revenue)[0]?.id,
        attentionStoreId: storeMetrics.find(s => s.health !== 'good')?.id,
        stores: storeMetrics
      })
    } catch {
      return NextResponse.json({ error: 'Failed to fetch portfolio data' }, { status: 500 })
    }
  }
  
  function generateTimeSeries(orders: any[]) {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      return date.toISOString().split('T')[0]
    }).reverse()
  
    return last30Days.map(date => {
      const dayOrders = orders.filter(o => o.created_at.startsWith(date))
      const revenue = dayOrders.reduce((sum, o) => sum + Number(o.total_price), 0)
      const orderCount = dayOrders.length
      
      return {
        date,
        revenue,
        orders: orderCount,
        aov: orderCount > 0 ? revenue / orderCount : 0
      }
    })
  }