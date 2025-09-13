"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { shopifyApi } from "@/lib/api/integrations/shopify";
import { CheckCircle, AlertCircle, Clock, RefreshCw, Trash2 } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { useApiClientSafe } from "@/lib/hooks/use-api-with-errors";

interface ShopifyStatus {
  connected: boolean;
  connected_at: string | null;
  last_orders_sync_at: string | null;
  last_products_sync_at: string | null;
  last_inventory_sync_at: string | null;
}

interface AIInsightsStatus {
  isActive: boolean;
  totalInsights: number;
  highImpactInsights: number;
  dataSources?: {[key: string]: boolean};
}


export default function SettingsPage() {
  const apiClient = useApiClientSafe();
  const [shopifyStatus, setShopifyStatus] = useState<ShopifyStatus | null>(null);
  const [aiInsightsStatus, setAiInsightsStatus] = useState<AIInsightsStatus>({
    isActive: false,
    totalInsights: 0,
    highImpactInsights: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [shop] = useState("demo-store");

  useEffect(() => {
    const loadStatus = async () => {
      try {
        // For now, we'll simulate the status since the API methods don't exist yet
        // In a real implementation, you'd call the actual API endpoints
        setShopifyStatus({
          connected: false,
          connected_at: null,
          last_orders_sync_at: null,
          last_products_sync_at: null,
          last_inventory_sync_at: null,
        });

        // Fetch AI insights status
        try {
          const insightsData = await apiClient.get('/ai/insights', false) as { insights?: any[] };
          const shopifyData = await apiClient.get('/integrations/shopify/status', false) as { connected: boolean };
          
          const insights = insightsData.insights || [];
          const highImpactInsights = insights.filter((insight: any) => insight.impact === 'high').length;
          
          setAiInsightsStatus({
            isActive: shopifyData.connected,
            totalInsights: insights.length,
            highImpactInsights,
            dataSources: {
              'Shopify Analytics': shopifyData.connected,
              'Google Analytics': false, // Not implemented yet
            }
          });
        } catch (error) {
          // Silently handle AI insights errors
          setAiInsightsStatus({
            isActive: false,
            totalInsights: 0,
            highImpactInsights: 0,
            dataSources: {
              'Shopify Analytics': false,
              'Google Analytics': false,
            }
          });
        }
      } catch (error) {
        console.error("Failed to load integration status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStatus();
  }, [shop, apiClient]);

  const handleSync = async () => {
    try {
      await shopifyApi.sync(shop);
      alert('Shopify store synced successfully!');
      window.location.reload();
    } catch (error: any) {
      alert(`Failed to sync Shopify: ${error.message}`);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Shopify store?')) return;
    try {
      await shopifyApi.disconnect(shop);
      alert('Shopify store disconnected successfully!');
      window.location.reload();
    } catch (error: any) {
      alert(`Failed to disconnect Shopify: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Settings">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Settings">
      <FadeIn>
        <div className="space-y-6">
        {/* Connected Store */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Connected Store</CardTitle>
            <CardDescription>
              Manage your connected Shopify store
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Shopify */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                    <img src="/shopify_glyph.svg" alt="Shopify" className="w-auto h-full" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Shopify</h3>
                    <p className="text-sm text-gray-600">{shop}.myshopify.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {shopifyStatus?.connected ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                  )}
                  <Badge variant={shopifyStatus?.connected ? "default" : "secondary"}>
                    {shopifyStatus?.connected ? "Connected" : "Not Connected"}
                  </Badge>
                </div>
              </div>

              {shopifyStatus?.connected && (
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Connected: {shopifyStatus.connected_at ? new Date(shopifyStatus.connected_at).toLocaleDateString() : "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>Last Orders Sync: {shopifyStatus.last_orders_sync_at ? new Date(shopifyStatus.last_orders_sync_at).toLocaleString() : "Never"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>Last Products Sync: {shopifyStatus.last_products_sync_at ? new Date(shopifyStatus.last_products_sync_at).toLocaleString() : "Never"}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {shopifyStatus?.connected ? (
                  <>
                    <Button onClick={handleSync} size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Now
                    </Button>
                    <Button onClick={handleDisconnect} variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button asChild size="sm" className="bg-black hover:bg-gray-900 text-white">
                    <a href="/integrations">Connect Shopify</a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">AI Insights</CardTitle>
            <CardDescription>
              Configure AI-powered insights and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">AI Analysis</p>
                <p className="text-sm text-gray-600">
                  {aiInsightsStatus.isActive 
                    ? "Enabled - Analyzing your store data" 
                    : "No data available - Connect a store to enable insights"
                  }
                </p>
              </div>
              <Badge variant="outline" className={aiInsightsStatus.isActive ? "text-green-600 border-green-200" : "text-gray-500 border-gray-300"}>
                {aiInsightsStatus.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Insights Generated</p>
                <p className="text-sm text-gray-600">
                  {aiInsightsStatus.totalInsights > 0 
                    ? `${aiInsightsStatus.totalInsights} insights available` 
                    : "No insights generated yet"
                  }
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <a href="/insights">View All</a>
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">High Impact Opportunities</p>
                <p className="text-sm text-gray-600">
                  {aiInsightsStatus.highImpactInsights > 0 
                    ? `${aiInsightsStatus.highImpactInsights} recommendations ready to implement` 
                    : "No high-impact opportunities identified"
                  }
                </p>
              </div>
            </div>
            {aiInsightsStatus.dataSources && (
              <div>
                <p className="font-medium text-gray-900 mb-2">Data Sources</p>
                <div className="space-y-1">
                  {Object.entries(aiInsightsStatus.dataSources).map(([source, connected]) => (
                    <div key={source} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{source}</span>
                      <Badge 
                        variant={connected ? "outline" : "secondary"} 
                        className={`text-xs ${connected ? 'text-green-600 border-green-200' : 'text-gray-500'}`}
                      >
                        {connected ? 'Connected' : 'Not Connected'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing & Subscription */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Billing & Subscription</CardTitle>
            <CardDescription>
              Manage your subscription and billing information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Current Plan</p>
                <p className="text-sm text-gray-600">Free Plan</p>
              </div>
              <Button variant="outline">Upgrade Plan</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Next Billing Date</p>
                <p className="text-sm text-gray-600">No active subscription</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </FadeIn>
    </AppLayout>
  );
}

