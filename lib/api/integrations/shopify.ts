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
  // Connect to Shopify store
  connect: async (config: ShopifyConnectionConfig) => {
    return enhancedApiClient.post('/integrations/shopify/connect', config);
  },
  
  // Sync data from Shopify
  sync: async (integrationId: string) => {
    return enhancedApiClient.post(`/integrations/shopify/sync`, { integrationId });
  },
  
  // Get orders from Shopify
  getOrders: async (integrationId: string, dateRange?: { start: string; end: string }) => {
    const params = dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : '';
    return enhancedApiClient.get(`/platforms/shopify/orders${params}`);
  },
  
  // Get products from Shopify
  getProducts: async (integrationId: string) => {
    return enhancedApiClient.get(`/platforms/shopify/products`);
  },
  
  // Get analytics from Shopify
  getAnalytics: async (integrationId: string, metrics: string[]) => {
    return enhancedApiClient.post(`/platforms/shopify/analytics`, { metrics });
  },
  
  // Disconnect Shopify integration
  disconnect: async (integrationId: string) => {
    return enhancedApiClient.delete(`/integrations/shopify/${integrationId}`);
  }
};