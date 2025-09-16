"use client";

import React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/auth/auth-guard";
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
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  ChevronDown,
  TrendingUp,
  Store,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { ProductAnalyticsTable } from "@/components/dashboard/product-analytics-table";
import { useApiClientSafe } from "@/lib/hooks/use-api-with-errors";
import { useSearchParams } from "next/navigation";

// ---- Utilities ----
const fmtCurrency = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
const fmtNumber = (n: number) => new Intl.NumberFormat(undefined).format(n || 0);

// Platform meta & icons (simple labels; replace with real icons/assets if available)
const PLATFORM_META: Record<string, { label: string; tint: string }> = {
  shopify: { label: "Shopify", tint: "bg-[#FDE68A]" }, // yellow tint
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
          <Button variant="outline" className="flex items-center gap-2 border-gray-300 bg-white hover:bg-gray-200 text-black">
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
            <DropdownMenuRadioItem value="all" className="text-black hover:bg-gray-200">
              All Stores
            </DropdownMenuRadioItem>
            {stores.map((s) => (
              <DropdownMenuRadioItem key={s.id} value={s.id} className="text-black hover:bg-gray-200">
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
            <Button onClick={onAdd} className="w-full bg-black hover:bg-gray-900 text-white">
              Add store
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ---- KPI Cards ----
function KPICards({
  stores,
  totals,
}: {
  stores: Array<{ id: string; name: string; platform: keyof typeof PLATFORM_META; health: "good" | "warn" | "bad" }>;
  totals: { revenue: number; orders: number; aov: number };
}) {
  // Mock data for connected Shopify store
  const mockKpiData = stores.length > 0 ? [
    {
      title: "Total Revenue",
      value: "$24,750.00",
      change: "+18.3%",
      changeType: "positive" as const,
      status: "Strong month-over-month growth",
      subtext: "Revenue up from last month",
    },
    {
      title: "Orders",
      value: "1,247",
      change: "+12.1%",
      changeType: "positive" as const,
      status: "Order volume increasing steadily",
      subtext: "Higher conversion rates",
    },
    {
      title: "Average Order Value",
      value: "$89.50",
      change: "+5.7%",
      changeType: "positive" as const,
      status: "Customers spending more per order",
      subtext: "Upselling strategies working",
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      change: "+0.8%",
      changeType: "positive" as const,
      status: "Above industry average",
      subtext: "Optimized checkout flow",
    },
  ] : [
    {
      title: "Total Revenue",
      value: "$0.00",
      change: "0%",
      changeType: "positive" as const,
      status: "Connect your Shopify store to see revenue data",
      subtext: "No data available",
    },
    {
      title: "Orders",
      value: "0",
      change: "0%",
      changeType: "positive" as const,
      status: "Connect your Shopify store to see order data",
      subtext: "No data available",
    },
    {
      title: "Average Order Value",
      value: "$0.00",
      change: "0%",
      changeType: "positive" as const,
      status: "Connect your Shopify store to see AOV data",
      subtext: "No data available",
    },
    {
      title: "Conversion rate",
      value: "0%",
      change: "0%",
      changeType: "positive" as const,
      status: "Connect your Shopify store to see conversion data",
      subtext: "No data available",
    },
  ];

  const kpiData = mockKpiData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpiData.map((kpi, index) => (
        <Card key={index} className="bg-white border border-gray-200 shadow-sm rounded-lg">
          <CardContent>
            <div className="relative">
              {/* Title */}
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                {kpi.title}
              </p>
              
              {/* Value */}
              <p className="text-3xl font-bold text-gray-900 mb-3">
                {kpi.value}
              </p>
              
              {/* Percentage Badge */}
              <div className="absolute top-0 right-0">
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  kpi.changeType === "positive" 
                    ? "bg-green-100 text-green-600" 
                    : "bg-red-100 text-red-600"
                }`}>
                  {kpi.changeType === "positive" ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {kpi.change}
          </div>
        </div>
              
              {/* Status Message */}
              <p className="text-sm text-gray-500 mb-2">
                {kpi.status}
              </p>
              
              {/* Subtext with Arrow */}
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>{kpi.subtext}</span>
                {kpi.changeType === "positive" ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


// ---- Total Visitors Chart ----
function TotalVisitorsChart({ stores }: { stores: Array<{id: string; name: string; platform: string; metrics: any; summary: any}> }) {
  const [timeRange, setTimeRange] = React.useState<"3months" | "30days" | "7days">("3months");
  const [metricType, setMetricType] = React.useState<"visitors" | "sessions" | "page_views" | "orders" | "revenue" | "conversion_rate">("visitors");
  
  // Mock analytics data for different time ranges - realistic Shopify store data
  const analyticsData = {
    "3months": [
      { 
        date: "Oct", 
        visitors: 2840, 
        sessions: 3200, 
        page_views: 12800, 
        orders: 95, 
        revenue: 18500, 
        conversion_rate: 2.97 
      },
      { 
        date: "Nov", 
        visitors: 3150, 
        sessions: 3550, 
        page_views: 14200, 
        orders: 112, 
        revenue: 22100, 
        conversion_rate: 3.15 
      },
      { 
        date: "Dec", 
        visitors: 3890, 
        sessions: 4380, 
        page_views: 17520, 
        orders: 147, 
        revenue: 28900, 
        conversion_rate: 3.36 
      },
    ],
    "30days": [
      { date: "Dec 1", visitors: 1250, sessions: 1400, page_views: 5600, orders: 4, revenue: 680, conversion_rate: 0.29 },
      { date: "Dec 4", visitors: 1420, sessions: 1600, page_views: 6400, orders: 5, revenue: 850, conversion_rate: 0.31 },
      { date: "Dec 7", visitors: 1180, sessions: 1320, page_views: 5280, orders: 3, revenue: 520, conversion_rate: 0.23 },
      { date: "Dec 10", visitors: 1680, sessions: 1890, page_views: 7560, orders: 7, revenue: 1190, conversion_rate: 0.37 },
      { date: "Dec 13", visitors: 1920, sessions: 2160, page_views: 8640, orders: 9, revenue: 1530, conversion_rate: 0.42 },
      { date: "Dec 16", visitors: 1450, sessions: 1630, page_views: 6520, orders: 5, revenue: 850, conversion_rate: 0.31 },
      { date: "Dec 19", visitors: 2100, sessions: 2360, page_views: 9440, orders: 11, revenue: 1870, conversion_rate: 0.47 },
      { date: "Dec 22", visitors: 2850, sessions: 3200, page_views: 12800, orders: 15, revenue: 2550, conversion_rate: 0.47 },
      { date: "Dec 25", visitors: 3200, sessions: 3600, page_views: 14400, orders: 18, revenue: 3060, conversion_rate: 0.50 },
      { date: "Dec 28", visitors: 3890, sessions: 4380, page_views: 17520, orders: 22, revenue: 3740, conversion_rate: 0.50 },
    ],
    "7days": [
      { date: "Mon", visitors: 1420, sessions: 1600, page_views: 6400, orders: 6, revenue: 1020, conversion_rate: 0.38 },
      { date: "Tue", visitors: 1680, sessions: 1890, page_views: 7560, orders: 8, revenue: 1360, conversion_rate: 0.42 },
      { date: "Wed", visitors: 1350, sessions: 1520, page_views: 6080, orders: 5, revenue: 850, conversion_rate: 0.33 },
      { date: "Thu", visitors: 1920, sessions: 2160, page_views: 8640, orders: 10, revenue: 1700, conversion_rate: 0.46 },
      { date: "Fri", visitors: 2100, sessions: 2360, page_views: 9440, orders: 12, revenue: 2040, conversion_rate: 0.51 },
      { date: "Sat", visitors: 2850, sessions: 3200, page_views: 12800, orders: 16, revenue: 2720, conversion_rate: 0.50 },
      { date: "Sun", visitors: 3200, sessions: 3600, page_views: 14400, orders: 18, revenue: 3060, conversion_rate: 0.50 },
    ],
  };

  // Empty data for when no store is connected
  const emptyAnalyticsData = {
    "3months": [
      { date: "Oct", visitors: 0, sessions: 0, page_views: 0, orders: 0, revenue: 0, conversion_rate: 0 },
      { date: "Nov", visitors: 0, sessions: 0, page_views: 0, orders: 0, revenue: 0, conversion_rate: 0 },
      { date: "Dec", visitors: 0, sessions: 0, page_views: 0, orders: 0, revenue: 0, conversion_rate: 0 },
    ],
    "30days": [
      { date: "Day 1", visitors: 0, sessions: 0, page_views: 0, orders: 0, revenue: 0, conversion_rate: 0 },
      { date: "Day 5", visitors: 0, sessions: 0, page_views: 0, orders: 0, revenue: 0, conversion_rate: 0 },
      { date: "Day 10", visitors: 0, sessions: 0, page_views: 0, orders: 0, revenue: 0, conversion_rate: 0 },
      { date: "Day 15", visitors: 0, sessions: 0, page_views: 0, orders: 0, revenue: 0, conversion_rate: 0 },
      { date: "Day 20", visitors: 0, sessions: 0, page_views: 0, orders: 0, revenue: 0, conversion_rate: 0 },
      { date: "Day 25", visitors: 0, sessions: 0, page_views: 0, orders: 0, revenue: 0, conversion_rate: 0 },
      { date: "Day 30", visitors: 0, sessions: 0, page_views: 0, orders: 0, revenue: 0, conversion_rate: 0 },
    ],
    "7days": [
      { date: "Mon", visitors: 0, sessions: 0, page_views: 0, orders: 0, revenue: 0, conversion_rate: 0 },
      { date: "Tue", visitors: 0, sessions: 0, page_views: 0, orders: 0, revenue: 0, conversion_rate: 0 },
      { date: "Wed", visitors: 0, sessions: 0, page_views: 0, orders: 0, revenue: 0, conversion_rate: 0 },
      { date: "Thu", visitors: 0, sessions: 0, page_views: 0, orders: 0, revenue: 0, conversion_rate: 0 },
      { date: "Fri", visitors: 0, sessions: 0, page_views: 0, orders: 0, revenue: 0, conversion_rate: 0 },
      { date: "Sat", visitors: 0, sessions: 0, page_views: 0, orders: 0, revenue: 0, conversion_rate: 0 },
      { date: "Sun", visitors: 0, sessions: 0, page_views: 0, orders: 0, revenue: 0, conversion_rate: 0 },
    ],
  };

  // Shopify analytics metrics available through read_analytics scope
  const metricOptions = [
    { value: "visitors", label: "Visitors", format: "number" },
    { value: "sessions", label: "Sessions", format: "number" },
    { value: "page_views", label: "Page Views", format: "number" },
    { value: "orders", label: "Orders", format: "number" },
    { value: "revenue", label: "Revenue", format: "currency" },
    { value: "conversion_rate", label: "Conversion Rate", format: "percentage" },
  ];

  const timeRangeOptions = [
    { value: "3months", label: "Last 3 months" },
    { value: "30days", label: "Last 30 days" },
    { value: "7days", label: "Last 7 days" },
  ];

  const currentData = stores.length > 0 ? analyticsData[timeRange] : emptyAnalyticsData[timeRange];
  
  const selectedMetric = metricOptions.find(opt => opt.value === metricType);
  
  const chartConfig = {
    [metricType]: {
      label: selectedMetric?.label || "Metric",
      color: "#111827",
    },
  };

  // Format tooltip values based on metric type
  const formatTooltipValue = (value: any) => {
    if (selectedMetric?.format === "currency") {
      return fmtCurrency(value);
    } else if (selectedMetric?.format === "percentage") {
      return `${value}%`;
    } else {
      return value?.toLocaleString();
    }
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              {selectedMetric?.label || "Analytics"}
            </CardTitle>
            <CardDescription className="text-gray-500 text-sm">
              {timeRange === "3months" && `Monthly ${selectedMetric?.label.toLowerCase()} for the last 3 months`}
              {timeRange === "30days" && `Daily ${selectedMetric?.label.toLowerCase()} for the last 30 days`}
              {timeRange === "7days" && `Daily ${selectedMetric?.label.toLowerCase()} for the last 7 days`}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Metric Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-200 bg-white hover:bg-gray-200 text-black">
                  {selectedMetric?.label}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white border-gray-200">
                <DropdownMenuLabel className="text-black">Analytics Metric</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuRadioGroup value={metricType} onValueChange={(v) => setMetricType(v as any)}>
                  {metricOptions.map((option) => (
                    <DropdownMenuRadioItem key={option.value} value={option.value} className="text-black hover:bg-gray-200">
                      {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
            
            {/* Time Range Toggle Buttons */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value as any)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    timeRange === option.value
                      ? "bg-white text-gray-900 shadow-sm font-semibold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {option.label}
                </button>
              ))}
        </div>
      </div>
      </div>
        </CardHeader>
      <CardContent>
        <div className="h-80">
          {stores.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Connect your store to see analytics data</p>
              </div>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-full">
              <AreaChart data={currentData} margin={{ left: 12, right: 12, top: 10 }}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8} 
                  tick={{ fill: "#374151", fontSize: 12 }} 
                />
                <YAxis 
                  tick={{ fill: "#374151", fontSize: 12 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: any, name: string) => [
                    formatTooltipValue(value),
                    selectedMetric?.label || "Metric"
                  ]}
                />
                <defs>
                  <linearGradient id={`fill${metricType}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111827" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#111827" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey={metricType} 
                  stroke="#111827" 
                  strokeWidth={2}
                  fill={`url(#fill${metricType})`}
                  fillOpacity={1}
                />
              </AreaChart>
            </ChartContainer>
          )}
          </div>
        </CardContent>
      </Card>
  );
}




// ---- Main Dashboard Page ----
const Dashboard = () => {
  return (
    <AuthGuard>
    <AppLayout title="Dashboard">
          <UnifiedKpiDashboard />
    </AppLayout>
    </AuthGuard>
  );
};

// ---- Unified KPI Dashboard ----
function UnifiedKpiDashboard() {
  const apiClient = useApiClientSafe();
  const searchParams = useSearchParams();
  const [stores, setStores] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<string>("all");
  const [connectionStatus, setConnectionStatus] = React.useState<{type: 'success' | 'error' | null, message: string}>({type: null, message: ''});

  // Handle query parameters for connection status
  React.useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    const details = searchParams.get('details');

    if (connected === 'shopify') {
      setConnectionStatus({
        type: 'success',
        message: 'Shopify store connected successfully!'
      });
      // Clear the URL parameters
      window.history.replaceState({}, '', '/dashboard');
    } else if (error) {
      setConnectionStatus({
        type: 'error',
        message: details ? decodeURIComponent(details) : 'Connection failed. Please try again.'
      });
      // Clear the URL parameters
      window.history.replaceState({}, '', '/dashboard');
    } else {
      // Check for connection status in cookies (fallback for auth redirects)
      const cookieStatus = document.cookie
        .split('; ')
        .find(row => row.startsWith('shopify_connection_status='))
        ?.split('=')[1];
      
      if (cookieStatus === 'success') {
        setConnectionStatus({
          type: 'success',
          message: 'Shopify store connected successfully!'
        });
        // Clear the cookie
        document.cookie = 'shopify_connection_status=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      } else if (cookieStatus === 'error') {
        setConnectionStatus({
          type: 'error',
          message: 'Connection failed. Please try again.'
        });
        // Clear the cookie
        document.cookie = 'shopify_connection_status=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    }
  }, [searchParams]);

  // Load store data on component mount
  React.useEffect(() => {
    const loadStores = async () => {
      try {
        // Fetch connected stores
        const shopifyData = await apiClient.get('/integrations/shopify/status', false) as { connected: boolean, stores?: any[] };
        
        // Process store data
        const processedStores: any[] = [];
        
        if (shopifyData.connected && shopifyData.stores) {
          shopifyData.stores.forEach((store: any) => {
            processedStores.push({
              id: store.id || store.name,
              name: store.name,
              platform: 'shopify',
              summary: {
                revenue: store.revenue || 0,
                orders: store.orders || 0,
                aov: store.aov || 0,
                conversion: store.conversion_rate || 0,
              },
              metrics: {
                health: store.is_connected ? 'good' : 'warning',
                growth: store.growth_rate || 0,
                inventory: store.inventory_status || 'normal',
              }
            });
          });
        }
        
        setStores(processedStores);
      } catch (error) {
        console.error('Failed to load stores:', error);
        // Keep empty stores array on error
        setStores([]);
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, [apiClient]);

  const activeStores = selected === "all" ? stores : stores.filter((s) => s.id === selected);

  // Default totals if no stores
  const totals = activeStores.length
    ? activeStores.reduce(
        (acc, s) => ({
          revenue: acc.revenue + s.summary.revenue,
          orders: acc.orders + s.summary.orders,
          aov: Math.round(((acc.aov * acc.count + s.summary.aov) / (acc.count + 1)) * 100) / 100,
          count: acc.count + 1,
        }),
        { revenue: 0, orders: 0, aov: 0, count: 0 }
      )
    : { revenue: 0, orders: 0, aov: 0 };

  const handleAddStore = () => {
    window.location.href = "/integrations";
  };

  // Show loading state while fetching stores
  if (loading) {
    return (
      <FadeIn>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Loading Dashboard...</h2>
              <p className="text-gray-600">
                Please wait while we load your store data.
              </p>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
    <div className="max-w-7xl mx-auto">
        {/* Connection Status Notification */}
        {connectionStatus.type && (
          <div className={`mb-4 p-4 rounded-lg border ${
            connectionStatus.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {connectionStatus.type === 'success' ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />} {connectionStatus.message}
              </span>
              <button 
                onClick={() => setConnectionStatus({type: null, message: ''})}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

      {/* Header Row */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <StoreSwitcher
            stores={stores.map(({ id, name, platform }) => ({ id, name, platform }))}
            value={selected}
            onChange={setSelected}
            onAdd={handleAddStore}
          />
          
        </div>
      </div>

        {/* KPI Cards */}
        <KPICards
        stores={stores.map((s) => ({ id: s.id, name: s.name, platform: s.platform, health: s.metrics.health }))}
        totals={totals}
        />


        {/* Total Visitors Chart */}
        <TotalVisitorsChart stores={stores} />

        {/* Product Analytics Table */}
        <ProductAnalyticsTable stores={stores} />
          </div>
    </FadeIn>
  );
}

export default Dashboard;