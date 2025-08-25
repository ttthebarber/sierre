"use client";

import React from "react";
import { Header } from "@/components/ui/header";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Home,
  Settings,
  CloudLightning,
  ChevronDown,
  Plus,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Store,
  Share2,
  Download,
} from "lucide-react";

// ---- Utilities ----
const fmtCurrency = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
const fmtNumber = (n: number) => new Intl.NumberFormat(undefined).format(n || 0);

// Platform meta & icons (simple labels; replace with real icons/assets if available)
const PLATFORM_META: Record<string, { label: string; tint: string }> = {
  shopify: { label: "Shopify", tint: "bg-[#FDE68A]" }, // yellow tint
  woocommerce: { label: "WooCommerce", tint: "bg-gray-200" },
  squarespace: { label: "Squarespace", tint: "bg-black text-white" },
};

// ---- Store Switcher (with "All Stores" + Add) ----
function StoreSwitcher({
  stores,
  value,
  onChange,
  onAdd,
}: {
  stores: Array<{ id: string; name: string; platform: keyof typeof PLATFORM_META }>;
  value: string;
  onChange: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 border-gray-200 bg-white hover:bg-yellow-50 text-black hover:border-yellow-300 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2">
            <Store className="h-4 w-4" />
            <span className="truncate max-w-[200px]">
              {value === "all" ? "All Stores" : stores.find((s) => s.id === value)?.name || "Select store"}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 bg-white border-gray-200">
          <DropdownMenuLabel className="text-black">Switch store</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-200" />
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            <DropdownMenuRadioItem value="all" className="text-black hover:bg-yellow-50 focus:bg-yellow-100">
              All Stores
            </DropdownMenuRadioItem>
            {stores.map((s) => (
              <DropdownMenuRadioItem key={s.id} value={s.id} className="text-black hover:bg-yellow-50 focus:bg-yellow-100">
                <span className={`inline-flex items-center gap-2`}>
                  <span className={`h-2 w-2 rounded-full ${PLATFORM_META[s.platform].tint.replace("bg-", "bg-")}`}></span>
                  <span className="truncate">{s.name}</span>
                  <Badge variant="outline" className="ml-2 text-xs border-gray-300 text-gray-700">
                    {PLATFORM_META[s.platform].label}
                  </Badge>
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator className="bg-gray-200" />
          <div className="px-2 py-1.5">
            <Button onClick={onAdd} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
              <Plus className="h-4 w-4 mr-2" /> Add store
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ---- Portfolio Health ----
function PortfolioHealth({
  stores,
  totals,
  bestStoreId,
  attentionStoreId,
  healthScore,
}: {
  stores: Array<{ id: string; name: string; platform: keyof typeof PLATFORM_META; health: "good" | "warn" | "bad" }>;
  totals: { revenue: number; orders: number; aov: number };
  bestStoreId: string | null;
  attentionStoreId: string | null;
  healthScore: number;
}) {
  const bestStore = stores.find((s) => s.id === bestStoreId);
  const attentionStore = stores.find((s) => s.id === attentionStoreId);

  const healthBadge = (score: number) => {
    let tone = "bg-yellow-200 text-black";
    if (score >= 75) tone = "bg-green-200 text-black";
    if (score < 40) tone = "bg-red-200 text-black";
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${tone}`}>{score}</span>;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardDescription className="text-gray-600">Portfolio Health</CardDescription>
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl text-black">Score</CardTitle>
            {healthBadge(healthScore)}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600">0–100 based on growth, consistency, and efficiency.</p>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardDescription className="text-gray-600">Total revenue</CardDescription>
          <CardTitle className="text-2xl text-black">{fmtCurrency(totals.revenue)}</CardTitle>
        </CardHeader>
      </Card>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardDescription className="text-gray-600">Best performing store</CardDescription>
          <CardTitle className="text-lg text-black truncate">
            {bestStore ? (
              <span className="inline-flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${PLATFORM_META[bestStore.platform].tint}`}></span>
                {bestStore.name}
              </span>
            ) : (
              "—"
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardDescription className="text-gray-600">Needs attention</CardDescription>
          <CardTitle className="text-lg text-black truncate">
            {attentionStore ? (
              <span className="inline-flex items-center gap-2 text-yellow-700">
                <Lightbulb className="h-4 w-4" /> {attentionStore.name}
              </span>
            ) : (
              "—"
            )}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

// ---- Cross‑Store Insights ----
function CrossStoreInsights() {
  const items = [
    { text: "Your Shopify store has 30% higher AOV than WooCommerce", trend: "up" as const },
    { text: "Squarespace customers have highest repeat purchase rate", trend: "up" as const },
    { text: "Consider moving top Shopify products to other platforms", trend: "neutral" as const },
    { text: "Your conversion rate is 15% above average for your category", trend: "up" as const },
  ];

  const TrendIcon = ({ t }: { t: "up" | "down" | "neutral" }) =>
    t === "up" ? <TrendingUp className="h-4 w-4" /> : t === "down" ? <TrendingDown className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />;

  return (
    <Card className="bg-white border border-gray-200 shadow-sm mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-yellow-300 flex items-center justify-center text-black">
              <span>💡</span>
            </div>
            <CardTitle className="text-black">Cross‑Store Insights</CardTitle>
          </div>
        </div>
        <CardDescription className="text-gray-600">Intelligent comparisons and recommendations across your stores.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 text-yellow-500"><TrendIcon t={it.trend} /></span>
              <span className="text-gray-900">{it.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// ---- Store Performance Grid ----
function StorePerformanceGrid({
  stores,
  onOpen,
}: {
  stores: Array<{
    id: string;
    name: string;
    platform: keyof typeof PLATFORM_META;
    metrics: { revenue: number; orders: number; aov: number; health: "good" | "warn" | "bad" };
  }>;
  onOpen: (id: string) => void;
}) {
  const healthTone = (h: "good" | "warn" | "bad") =>
    h === "good" ? "bg-green-100 text-green-800" : h === "warn" ? "bg-yellow-100 text-yellow-900" : "bg-red-100 text-red-800";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
      {stores.map((s) => (
        <Card key={s.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onOpen(s.id)}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${PLATFORM_META[s.platform].tint}`}></span>
                <CardTitle className="text-base text-black truncate">{s.name}</CardTitle>
              </div>
              <Badge className={`capitalize ${healthTone(s.metrics.health)}`} variant="secondary">
                {s.metrics.health}
              </Badge>
            </div>
            <CardDescription className="text-gray-600">{PLATFORM_META[s.platform].label}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-gray-600">Revenue</div>
                <div className="text-black font-medium">{fmtCurrency(s.metrics.revenue)}</div>
              </div>
              <div>
                <div className="text-gray-600">Orders</div>
                <div className="text-black font-medium">{fmtNumber(s.metrics.orders)}</div>
              </div>
              <div>
                <div className="text-gray-600">AOV</div>
                <div className="text-black font-medium">{fmtCurrency(s.metrics.aov)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---- Multi‑Store Charts ----
function MultiStoreCharts({
  stores,
  activeStoreIds,
  onToggleStore,
}: {
  stores: Array<{
    id: string;
    name: string;
    platform: keyof typeof PLATFORM_META;
    series: Array<{ date: string; revenue: number; orders: number; aov: number }>;
    summary: { revenue: number; orders: number; aov: number };
  }>;
  activeStoreIds: string[];
  onToggleStore: (id: string) => void;
}) {
  const [period, setPeriod] = React.useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [metric, setMetric] = React.useState<"revenue" | "orders" | "aov">("revenue");

  // Build unified x-axis by date
  const allDates = Array.from(
    new Set(stores.flatMap((s) => s.series.map((d) => d.date)))
  ).sort();

  const merged = allDates.map((date) => {
    const row: any = { date };
    stores.forEach((s) => {
      const found = s.series.find((d) => d.date === date);
      row[s.id] = found ? found[metric] : 0;
    });
    return row;
  });

  const colors = ["#111827", "#F59E0B", "#9CA3AF", "#000000"]; // black/yellow/gray tones

  const exportCsv = () => {
    const headers = ["date", ...stores.map((s) => s.name)].join(",");
    const lines = merged.map((r) => [r.date, ...stores.map((s) => r[s.id])].join(","));
    const csv = [headers, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `multi-store-${metric}-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
            <TabsList className="bg-white border border-gray-200">
              {[
                { v: "7d", l: "7d" },
                { v: "30d", l: "30d" },
                { v: "90d", l: "90d" },
                { v: "1y", l: "1y" },
              ].map((t) => (
                <TabsTrigger key={t.v} value={t.v} className="data-[state=active]:bg-yellow-100 data-[state=active]:text-black">
                  {t.l}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-200 bg-white hover:bg-yellow-50 text-black">
                Metric: {metric}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44 bg-white border-gray-200">
              <DropdownMenuLabel className="text-black">Select metric</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuRadioGroup value={metric} onValueChange={(v) => setMetric(v as any)}>
                {["revenue", "orders", "aov"].map((m) => (
                  <DropdownMenuRadioItem key={m} value={m} className="text-black hover:bg-yellow-50 focus:bg-yellow-100 capitalize">
                    {m}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-gray-200 bg-white text-black hover:bg-yellow-50" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
            <Share2 className="h-4 w-4 mr-2" /> Share
          </Button>
        </div>
      </div>

      {/* Toggle chips */}
      <div className="flex flex-wrap items-center gap-3">
        {stores.map((s, i) => (
          <label key={s.id} className="inline-flex items-center gap-2 text-sm select-none">
            <Checkbox checked={activeStoreIds.includes(s.id)} onCheckedChange={() => onToggleStore(s.id)} />
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: colors[i % colors.length] }} />
              <span className="text-gray-900">{s.name}</span>
              <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                {PLATFORM_META[s.platform].label}
              </Badge>
            </span>
          </label>
        ))}
      </div>

      {/* Revenue/Metric Trend (lines) */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-black">Multi‑Store {metric === "aov" ? "AOV" : metric.charAt(0).toUpperCase() + metric.slice(1)} Trend</CardTitle>
          <CardDescription className="text-gray-600">Toggle stores to focus the chart.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={merged} margin={{ left: 12, right: 12, top: 10 }}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: "#374151" }} />
                <YAxis tick={{ fill: "#374151" }} />
                <Tooltip contentStyle={{ borderRadius: 8 }} />
                {stores.map((s, i) =>
                  activeStoreIds.includes(s.id) ? (
                    <Line key={s.id} type="monotone" dataKey={s.id} stroke={colors[i % colors.length]} strokeWidth={2} dot={false} />
                  ) : null
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Store comparison (bars) */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-black">Store Performance Comparison</CardTitle>
          <CardDescription className="text-gray-600">Revenue, Orders, and AOV compared across stores.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stores.map((s) => ({
                  name: s.name,
                  Revenue: s.summary.revenue,
                  Orders: s.summary.orders,
                  AOV: s.summary.aov,
                }))}
                margin={{ left: 12, right: 12, top: 10 }}
              >
                <CartesianGrid vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#374151" }} />
                <YAxis tick={{ fill: "#374151" }} />
                <Tooltip contentStyle={{ borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="Revenue" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Orders" fill="#111827" radius={[6, 6, 0, 0]} />
                <Bar dataKey="AOV" fill="#9CA3AF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Main Dashboard Page ----
const Dashboard = () => {
  const sidebarLinks = [
    { label: "", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
    { label: "", href: "/integrations", icon: <CloudLightning className="w-5 h-5" /> },
    { label: "", href: "/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      <Header title="Dashboard" />
      <div className="flex h-screen bg-white">
        <Sidebar animate={true}>
          <SidebarBody className="bg-white border-r border-gray-200 w-14">
            <div className="flex flex-col h-full">
              <nav className="flex-1 p-3 space-y-4">
                {sidebarLinks.map((link, index) => (
                  <SidebarLink key={index} link={link} className="text-gray-700 hover:text-black hover:bg-gray-200 rounded-lg p-2 transition-colors flex justify-center" />
                ))}
              </nav>
            </div>
          </SidebarBody>
        </Sidebar>
        <div className="flex-1 p-8">
          <UnifiedKpiDashboard />
        </div>
      </div>
    </>
  );
};

export default Dashboard;

// ---- Unified KPI Dashboard ----
function UnifiedKpiDashboard() {
  // Replace these with real fetches to your endpoints (aggregate across stores)
  const [stores, setStores] = React.useState<
    Array<{
      id: string;
      name: string;
      platform: keyof typeof PLATFORM_META;
      metrics: { revenue: number; orders: number; aov: number; health: "good" | "warn" | "bad" };
      series: Array<{ date: string; revenue: number; orders: number; aov: number }>;
      summary: { revenue: number; orders: number; aov: number };
    }>
  >([
    {
      id: "s1",
      name: "demo-store.myshopify.com",
      platform: "shopify",
      metrics: { revenue: 125000, orders: 1200, aov: 104, health: "good" },
      series: Array.from({ length: 30 }).map((_, i) => ({ date: `2025-07-${String(i + 1).padStart(2, "0")}`, revenue: 2500 + i * 50, orders: 40 + i, aov: 100 + (i % 5) })),
      summary: { revenue: 125000, orders: 1200, aov: 104 },
    },
    {
      id: "s2",
      name: "demo-store.com",
      platform: "woocommerce",
      metrics: { revenue: 88000, orders: 1000, aov: 88, health: "warn" },
      series: Array.from({ length: 30 }).map((_, i) => ({ date: `2025-07-${String(i + 1).padStart(2, "0")}`, revenue: 1900 + i * 30, orders: 30 + i, aov: 85 + (i % 3) })),
      summary: { revenue: 88000, orders: 1000, aov: 88 },
    },
    {
      id: "s3",
      name: "brand.sqsp.com",
      platform: "squarespace",
      metrics: { revenue: 54000, orders: 620, aov: 87, health: "bad" },
      series: Array.from({ length: 30 }).map((_, i) => ({ date: `2025-07-${String(i + 1).padStart(2, "0")}`, revenue: 1200 + i * 20, orders: 18 + i, aov: 86 + (i % 2) })),
      summary: { revenue: 54000, orders: 620, aov: 87 },
    },
  ]);

  const [selected, setSelected] = React.useState<string>("all");
  const [active, setActive] = React.useState<string[]>(stores.map((s) => s.id));

  // Aggregate portfolio totals
  const activeStores = selected === "all" ? stores : stores.filter((s) => s.id === selected);
  const totals = activeStores.reduce(
    (acc, s) => ({
      revenue: acc.revenue + s.summary.revenue,
      orders: acc.orders + s.summary.orders,
      aov: Math.round(((acc.aov * acc.count + s.summary.aov) / (acc.count + 1)) * 100) / 100,
      count: acc.count + 1,
    }),
    { revenue: 0, orders: 0, aov: 0, count: 0 }
  ) as any as { revenue: number; orders: number; aov: number };

  // Simple health score heuristic (placeholder)
  const healthScore = Math.max(
    10,
    Math.min(
      95,
      Math.round(
        (activeStores.reduce((acc, s) => acc + (s.metrics.health === "good" ? 85 : s.metrics.health === "warn" ? 60 : 35), 0) / activeStores.length) *
          1
      )
    )
  );

  const bestStoreId = stores.slice().sort((a, b) => b.summary.revenue - a.summary.revenue)[0]?.id ?? null;
  const attentionStoreId = stores.find((s) => s.metrics.health !== "good")?.id ?? null;

  const toggleStore = (id: string) =>
    setActive((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const onOpenStore = (id: string) => {
    // Navigate to individual store view (replace with your router if needed)
    const url = new URL(window.location.href);
    url.searchParams.set("shop", id);
    window.history.pushState({}, "", url.toString());
  };

  const handleAddStore = () => {
    window.location.href = "/integrations";
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-black">Unified Dashboard</h1>
          <StoreSwitcher stores={stores.map(({ id, name, platform }) => ({ id, name, platform }))} value={selected} onChange={setSelected} onAdd={handleAddStore} />
        </div>
      </div>

      {/* Portfolio Health */}
      <PortfolioHealth stores={stores.map((s) => ({ id: s.id, name: s.name, platform: s.platform, health: s.metrics.health }))} totals={totals} bestStoreId={bestStoreId} attentionStoreId={attentionStoreId} healthScore={healthScore} />

      {/* Insights */}
      <CrossStoreInsights />

      {/* Store Grid */}
      <StorePerformanceGrid stores={stores.map((s) => ({ id: s.id, name: s.name, platform: s.platform, metrics: { ...s.metrics } }))} onOpen={onOpenStore} />

      {/* Charts */}
      <MultiStoreCharts stores={stores} activeStoreIds={active} onToggleStore={toggleStore} />
    </div>
  );
}