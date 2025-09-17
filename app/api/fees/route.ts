// /api/fees/route.ts - Subscription management with Paddle
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get the current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      plan: subscription?.plan_type || 'free',
      status: subscription?.status || 'inactive',
      maxStores: subscription?.plan_type === 'pro' ? 999 : 2,
      features: {
        crossStoreInsights: subscription?.plan_type === 'pro',
        advancedAnalytics: subscription?.plan_type === 'pro',
        dataRetention: subscription?.plan_type === 'pro' ? 365 : 30
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json()
    
    const supabase = await createSupabaseServerClient()
    
    // Get the current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create Paddle checkout
    const paddleResponse = await fetch('https://vendors.paddle.com/api/2.0/checkout/custom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendor_id: process.env.PADDLE_VENDOR_ID,
        vendor_auth_code: process.env.PADDLE_AUTH_CODE,
        product_id: productId,
        customer_email: user?.email,
        passthrough: JSON.stringify({ userId: user.id }), // Custom data
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`
      })
    })

    const paddleData = await paddleResponse.json()
    
    if (!paddleData.success) {
      throw new Error(paddleData.error?.message || 'Paddle checkout failed')
    }

    return NextResponse.json({ checkoutUrl: paddleData.response.url })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}