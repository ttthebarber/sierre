import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from '@/lib/supabaseServer'
// /api/integrations/shopify/connect/route.ts
export async function GET(request: NextRequest) {
    const { userId } = await auth()
    
    // Debug logging
    console.log('=== AUTH DEBUG ===')
    console.log('User ID:', userId)
    console.log('Clerk keys set:', {
      publishable: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      secret: !!process.env.CLERK_SECRET_KEY
    })
    console.log('==================')
    
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
    try {
      const { searchParams } = new URL(request.url)
      const shop = searchParams.get('shop')
      if (!shop) return NextResponse.json({ error: 'Missing shop' }, { status: 400 })

      // Debug: Log all environment variables
      console.log('=== DEBUG INFO ===')
      console.log('Shop:', shop)
      console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
      console.log('SHOPIFY_REDIRECT_URL:', process.env.SHOPIFY_REDIRECT_URL)
      console.log('SHOPIFY_API_KEY:', process.env.SHOPIFY_API_KEY ? 'SET' : 'NOT SET')
      console.log('==================')

      // Normalize shop input to handle full domains or prefixes
      const rawShop = shop.trim()
      const normalizedShop = rawShop
        .replace(/^https?:\/\//, '')
        .replace(/\/.*/, '')
        .replace(/\.myshopify\.com$/i, '')
        .toLowerCase()
      const shopDomain = `${normalizedShop}.myshopify.com`

      const supabase = await createSupabaseServerClient()
      
      // Check subscription limits
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_type')
        .eq('user_id', userId)
        .single()
      
      const { count: storeCount } = await supabase
        .from('stores')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      
      const maxStores = subscription?.plan_type === 'pro' ? 999 : 2
      if ((storeCount ?? 0) >= maxStores) {
        return NextResponse.json({ error: 'Store limit reached. Upgrade to Pro for unlimited stores.' }, { status: 403 })
      }
  
      // Generate Shopify install URL
      const redirectUri = process.env.SHOPIFY_REDIRECT_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/shopify/callback`
      
      // Debug: Log the redirect URI being used
      console.log('Redirect URI being sent to Shopify:', redirectUri)
      console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
      console.log('SHOPIFY_REDIRECT_URL:', process.env.SHOPIFY_REDIRECT_URL)
      
      const installUrl = `https://${shopDomain}/admin/oauth/authorize?` +
        `client_id=${process.env.SHOPIFY_API_KEY}&` +
        `scope=${process.env.SHOPIFY_SCOPES || 'read_orders,read_products,read_inventory'}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${userId}`
      
      return NextResponse.redirect(installUrl)
    } catch {
      return NextResponse.json({ error: 'Failed to generate install URL' }, { status: 500 })
    }
  }