-- Supabase schema for ecommerce KPI tracker
-- Safe to run multiple times; uses IF NOT EXISTS and idempotent constraints

-- Extensions
create extension if not exists "pgcrypto";

-- ============ Integrations ============
create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  owner_id text,
  provider text not null, -- e.g., shopify, ga4, google_ads
  external_id text not null, -- e.g., myshop.myshopify.com, GA4 property id
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, provider, external_id)
);

-- ============ Shopify ============
create table if not exists public.shopify_stores (
  shop text primary key,
  access_token text not null,
  scopes text,
  owner_id text,
  created_at timestamptz not null default now()
);

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
create table if not exists public.customers (
  id text primary key, -- platform customer id
  shop text not null references public.shopify_stores(shop) on delete cascade,
  email text,
  first_name text,
  last_name text,
  created_at timestamptz,
  updated_at timestamptz,
  created_at_db timestamptz not null default now()
);
create index if not exists idx_customers_shop on public.customers(shop);
create index if not exists idx_customers_email on public.customers(email);

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

create table if not exists public.orders (
  id text primary key, -- platform order id
  shop text not null references public.shopify_stores(shop) on delete cascade,
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
create index if not exists idx_orders_customer on public.orders(customer_id);

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

create table if not exists public.inventory_snapshots (
  id uuid primary key default gen_random_uuid(),
  shop text not null references public.shopify_stores(shop) on delete cascade,
  product_id text,
  variant_id text,
  quantity integer,
  captured_at timestamptz not null default now()
);
create index if not exists idx_inventory_shop_captured on public.inventory_snapshots(shop, captured_at desc);

-- ============ Analytics Inputs (optional integrations) ============
create table if not exists public.traffic_daily (
  id uuid primary key default gen_random_uuid(),
  shop text not null references public.shopify_stores(shop) on delete cascade,
  date date not null,
  sessions integer default 0,
  add_to_cart integer default 0,
  begin_checkout integer default 0,
  purchases integer default 0,
  unique (shop, date)
);

create table if not exists public.ad_spend_daily (
  id uuid primary key default gen_random_uuid(),
  shop text not null references public.shopify_stores(shop) on delete cascade,
  date date not null,
  channel text not null, -- google_ads, meta_ads, etc.
  spend numeric default 0,
  impressions integer default 0,
  clicks integer default 0,
  conversions integer default 0,
  unique (shop, date, channel)
);

-- ============ Aggregates ============
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

-- ============ Sync Status & Fees ============
create table if not exists public.sync_status (
  shop text primary key references public.shopify_stores(shop) on delete cascade,
  orders_last_sync_at timestamptz,
  products_last_sync_at timestamptz,
  inventory_last_sync_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ============ Access Control (RLS with user_shops mapping) ============
create table if not exists public.user_shops (
  user_id text primary key, -- Changed from UUID to text to match auth.uid()
  shop text not null,
  created_at timestamp with time zone default now(),
  unique(user_id, shop)
);

-- Enable RLS on read-facing tables
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory_snapshots enable row level security;
alter table public.fees_daily enable row level security;
alter table public.kpi_daily enable row level security;

-- Read policies: allow select if user is linked to the shop via user_shops
create policy select_orders_by_user_shop on public.orders for select using (
  exists (
    select 1 from public.user_shops us where us.shop = orders.shop and us.user_id = auth.uid()
  )
);

create policy select_order_items_by_user_shop on public.order_items for select using (
  exists (
    select 1 from public.user_shops us
    where us.shop = order_items.shop and us.user_id = auth.uid()
  )
);

create policy select_products_by_user_shop on public.products for select using (
  exists (select 1 from public.user_shops us where us.shop = products.shop and us.user_id = auth.uid())
);

create policy select_product_variants_by_user_shop on public.product_variants for select using (
  exists (
    select 1 from public.user_shops us
    where us.shop = product_variants.shop and us.user_id = auth.uid()
  )
);

create policy select_inventory_snapshots_by_user_shop on public.inventory_snapshots for select using (
  exists (select 1 from public.user_shops us where us.shop = inventory_snapshots.shop and us.user_id = auth.uid())
);

create policy select_fees_daily_by_user_shop on public.fees_daily for select using (
  exists (select 1 from public.user_shops us where us.shop = fees_daily.shop and us.user_id = auth.uid())
);

create policy select_kpi_daily_by_user_shop on public.kpi_daily for select using (
  exists (select 1 from public.user_shops us where us.shop = kpi_daily.shop and us.user_id = auth.uid())
);

create table if not exists public.fees_daily (
  id uuid primary key default gen_random_uuid(),
  shop text not null references public.shopify_stores(shop) on delete cascade,
  date date not null,
  source text not null, -- e.g., shopify, stripe, paypal
  amount numeric not null default 0,
  notes text,
  unique (shop, date, source)
);

-- (Optional) Enable RLS later as needed; service role bypasses RLS
-- alter table public.orders enable row level security;
-- add policies based on your auth model if querying from client.

-- ============ Convenience KPI Views (seedless) ============
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

-- WooCommerce specific tables
CREATE TABLE IF NOT EXISTS woocommerce_stores (
  shop TEXT PRIMARY KEY,
  site_url TEXT NOT NULL,
  consumer_key TEXT NOT NULL,
  consumer_secret TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS woocommerce_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop TEXT NOT NULL,
  topic TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


