import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer'

// /api/integrations/shopify/callback/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const shop = searchParams.get('shop')
  const state = searchParams.get('state') // userId

  if (!code || !shop || !state) {
    return NextResponse.redirect(new URL('/dashboard?error=invalid_callback', request.url))
  }

  try {
    console.log('=== SHOPIFY CALLBACK DEBUG ===')
    console.log('Code:', code)
    console.log('Shop:', shop)
    console.log('State (userId):', state)
    console.log('SHOPIFY_API_KEY:', process.env.SHOPIFY_API_KEY ? 'SET' : 'NOT SET')
    console.log('SHOPIFY_API_SECRET:', process.env.SHOPIFY_API_SECRET ? 'SET' : 'NOT SET')
    console.log('================================')

    const supabase = await createSupabaseServerClient()
    
    // Exchange code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', tokenResponse.status, errorText)
      throw new Error(`Token exchange failed: ${tokenResponse.status} ${errorText}`)
    }

    const tokenData = await tokenResponse.json()
    console.log('Token response:', tokenData)
    
    if (!tokenData.access_token) {
      throw new Error('No access token in response')
    }

    // Store connection in database
    const { error: dbError } = await supabase.from('stores').upsert({
      user_id: state,
      name: shop,
      platform: 'shopify',
      access_token: tokenData.access_token, // Encrypt this in production
      is_connected: true,
      connected_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,name,platform'
    })

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error(`Database error: ${dbError.message}`)
    }

    console.log('Successfully stored Shopify connection')
    // Store connection status in a cookie that will persist through redirects
    const response = NextResponse.redirect(new URL('/dashboard?connected=shopify', request.url))
    response.cookies.set('shopify_connection_status', 'success', {
      maxAge: 60, // 1 minute
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    return response
  } catch (error) {
    console.error('Shopify callback error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const response = NextResponse.redirect(new URL(`/dashboard?error=connection_failed&details=${encodeURIComponent(errorMessage)}`, request.url))
    response.cookies.set('shopify_connection_status', 'error', {
      maxAge: 60, // 1 minute
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    return response
  }
}