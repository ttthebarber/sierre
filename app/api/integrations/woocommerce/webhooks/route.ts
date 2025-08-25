import { NextRequest, NextResponse } from 'next/server';
import { logWooCommerceWebhook } from '@/lib/integrations/woocommerce';
import { 
  persistWooCommerceOrder, 
  persistWooCommerceProduct,
  persistWooCommerceRefund 
} from '@/lib/integrations/woocommercePersist';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const topic = req.headers.get('x-wc-webhook-topic');
    const shop = req.headers.get('x-wc-webhook-shop');

    if (!topic || !shop) {
      return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 });
    }

    // Log the webhook
    await logWooCommerceWebhook(shop, topic, payload);

    // Process based on topic
    switch (topic) {
      case 'order.created':
      case 'order.updated':
        try {
          await persistWooCommerceOrder(payload, shop);
        } catch (error) {
          console.error('Failed to process order webhook:', error);
        }
        break;

      case 'product.created':
      case 'product.updated':
        try {
          await persistWooCommerceProduct(payload, shop);
        } catch (error) {
          console.error('Failed to process product webhook:', error);
        }
        break;

      case 'refund.created':
        try {
          await persistWooCommerceRefund(payload, shop);
        } catch (error) {
          console.error('Failed to process refund webhook:', error);
        }
        break;

      default:
        console.log(`Unhandled WooCommerce webhook topic: ${topic}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to process WooCommerce webhook:', error);
    return NextResponse.json({ error: error.message || 'Failed to process webhook' }, { status: 500 });
  }
}
