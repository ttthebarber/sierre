import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// /api/analytics/customers/route.ts - Customer analytics and acquisition metrics
export async function GET(request: NextRequest) {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Get the current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create service role client for database operations
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user's connected stores
    const { data: stores } = await supabaseAdmin
      .from('stores')
      .select('id, name, platform, access_token')
      .eq('user_id', user.id)
      .eq('platform', 'shopify')
      .eq('is_connected', true);

    if (!stores || stores.length === 0) {
      return NextResponse.json({
        totalCustomers: 0,
        newCustomersThisMonth: 0,
        customerAcquisitionRate: 0,
        repeatCustomerRate: 0,
        customerLifetimeValue: 0,
        averageOrderValue: 0,
        customerRetentionRate: 0,
        stores: []
      });
    }

    // Fetch customer data from Shopify for each store
    const storeMetrics = [];
    let totalCustomers = 0;
    let totalNewCustomersThisMonth = 0;
    let totalOrders = 0;
    let totalRevenue = 0;

    for (const store of stores) {
      try {
        // Fetch customers from Shopify
        const customersResponse = await fetch(
          `https://${store.name}.myshopify.com/admin/api/2023-01/customers.json?limit=250`,
          {
            headers: { 'X-Shopify-Access-Token': store.access_token }
          }
        );

        if (!customersResponse.ok) {
          console.error(`Failed to fetch customers for store ${store.name}: ${customersResponse.status}`);
          continue;
        }

        const customersData = await customersResponse.json();
        const customers = customersData.customers || [];

        // Fetch orders for this store to calculate customer metrics
        const ordersResponse = await fetch(
          `https://${store.name}.myshopify.com/admin/api/2023-01/orders.json?limit=250&status=any`,
          {
            headers: { 'X-Shopify-Access-Token': store.access_token }
          }
        );

        if (!ordersResponse.ok) {
          console.error(`Failed to fetch orders for store ${store.name}: ${ordersResponse.status}`);
          continue;
        }

        const ordersData = await ordersResponse.json();
        const orders = ordersData.orders || [];

        // Calculate customer metrics
        const storeCustomers = customers.length;
        const currentDate = new Date();
        const oneMonthAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
        
        // New customers this month
        const newCustomersThisMonth = customers.filter((customer: any) => {
          const createdAt = new Date(customer.created_at);
          return createdAt >= oneMonthAgo;
        }).length;

        // Calculate repeat customers (customers with more than 1 order)
        const customerOrderCounts: Record<string, number> = {};
        orders.forEach((order: any) => {
          if (order.customer && order.customer.id) {
            customerOrderCounts[order.customer.id] = (customerOrderCounts[order.customer.id] || 0) + 1;
          }
        });

        const repeatCustomers = Object.values(customerOrderCounts).filter((count: number) => count > 1).length;
        const repeatCustomerRate = storeCustomers > 0 ? (repeatCustomers / storeCustomers) * 100 : 0;

        // Customer acquisition rate (new customers / total customers * 100)
        const customerAcquisitionRate = storeCustomers > 0 ? (newCustomersThisMonth / storeCustomers) * 100 : 0;

        // Calculate customer lifetime value and average order value
        const storeOrders = orders.length;
        const storeRevenue = orders.reduce((sum: number, order: any) => sum + parseFloat(order.total_price || 0), 0);
        const averageOrderValue = storeOrders > 0 ? storeRevenue / storeOrders : 0;
        const customerLifetimeValue = storeCustomers > 0 ? storeRevenue / storeCustomers : 0;

        // Customer retention rate (repeat customers / total customers * 100)
        const customerRetentionRate = storeCustomers > 0 ? (repeatCustomers / storeCustomers) * 100 : 0;

        storeMetrics.push({
          storeId: store.id,
          storeName: store.name,
          totalCustomers: storeCustomers,
          newCustomersThisMonth,
          customerAcquisitionRate: Math.round(customerAcquisitionRate * 100) / 100,
          repeatCustomerRate: Math.round(repeatCustomerRate * 100) / 100,
          customerLifetimeValue: Math.round(customerLifetimeValue * 100) / 100,
          averageOrderValue: Math.round(averageOrderValue * 100) / 100,
          customerRetentionRate: Math.round(customerRetentionRate * 100) / 100
        });

        totalCustomers += storeCustomers;
        totalNewCustomersThisMonth += newCustomersThisMonth;
        totalOrders += storeOrders;
        totalRevenue += storeRevenue;

      } catch (error) {
        console.error(`Error fetching customer data for store ${store.name}:`, error);
        // Continue with other stores even if one fails
      }
    }

    // Calculate overall metrics
    const overallCustomerAcquisitionRate = totalCustomers > 0 ? (totalNewCustomersThisMonth / totalCustomers) * 100 : 0;
    const overallAverageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const overallCustomerLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    return NextResponse.json({
      totalCustomers,
      newCustomersThisMonth: totalNewCustomersThisMonth,
      customerAcquisitionRate: Math.round(overallCustomerAcquisitionRate * 100) / 100,
      repeatCustomerRate: Math.round(storeMetrics.reduce((sum, s) => sum + s.repeatCustomerRate, 0) / storeMetrics.length * 100) / 100,
      customerLifetimeValue: Math.round(overallCustomerLifetimeValue * 100) / 100,
      averageOrderValue: Math.round(overallAverageOrderValue * 100) / 100,
      customerRetentionRate: Math.round(storeMetrics.reduce((sum, s) => sum + s.customerRetentionRate, 0) / storeMetrics.length * 100) / 100,
      stores: storeMetrics
    });

  } catch (error) {
    console.error('Customer analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch customer analytics' }, { status: 500 });
  }
}
