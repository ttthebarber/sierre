# Shopify Analytics Edge Function

This Supabase Edge Function fetches comprehensive analytics data from Shopify using the `read_analytics` scope and stores it in the database for AI insights and dashboard display.

## Features

### 📊 KPIs Collected

**Revenue Metrics:**
- Gross Revenue (total revenue before discounts/refunds)
- Net Revenue (revenue after discounts/refunds)
- Revenue Change Percentage (compared to previous 30-day period)

**Customer Metrics:**
- New Customers count and percentage change
- Active/Returning Customers count and percentage change

**Performance Metrics:**
- Growth Rate (overall business growth)
- Conversion Rate (orders to sessions)
- Cart Abandonment Rate
- Average Order Value (AOV)

**Traffic Sources:**
- Paid Advertising (ads)
- Organic Search
- Social Media
- Referral Traffic
- Direct Traffic
- Email Marketing

**Additional Metrics:**
- Total Orders
- Total Visitors
- Total Sessions

## API Usage

### Request
```typescript
POST /functions/v1/shopify-analytics
Content-Type: application/json

{
  "shop": "your-shop-name",
  "accessToken": "shopify_access_token",
  "userId": "clerk_user_id"
}
```

### Response
```typescript
{
  "success": true,
  "data": {
    "grossRevenue": 24750.00,
    "netRevenue": 23500.00,
    "revenueChangePercent": 18.3,
    "newCustomers": 145,
    "newCustomersChangePercent": 12.1,
    "activeCustomers": 89,
    "activeCustomersChangePercent": 8.5,
    "growthRate": 18.3,
    "conversionRate": 3.2,
    "cartAbandonmentRate": 70,
    "trafficSources": {
      "ads": 25,
      "organic": 35,
      "social": 15,
      "referral": 10,
      "direct": 10,
      "email": 5
    },
    "totalOrders": 1247,
    "averageOrderValue": 89.50,
    "totalVisitors": 3890,
    "totalSessions": 4380
  }
}
```

## Database Schema

### Analytics Snapshots Table
```sql
create table public.analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  shop text not null references public.shopify_stores(shop) on delete cascade,
  user_id text not null,
  data jsonb not null, -- Complete analytics data
  captured_at timestamptz not null default now(),
  unique (shop, user_id, date(captured_at))
);
```

### KPI Daily Table (Updated)
```sql
create table public.kpi_daily (
  id uuid primary key default gen_random_uuid(),
  shop text not null references public.shopify_stores(shop) on delete cascade,
  date date not null,
  revenue numeric default 0,
  orders integer default 0,
  aov numeric default 0,
  sessions integer default 0,
  conversion_rate numeric default 0,
  -- ... other fields
  unique (shop, date)
);
```

## Shopify API Requirements

### Required Scopes
- `read_analytics` - Access to analytics data
- `read_orders` - Order data for revenue calculations
- `read_customers` - Customer data for customer metrics

### API Endpoints Used
- `/admin/api/2023-10/orders.json` - Order data
- `/admin/api/2023-10/customers.json` - Customer data
- `/admin/api/2023-10/analytics.json` - Analytics data (if available)
- `/admin/api/2023-10/reports.json` - Reports data (if available)

## Data Processing

### Time Periods
- **Current Period**: Last 30 days
- **Previous Period**: 30-60 days ago (for comparison)
- **Comparison**: Percentage change calculations

### Revenue Calculations
- **Gross Revenue**: Sum of all order totals
- **Net Revenue**: Gross revenue minus discounts and refunds
- **Revenue Change**: ((Current - Previous) / Previous) × 100

### Customer Metrics
- **New Customers**: Customers created in current period
- **Active Customers**: Unique customers who made purchases
- **Change Percentages**: Compared to previous period

### Traffic Sources
Currently estimated based on industry averages. In production, integrate with:
- Google Analytics API
- Shopify's Analytics API (when available)
- Custom tracking implementation

## Error Handling

The function includes comprehensive error handling for:
- Missing parameters
- Invalid Shopify credentials
- API rate limits
- Network failures
- Data processing errors

## Security

- Row Level Security (RLS) enabled on all tables
- User authentication required
- Shop ownership verification
- Access token validation

## Deployment

1. Deploy to Supabase:
```bash
supabase functions deploy shopify-analytics
```

2. Set environment variables:
```bash
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. Test the function:
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/shopify-analytics' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"shop":"your-shop","accessToken":"token","userId":"user_id"}'
```

## Integration with AI Insights

This data is used by the AI insights system to:
- Generate performance reports
- Identify trends and patterns
- Provide actionable recommendations
- Create predictive analytics
- Monitor business health metrics

## Limitations

1. **Traffic Sources**: Currently estimated - integrate with Google Analytics for accurate data
2. **Cart Abandonment**: Industry average - requires checkout API for precise calculation
3. **Real-time Data**: Data is captured when function runs, not real-time
4. **Rate Limits**: Shopify API has rate limits (40 requests/second)
5. **Data Retention**: Historical data depends on Shopify's data retention policies
