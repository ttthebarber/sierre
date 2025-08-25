# KPI Tracker (Project Status)

A minimalist KPI tracker built with Next.js and TypeScript. Current focus is on UI scaffolding and demo data; backend, auth, and real integrations are not wired up yet.

## Project status at a glance

- **App framework**: Next.js 15 App Router with `layout.tsx` and global styles in place
- **Styling**: Tailwind CSS 4 + shadcn/ui primitives
- **Pages implemented**:
  - `app/dashboard/page.tsx`: dashboard UI with sidebar/header, demo charts and metrics (static data)
  - `app/settings/page.tsx`: settings UI (account, integrations, billing) — static only
  - `app/integrations/page.tsx`: integrations catalog UI — static only
- **Charts**: Recharts wrapper in `components/ui/chart.tsx` (tooltips, legend, CSS custom props)
- **Shared UI**: sidebar, header, card, button, input, label, badge components
- **Local state + CRUD (demo)**: a complete context-based KPI CRUD experience exists in `app/functionality.tsx` (forms, validation, modals, toasts) but is not used by any route yet
- **Auth**: `middleware.ts` enables Clerk, but no `<ClerkProvider/>`, sign-in/up, or route protection are implemented; pages are currently public and use no auth
- **Backend/data**: Supabase client helper exists (`lib/supabaseClients.ts`), but no persistence is wired; there are no API route handlers
- **Integrations**: client helpers for Shopify (`lib/api/integrations/shopify.ts`) call endpoints that do not exist yet under `app/api`

## What’s implemented

- Dashboard, Settings, and Integrations UIs with responsive layout
- Demo charts and metrics, filter menus, and a compact metrics panel
- Reusable UI primitives and a chart utility layer
- A full demo KPI CRUD module in `app/functionality.tsx` ready to be mounted

## Gaps and known limitations

- No server-side API routes or database schema in code; all data is in-memory demo
- Clerk middleware is present and will require env vars to run; there is no auth UI or provider in `app/layout.tsx`
- The dashboard uses an inline `KpiDashboard` (static) instead of the richer `KPIDashboard` from `app/functionality.tsx`
- Integration endpoints referenced by the Shopify client are not implemented

## Next steps (prioritized)

1) Wire up the real KPI dashboard
- Mount the `KPIDashboard` from `app/functionality.tsx` on `app/dashboard/page.tsx` (or extract it into components and reuse)
- Move the `AppProvider` to `app/layout.tsx` if you want global state across pages

2) Add authentication properly
- Wrap the app in `<ClerkProvider>` in `app/layout.tsx`
- Add `SignIn`, `SignUp`, and `UserButton` components and protect private routes
- Adjust `middleware.ts` or add `publicRoutes` so dev runs without blocking

3) Introduce persistence via API routes + Supabase
- Create `app/api/kpis/route.ts` (GET/POST) and `app/api/kpis/[id]/route.ts` (PUT/DELETE)
- Use the server Supabase client and define RLS policies keyed to the authenticated user
- Replace demo context storage with API calls using `lib/api/client.ts`

4) Implement basic integrations scaffolding
- Add `app/api/integrations/shopify/connect`, `/sync`, and `/platforms/shopify/*` route handlers that match `lib/api/integrations/shopify.ts`
- Store credentials securely and return mock data first; wire real OAuth later

5) Stabilize settings and billing
- Make settings update real user data once auth exists; remove or stub billing until Stripe is added

6) Polish and hardening
- Replace hardcoded demo copy (e.g., user name, plan badges)
- Add unit/integration tests and basic error boundaries

## Tech stack

- **Next.js 15**, **React 18**, **TypeScript**
- **Tailwind CSS 4**, **shadcn/ui**, **lucide-react**
- **Recharts** (via custom wrapper)
- Planned: **Supabase** (data), **Clerk** (auth), **Shopify/Etsy/WooCommerce/Squarespace** integrations

## Running the project

1) Install dependencies
   ```bash
   npm install
   ```

2) Environment variables (minimum for current middleware)
   ```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-key
CLERK_SECRET_KEY=your-secret
# Optional for future persistence
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

If you don’t want to configure Clerk yet, temporarily remove or comment out `middleware.ts`.

3) Start dev server
```bash
npm run dev
```

Open `http://localhost:3000`.

## (Planned) database schema

Supabase tables to support KPIs and history (to be created when wiring persistence):

   ```sql
   CREATE TABLE kpis (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id TEXT NOT NULL,
     name TEXT NOT NULL,
     value DECIMAL NOT NULL,
     target DECIMAL NOT NULL,
     unit TEXT NOT NULL,
     unit_symbol TEXT,
     category TEXT NOT NULL,
     tags TEXT[],
     trend TEXT DEFAULT 'neutral',
     change_percent DECIMAL DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   
   CREATE TABLE kpi_history (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     kpi_id UUID REFERENCES kpis(id) ON DELETE CASCADE,
     value DECIMAL NOT NULL,
     recorded_at TIMESTAMP DEFAULT NOW()
   );
   
   CREATE TABLE categories (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id TEXT NOT NULL,
     name TEXT NOT NULL,
     color TEXT DEFAULT '#6b7280',
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

## Contributing

- Type-safe, accessible components; match existing code style
- Prefer extracting reusable UI and hooks as features grow

## License

MIT