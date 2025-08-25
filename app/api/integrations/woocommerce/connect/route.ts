import { NextRequest, NextResponse } from 'next/server';
import { storeWooCommerceCredentials } from '@/lib/integrations/woocommerce';

export async function POST(req: NextRequest) {
  try {
    const { site_url, consumer_key, consumer_secret, shop } = await req.json();
    
    if (!site_url || !consumer_key || !consumer_secret || !shop) {
      return NextResponse.json({ error: 'Missing required fields: site_url, consumer_key, consumer_secret, shop' }, { status: 400 });
    }

    // Validate the credentials by making a test API call
    try {
      const testUrl = new URL('/wp-json/wc/v3/products', site_url);
      const auth = Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64');
      
      const response = await fetch(testUrl.toString(), {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return NextResponse.json({ error: 'Invalid WooCommerce credentials' }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Unable to connect to WooCommerce store. Please check your site URL and credentials.' }, { status: 400 });
    }

    // Store credentials in database
    await storeWooCommerceCredentials(shop, site_url, consumer_key, consumer_secret);

    return NextResponse.json({ 
      success: true, 
      message: `WooCommerce store ${shop} connected successfully.` 
    });
  } catch (error: any) {
    console.error('Failed to connect WooCommerce store:', error);
    return NextResponse.json({ error: error.message || 'Failed to connect WooCommerce store' }, { status: 500 });
  }
}


