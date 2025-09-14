// Shopify Analytics Types for Supabase Edge Function

export interface ShopifyAnalyticsData {
  // Revenue KPIs
  grossRevenue: number;
  netRevenue: number;
  revenueChangePercent: number;
  
  // Customer KPIs
  newCustomers: number;
  newCustomersChangePercent: number;
  activeCustomers: number;
  activeCustomersChangePercent: number;
  
  // Growth & Performance KPIs
  growthRate: number;
  conversionRate: number;
  cartAbandonmentRate: number;
  
  // Traffic Sources
  trafficSources: {
    ads: number;
    organic: number;
    social: number;
    referral: number;
    direct: number;
    email: number;
  };
  
  // Additional Metrics
  totalOrders: number;
  averageOrderValue: number;
  totalVisitors: number;
  totalSessions: number;
}

export interface ShopifyAnalyticsResponse {
  success: boolean;
  data?: ShopifyAnalyticsData;
  error?: string;
}

export interface TrafficSources {
  ads: number;      // Paid advertising traffic
  organic: number;  // Organic search traffic
  social: number;   // Social media traffic
  referral: number; // Referral traffic
  direct: number;   // Direct traffic
  email: number;    // Email marketing traffic
}

export interface RevenueMetrics {
  grossRevenue: number;        // Total revenue before discounts/refunds
  netRevenue: number;          // Revenue after discounts/refunds
  revenueChangePercent: number; // Percentage change from previous period
}

export interface CustomerMetrics {
  newCustomers: number;                // New customers in current period
  newCustomersChangePercent: number;   // % change in new customers
  activeCustomers: number;             // Customers who made purchases
  activeCustomersChangePercent: number; // % change in active customers
}

export interface PerformanceMetrics {
  growthRate: number;              // Overall growth rate
  conversionRate: number;          // Orders to sessions conversion rate
  cartAbandonmentRate: number;     // Percentage of abandoned carts
  totalOrders: number;             // Total number of orders
  averageOrderValue: number;       // Average order value
  totalVisitors: number;           // Total unique visitors
  totalSessions: number;           // Total sessions
}

// Database types for Supabase
export interface AnalyticsSnapshot {
  id: string;
  shop: string;
  user_id: string;
  data: ShopifyAnalyticsData;
  captured_at: string;
}

export interface KpiDailyRecord {
  id: string;
  shop: string;
  date: string;
  revenue: number;
  orders: number;
  aov: number;
  refunds: number;
  sessions: number;
  conversions: number;
  conversion_rate: number;
  ad_spend: number;
  roas: number;
  cac: number;
}

// API Request/Response types
export interface AnalyticsRequest {
  shop: string;
  accessToken: string;
  userId: string;
}

export interface AnalyticsApiResponse {
  success: boolean;
  data?: ShopifyAnalyticsData;
  error?: string;
}
