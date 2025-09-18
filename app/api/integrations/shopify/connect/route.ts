import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// /api/integrations/shopify/connect/route.ts
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

      const { searchParams } = new URL(request.url)
      const shop = searchParams.get('shop')
      if (!shop) return NextResponse.json({ error: 'Missing shop' }, { status: 400 })


      // Normalize shop input to handle full domains or prefixes
      const rawShop = shop.trim()
      const normalizedShop = rawShop
        .replace(/^https?:\/\//, '')
        .replace(/\/.*/, '')
        .replace(/\.myshopify\.com$/i, '')
        .toLowerCase()
      const shopDomain = `${normalizedShop}.myshopify.com`
      
      // Create service role client for database operations
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Check subscription limits
      const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('plan_type')
        .eq('user_id', user.id)
        .single()
      
      const { count: storeCount } = await supabaseAdmin
        .from('stores')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      const maxStores = subscription?.plan_type === 'pro' ? 999 : 2
      if ((storeCount ?? 0) >= maxStores) {
        return NextResponse.json({ error: 'Store limit reached. Upgrade to Pro for unlimited stores.' }, { status: 403 })
      }
  
      // Generate Shopify install URL with proper redirect URI
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const redirectUri = process.env.SHOPIFY_REDIRECT_URL || `${baseUrl}/api/integrations/shopify/callback`
      
      // Ensure redirect URI is properly formatted
      const normalizedRedirectUri = redirectUri.replace(/\/$/, '') // Remove trailing slash
      
      // Debug: Log the redirect URI being used
      
      // Validate required environment variables
      if (!process.env.SHOPIFY_API_KEY) {
        throw new Error('SHOPIFY_API_KEY environment variable is not set')
      }
      
      const installUrl = `https://${shopDomain}/admin/oauth/authorize?` +
        `client_id=${process.env.SHOPIFY_API_KEY}&` +
        `scope=${process.env.SHOPIFY_SCOPES || 'read_orders,read_products,read_inventory'}&` +
        `redirect_uri=${encodeURIComponent(normalizedRedirectUri)}&` +
        `state=${user.id}`
      
      return NextResponse.redirect(installUrl)
    } catch (error) {
      console.error('Connect error:', error)
      return NextResponse.json({ 
        error: 'Failed to generate install URL', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  }