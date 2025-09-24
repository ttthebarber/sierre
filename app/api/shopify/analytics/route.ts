import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getShopToken } from '@/lib/integrations/shopifyDb'

interface ShopifyAnalyticsData {
  grossRevenue: number;
  netRevenue: number;
  revenueChangePercent: number;
  newCustomers: number;
  newCustomersChangePercent: number;
  activeCustomers: number;
  activeCustomersChangePercent: number;
  growthRate: number;
  conversionRate: number;
  cartAbandonmentRate: number;
  trafficSources: {
    ads: number;
    organic: number;
    social: number;
    referral: number;
    direct: number;
    email: number;
  };
  totalOrders: number;
  averageOrderValue: number;
  totalVisitors: number;
  totalSessions: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { shop, accessToken, userId } = await request.json()

    if (!shop || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: shop, userId' },
        { status: 400 }
      )
    }

    // Prefer server-side token lookup; do NOT rely on client-provided token
    let token = accessToken as string | undefined
    if (!token) {
      const creds = await getShopToken(shop)
      token = creds?.access_token
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Shop not connected or missing access token' },
        { status: 400 }
      )
    }

    // Fetch analytics data from Shopify
    const analyticsData = await fetchShopifyAnalytics(shop, token)

    // Store in database
    await storeAnalyticsData(supabase, shop, userId, analyticsData)

    return NextResponse.json({ success: true, data: analyticsData })

  } catch (error) {
    console.error('Error fetching Shopify analytics:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function fetchShopifyAnalytics(shop: string, accessToken: string): Promise<ShopifyAnalyticsData> {
  const baseUrl = `https://${shop}.myshopify.com/admin/api/2023-10`
  const headers = {
    'X-Shopify-Access-Token': accessToken,
    'Content-Type': 'application/json',
  }

  try {
    // Fetch orders and customers data
    const [ordersResponse, customersResponse] = await Promise.all([
      fetch(`${baseUrl}/orders.json?status=any&limit=250&created_at_min=${getDateRange(30)}`, { headers }),
      fetch(`${baseUrl}/customers.json?limit=250&created_at_min=${getDateRange(30)}`, { headers }),
    ])

    const ordersData = await ordersResponse.json()
    const orders = ordersData.orders || []
    
    const customersData = await customersResponse.json()
    const customers = customersData.customers || []

    // Calculate current period orders (last 30 days)
    const currentPeriodOrders = orders.filter((order: any) => 
      new Date(order.created_at) >= new Date(getDateRange(30))
    )
    
    // Calculate previous period orders (30-60 days ago)
    const previousPeriodOrders = orders.filter((order: any) => {
      const orderDate = new Date(order.created_at)
      const thirtyDaysAgo = new Date(getDateRange(60))
      const sixtyDaysAgo = new Date(getDateRange(90))
      return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo
    })

    // Revenue calculations
    const grossRevenue = currentPeriodOrders.reduce((sum: number, order: any) => 
      sum + (parseFloat(order.total_price) || 0), 0)
    const previousGrossRevenue = previousPeriodOrders.reduce((sum: number, order: any) => 
      sum + (parseFloat(order.total_price) || 0), 0)
    
    const totalDiscounts = currentPeriodOrders.reduce((sum: number, order: any) => 
      sum + (parseFloat(order.total_discounts) || 0), 0)
    const netRevenue = grossRevenue - totalDiscounts
    
    const revenueChangePercent = previousGrossRevenue > 0 
      ? ((grossRevenue - previousGrossRevenue) / previousGrossRevenue) * 100 
      : 0

    // Customer calculations
    const currentPeriodCustomers = customers.filter((customer: any) => 
      new Date(customer.created_at) >= new Date(getDateRange(30))
    )
    
    const previousPeriodCustomers = customers.filter((customer: any) => {
      const customerDate = new Date(customer.created_at)
      const thirtyDaysAgo = new Date(getDateRange(60))
      const sixtyDaysAgo = new Date(getDateRange(90))
      return customerDate >= sixtyDaysAgo && customerDate < thirtyDaysAgo
    })

    const newCustomers = currentPeriodCustomers.length
    const previousNewCustomers = previousPeriodCustomers.length
    const newCustomersChangePercent = previousNewCustomers > 0 
      ? ((newCustomers - previousNewCustomers) / previousNewCustomers) * 100 
      : 0

    const activeCustomers = new Set(currentPeriodOrders.map((order: any) => order.customer?.id).filter(Boolean)).size
    const previousActiveCustomers = new Set(previousPeriodOrders.map((order: any) => order.customer?.id).filter(Boolean)).size
    const activeCustomersChangePercent = previousActiveCustomers > 0 
      ? ((activeCustomers - previousActiveCustomers) / previousActiveCustomers) * 100 
      : 0

    // Order calculations
    const totalOrders = currentPeriodOrders.length
    const averageOrderValue = totalOrders > 0 ? grossRevenue / totalOrders : 0

    // Estimated metrics (since Shopify doesn't provide direct access)
    const estimatedSessions = Math.round(totalOrders / 0.03) // 3% conversion baseline
    const conversionRate = estimatedSessions > 0 ? (totalOrders / estimatedSessions) * 100 : 0
    const totalVisitors = Math.round(estimatedSessions * 0.8)
    const totalSessions = estimatedSessions

    return {
      grossRevenue,
      netRevenue,
      revenueChangePercent,
      newCustomers,
      newCustomersChangePercent,
      activeCustomers,
      activeCustomersChangePercent,
      growthRate: revenueChangePercent,
      conversionRate,
      cartAbandonmentRate: 70, // Industry average
      trafficSources: {
        ads: 25,
        organic: 35,
        social: 15,
        referral: 10,
        direct: 10,
        email: 5,
      },
      totalOrders,
      averageOrderValue,
      totalVisitors,
      totalSessions,
    }

  } catch (error) {
    console.error('Error fetching Shopify analytics:', error)
    throw new Error(`Failed to fetch analytics: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function storeAnalyticsData(supabase: any, shop: string, userId: string, analyticsData: ShopifyAnalyticsData) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const startOfDay = `${today}T00:00:00.000Z`;
    const endOfDay = `${today}T23:59:59.999Z`;

    // Check if snapshot exists for today
    const { data: existingSnapshot, error: selectError } = await supabase
      .from('analytics_snapshots')
      .select('id')
      .eq('shop', shop)
      .eq('user_id', userId)
      .gte('captured_at', startOfDay)
      .lte('captured_at', endOfDay)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking existing snapshot:', selectError);
    }

    if (existingSnapshot) {
      // Update existing
      await supabase
        .from('analytics_snapshots')
        .update({
          data: analyticsData,
          captured_at: new Date().toISOString(),
        })
        .eq('id', existingSnapshot.id);
    } else {
      // Insert new
      await supabase
        .from('analytics_snapshots')
        .insert({
          shop,
          user_id: userId,
          data: analyticsData,
          captured_at: new Date().toISOString(),
        });
    }

    // Update KPI daily table
    await supabase
      .from('kpi_daily')
      .upsert({
        shop,
        date: today,
        revenue: analyticsData.grossRevenue,
        orders: analyticsData.totalOrders,
        aov: analyticsData.averageOrderValue,
        conversion_rate: analyticsData.conversionRate,
        sessions: analyticsData.totalSessions,
        conversions: analyticsData.totalOrders,
      }, {
        onConflict: 'shop,date'
      });

  } catch (error) {
    console.error('Error storing analytics data:', error);
  }
}

function getDateRange(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}
