import { apiClient } from '../client';

export interface WooCommerceConnectParams {
  site_url: string;
  consumer_key: string;
  consumer_secret: string;
  shop: string;
}

export interface WooCommerceStatus {
  connected: boolean;
  connected_at: string | null;
  last_orders_sync_at: string | null;
  last_products_sync_at: string | null;
}

export const woocommerceApi = {
  // Connect WooCommerce store
  connect: async (params: WooCommerceConnectParams) => {
    return apiClient.post('/api/integrations/woocommerce/connect', params);
  },

  // Sync data from WooCommerce
  sync: async (shop: string) => {
    return apiClient.post('/api/integrations/woocommerce/sync', { shop });
  },

  // Get connection status
  getStatus: async (shop: string): Promise<WooCommerceStatus> => {
    return apiClient.get(`/api/integrations/woocommerce/status?shop=${encodeURIComponent(shop)}`);
  },

  // Disconnect WooCommerce store
  disconnect: async (shop: string) => {
    return apiClient.post('/api/integrations/woocommerce/disconnect', { shop });
  },
};
