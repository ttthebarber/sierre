-- Supabase schema for Shopify KPI tracker
-- Safe to run multiple times; uses IF NOT EXISTS and idempotent constraints

-- Extensions
create extension if not exists "pgcrypto";

-- ============ Core Tables ============

-- Main stores table (used by the app)
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  platform text not null default 'shopify',
  access_token text not null,
  is_connected boolean not null default true,
  connected_at timestamptz not null default now(),
  health_status text default 'good',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name, platform)
);

-- Shopify-specific stores table (for detailed Shopify data)
create table if not exists public.shopify_stores (
  shop text primary key,
  access_token text not null,
  scopes text,
  owner_id text,
  created_at timestamptz not null default now()
);

-- Users table (for Clerk integration)
create table if not exists public.users (
  id text primary key, -- Clerk user ID
  email text,
  first_name text,
  last_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Subscriptions table (for billing)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  status text not null, -- active, canceled, past_due, etc.
  plan_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ Shopify Webhook Logs ============
create table if not exists public.shopify_webhook_logs (
  id uuid primary key default gen_random_uuid(),
  shop text not null references public.shopify_stores(shop) on delete cascade,
  topic text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_shopify_webhook_logs_shop_created on public.shopify_webhook_logs(shop, created_at desc);
create index if not exists idx_shopify_webhook_logs_topic on public.shopify_webhook_logs(topic);

-- ============ Core Commerce Data ============

-- Products table
create table if not exists public.products (
  id text primary key, -- platform product id
  shop text not null references public.shopify_stores(shop) on delete cascade,
  title text,
  product_type text,
  vendor text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  created_at_db timestamptz not null default now()
);
create index if not exists idx_products_shop on public.products(shop);

-- Product variants table
create table if not exists public.product_variants (
  id text primary key, -- platform variant id
  product_id text not null references public.products(id) on delete cascade,
  title text,
  sku text,
  price numeric,
  inventory_quantity integer,
  created_at_db timestamptz not null default now()
);
create index if not exists idx_variants_product on public.product_variants(product_id);

-- Orders table (fixed to include store_id for app compatibility)
create table if not exists public.orders (
  id text primary key, -- platform order id
  shop text not null references public.shopify_stores(shop) on delete cascade,
  store_id uuid references public.stores(id) on delete cascade, -- Added for app compatibility
  created_at timestamptz,
  closed_at timestamptz,
  currency text,
  subtotal_price numeric,
  total_price numeric,
  total_tax numeric,
  total_discounts numeric,
  financial_status text,
  fulfillment_status text,
  customer_id text,
  customer_email text,
  created_at_db timestamptz not null default now()
);
create index if not exists idx_orders_shop_created on public.orders(shop, created_at desc);
create index if not exists idx_orders_store_id on public.orders(store_id);
create index if not exists idx_orders_customer on public.orders(customer_id);

-- Order items table
create table if not exists public.order_items (
  id text primary key, -- platform line item id
  order_id text not null references public.orders(id) on delete cascade,
  product_id text,
  variant_id text,
  title text,
  sku text,
  quantity integer not null default 0,
  price numeric,
  created_at_db timestamptz not null default now()
);
create index if not exists idx_items_order on public.order_items(order_id);
create index if not exists idx_items_product on public.order_items(product_id);

-- Refunds table
create table if not exists public.refunds (
  id text primary key, -- platform refund id
  order_id text not null references public.orders(id) on delete cascade,
  amount numeric,
  currency text,
  reason text,
  created_at timestamptz,
  created_at_db timestamptz not null default now()
);
create index if not exists idx_refunds_order on public.refunds(order_id);

-- Inventory snapshots table
create table if not exists public.inventory_snapshots (
  id uuid primary key default gen_random_uuid(),
  shop text not null references public.shopify_stores(shop) on delete cascade,
  product_id text,
  variant_id text,
  quantity integer,
  captured_at timestamptz not null default now()
);
create index if not exists idx_inventory_shop_captured on public.inventory_snapshots(shop, captured_at desc);

-- ============ Analytics & KPIs ============

-- KPI daily aggregates
create table if not exists public.kpi_daily (
  id uuid primary key default gen_random_uuid(),
  shop text not null references public.shopify_stores(shop) on delete cascade,
  date date not null,
  revenue numeric default 0,
  orders integer default 0,
  aov numeric default 0,
  refunds numeric default 0,
  sessions integer default 0,
  conversions integer default 0,
  conversion_rate numeric default 0,
  ad_spend numeric default 0,
  roas numeric default 0,
  cac numeric default 0,
  unique (shop, date)
);

-- Analytics snapshots for comprehensive Shopify analytics data
create table if not exists public.analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  shop text not null references public.shopify_stores(shop) on delete cascade,
  user_id text not null,
  data jsonb not null, -- Comprehensive analytics data from Shopify
  captured_at timestamptz not null default now(),
  unique (shop, user_id, date(captured_at))
);

-- Index for efficient querying of analytics snapshots
create index if not exists idx_analytics_snapshots_shop_user on public.analytics_snapshots(shop, user_id);
create index if not exists idx_analytics_snapshots_captured on public.analytics_snapshots(captured_at desc);

-- Enable RLS on analytics snapshots
alter table public.analytics_snapshots enable row level security;

-- Policy for analytics snapshots
create policy select_analytics_snapshots_by_user_shop on public.analytics_snapshots for select using (
  user_id = auth.uid()::text and
  exists (select 1 from public.user_shops us where us.shop = analytics_snapshots.shop and us.user_id = auth.uid()::text)
);

create policy insert_analytics_snapshots_by_user_shop on public.analytics_snapshots for insert with check (
  user_id = auth.uid()::text and
  exists (select 1 from public.user_shops us where us.shop = analytics_snapshots.shop and us.user_id = auth.uid()::text)
);

create policy update_analytics_snapshots_by_user_shop on public.analytics_snapshots for update using (
  user_id = auth.uid()::text and
  exists (select 1 from public.user_shops us where us.shop = analytics_snapshots.shop and us.user_id = auth.uid()::text)
);

-- Fees daily table
create table if not exists public.fees_daily (
  id uuid primary key default gen_random_uuid(),
  shop text not null references public.shopify_stores(shop) on delete cascade,
  date date not null,
  source text not null, -- e.g., shopify, stripe, paypal
  amount numeric not null default 0,
  notes text,
  unique (shop, date, source)
);

-- ============ Sync Status ============
create table if not exists public.sync_status (
  shop text primary key references public.shopify_stores(shop) on delete cascade,
  orders_last_sync_at timestamptz,
  products_last_sync_at timestamptz,
  inventory_last_sync_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ============ Access Control ============
create table if not exists public.user_shops (
  user_id text not null,
  shop text not null,
  created_at timestamp with time zone default now(),
  unique(user_id, shop)
);

-- ============ Row Level Security ============

-- Enable RLS on read-facing tables
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory_snapshots enable row level security;
alter table public.fees_daily enable row level security;
alter table public.kpi_daily enable row level security;
alter table public.stores enable row level security;

-- Read policies: allow select if user is linked to the shop via user_shops
create policy select_orders_by_user_shop on public.orders for select using (
  exists (
    select 1 from public.user_shops us where us.shop = orders.shop and us.user_id = auth.uid()::text
  )
);

create policy select_order_items_by_user_shop on public.order_items for select using (
  exists (
    select 1 from public.user_shops us
    join public.orders o on o.id = order_items.order_id
    where us.shop = o.shop and us.user_id = auth.uid()::text
  )
);

create policy select_products_by_user_shop on public.products for select using (
  exists (select 1 from public.user_shops us where us.shop = products.shop and us.user_id = auth.uid()::text)
);

create policy select_product_variants_by_user_shop on public.product_variants for select using (
  exists (
    select 1 from public.user_shops us
    join public.products p on p.id = product_variants.product_id
    where us.shop = p.shop and us.user_id = auth.uid()::text
  )
);

create policy select_inventory_snapshots_by_user_shop on public.inventory_snapshots for select using (
  exists (select 1 from public.user_shops us where us.shop = inventory_snapshots.shop and us.user_id = auth.uid()::text)
);

create policy select_fees_daily_by_user_shop on public.fees_daily for select using (
  exists (select 1 from public.user_shops us where us.shop = fees_daily.shop and us.user_id = auth.uid()::text)
);

create policy select_kpi_daily_by_user_shop on public.kpi_daily for select using (
  exists (select 1 from public.user_shops us where us.shop = kpi_daily.shop and us.user_id = auth.uid()::text)
);

create policy select_stores_by_user on public.stores for select using (
  user_id = auth.uid()::text
);

-- ============ Convenience Views ============

-- Last 30 days window (rolling)
create or replace view public.view_orders_last_30d as
select o.shop,
       count(*)::int as orders,
       sum(coalesce(o.total_price,0))::numeric as revenue,
       case when count(*) > 0 then (sum(coalesce(o.total_price,0)) / count(*)) else 0 end::numeric as aov
from public.orders o
where o.created_at >= (now() - interval '30 days')
group by o.shop;

create or replace view public.view_top_products_last_30d as
select o.shop,
       i.product_id,
       coalesce(i.title,'Unknown') as title,
       sum(coalesce(i.quantity,0))::int as total_quantity,
       sum(coalesce(i.quantity,0) * coalesce(i.price,0))::numeric as total_revenue
from public.order_items i
join public.orders o on o.id = i.order_id
where o.created_at >= (now() - interval '30 days')
group by o.shop, i.product_id, coalesce(i.title,'Unknown')
order by total_revenue desc;

create or replace view public.view_sales_daily_last_30d as
select o.shop,
       date_trunc('day', o.created_at)::date as day,
       sum(coalesce(o.total_price,0))::numeric as revenue,
       count(*)::int as orders
from public.orders o
where o.created_at >= (now() - interval '30 days')
group by o.shop, date_trunc('day', o.created_at)::date
order by day desc;

create or replace view public.view_kpi_summary_last_30d as
select s.shop,
       coalesce(v.revenue,0)::numeric as revenue,
       coalesce(v.orders,0)::int as orders,
       case when coalesce(v.orders,0) > 0 then (coalesce(v.revenue,0) / v.orders) else 0 end::numeric as aov
from public.shopify_stores s
left join public.view_orders_last_30d v on v.shop = s.shop;