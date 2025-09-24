import { enhancedApiClient } from '../enhanced-client';

export interface ShopifyCredentials {
  shop: string;
  accessToken: string;
}

export interface ShopifyConnectionConfig {
  credentials: ShopifyCredentials;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  includeMetrics: string[];
  autoSync: boolean;
}

// Client-side API functions for Shopify integration
export const shopifyApi = {
  // Connect to Shopify store (may differ in your app)
  connect: async (config: ShopifyConnectionConfig) => {
    return enhancedApiClient.post('/integrations/shopify/connect', config);
  },
  
  // Sync data from Shopify — expects { shop } per implemented API route
  sync: async (shop: string) => {
    return enhancedApiClient.post(`/integrations/shopify/sync`, { shop });
  },
  
  // Get orders from Shopify (placeholder endpoints; adjust as needed)
  getOrders: async (dateRange?: { start: string; end: string }) => {
    const params = dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : '';
    return enhancedApiClient.get(`/platforms/shopify/orders${params}`);
  },
  
  // Get products from Shopify (placeholder)
  getProducts: async () => {
    return enhancedApiClient.get(`/platforms/shopify/products`);
  },
  
  // Get analytics from Shopify (server resolves token)
  getAnalytics: async (shop: string, metrics?: string[]) => {
    return enhancedApiClient.post(`/shopify/analytics`, { shop, metrics });
  },
  
  // Disconnect Shopify integration — implemented as POST with { shop }
  disconnect: async (shop: string) => {
    return enhancedApiClient.post(`/integrations/shopify/disconnect`, { shop });
  }
};
