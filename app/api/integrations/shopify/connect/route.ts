import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
// /api/integrations/shopify/connect/route.ts
export async function GET(request: NextRequest) {
    const { userId } = await auth()
    
    
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
    try {
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

      // Skip subscription checks for now to avoid Clerk API issues
      // TODO: Re-enable once Clerk integration is stable
      console.log('Skipping subscription checks to avoid Clerk API issues')
  
      // Generate Shopify install URL with proper redirect URI
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const redirectUri = process.env.SHOPIFY_REDIRECT_URL || `${baseUrl}/api/integrations/shopify/callback`
      
      // Ensure redirect URI is properly formatted
      const normalizedRedirectUri = redirectUri.replace(/\/$/, '') // Remove trailing slash
      
      // Debug: Log the redirect URI being used
      console.log('=== REDIRECT URI DEBUG ===')
      console.log('Base URL:', baseUrl)
      console.log('SHOPIFY_REDIRECT_URL env:', process.env.SHOPIFY_REDIRECT_URL)
      console.log('Final redirect URI:', normalizedRedirectUri)
      console.log('Shop domain:', shopDomain)
      console.log('==========================')
      
      // Validate required environment variables
      if (!process.env.SHOPIFY_API_KEY) {
        throw new Error('SHOPIFY_API_KEY environment variable is not set')
      }
      
      const installUrl = `https://${shopDomain}/admin/oauth/authorize?` +
        `client_id=${process.env.SHOPIFY_API_KEY}&` +
        `scope=${process.env.SHOPIFY_SCOPES || 'read_orders,read_products,read_inventory'}&` +
        `redirect_uri=${encodeURIComponent(normalizedRedirectUri)}&` +
        `state=${userId}`
      
      console.log('Install URL:', installUrl)
      return NextResponse.redirect(installUrl)
    } catch (error) {
      console.error('Connect error:', error)
      return NextResponse.json({ 
        error: 'Failed to generate install URL', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  }