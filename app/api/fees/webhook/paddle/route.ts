import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer'

// /api/fees/webhook/paddle/route.ts - Paddle webhook handler
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('paddle-signature')
  
  try {
    // Verify Paddle webhook signature
    const publicKey = process.env.PADDLE_PUBLIC_KEY!
    const isValid = crypto.verify('sha1', Buffer.from(body), publicKey, Buffer.from(signature || '', 'base64'))
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const data = new URLSearchParams(body)
    const alertName = data.get('alert_name')
    
    const supabase = await createSupabaseServerClient()
    
    switch (alertName) {
      case 'subscription_created':
      case 'subscription_payment_succeeded':
        const userId = JSON.parse(data.get('passthrough') || '{}').userId
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          plan_type: 'pro',
          status: 'active',
          paddle_subscription_id: data.get('subscription_id'),
          paddle_user_id: data.get('user_id')
        })
        break
        
      case 'subscription_cancelled':
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('paddle_subscription_id', data.get('subscription_id'))
        break

      case 'subscription_payment_failed':
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('paddle_subscription_id', data.get('subscription_id'))
        break
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}