"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { shopifyApi } from "@/lib/api/integrations/shopify";
import { CheckCircle, AlertCircle, Clock, RefreshCw, Trash2, UserX } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { useApiClientSafe } from "@/lib/hooks/use-api-with-errors";
import { useAuth } from "@/lib/supabase/auth-context";
import { DeleteAccountModal } from "@/components/auth/delete-account-modal";
import { ConnectedStoresList } from "@/components/ui/connected-stores-list";

interface ConnectedStore {
  id: string;
  name: string;
  platform: string;
  connected_at: string;
}

interface ShopifyStatus {
  connected: boolean;
  stores: ConnectedStore[];
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
  const { user } = useAuth();
  const [shopifyStatus, setShopifyStatus] = useState<ShopifyStatus | null>(null);
  const [aiInsightsStatus, setAiInsightsStatus] = useState<AIInsightsStatus>({
    isActive: false,
    totalInsights: 0,
    highImpactInsights: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [shop] = useState("demo-store");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        // Fetch Shopify status and stores
        try {
          const shopifyData = await apiClient.get('/integrations/shopify/status', false) as { 
            connected: boolean;
            stores: ConnectedStore[];
            connected_at: string | null;
          };
          
          setShopifyStatus({
            connected: shopifyData.connected,
            stores: shopifyData.stores || [],
            connected_at: shopifyData.connected_at,
            last_orders_sync_at: null, // TODO: Add these to API response if needed
            last_products_sync_at: null,
            last_inventory_sync_at: null,
          });

          setAiInsightsStatus({
            isActive: shopifyData.connected,
            totalInsights: 0, // TODO: Calculate from actual insights
            highImpactInsights: 0,
            dataSources: {
              'Shopify Analytics': shopifyData.connected,
              'Google Analytics': false, // Not implemented yet
            }
          });
        } catch (error) {
          console.error("Failed to fetch Shopify status:", error);
          // Set default values on error
          setShopifyStatus({
            connected: false,
            stores: [],
            connected_at: null,
            last_orders_sync_at: null,
            last_products_sync_at: null,
            last_inventory_sync_at: null,
          });
          
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
  }, [apiClient]);

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

  const handleStoreSync = async (storeId: string) => {
    try {
      // For now, use the existing sync functionality
      // In the future, you could modify the API to accept store ID
      await shopifyApi.sync(shop);
      alert('Store synced successfully!');
      window.location.reload();
    } catch (error: any) {
      alert(`Failed to sync store: ${error.message}`);
    }
  };

  const handleStoreDisconnect = async (storeId: string) => {
    const store = shopifyStatus?.stores.find(s => s.id === storeId);
    if (!store) return;
    
    if (!confirm(`Are you sure you want to disconnect "${store.name}"?`)) return;
    
    try {
      // For now, use the existing disconnect functionality
      // In the future, you could modify the API to accept store ID
      await shopifyApi.disconnect(shop);
      alert(`Store "${store.name}" disconnected successfully!`);
      window.location.reload();
    } catch (error: any) {
      alert(`Failed to disconnect store: ${error.message}`);
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
            {/* Connected Stores List */}
            {shopifyStatus?.stores && shopifyStatus.stores.length > 0 && (
              <ConnectedStoresList 
                stores={shopifyStatus.stores}
                onSync={handleStoreSync}
                onDisconnect={handleStoreDisconnect}
              />
            )}
            
            {/* Shopify Connect Card */}
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
                <p className="text-sm text-gray-600">Beta test</p>
              </div>
              <Button variant="outline">Upgrade Plan</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Next Billing Date</p>
                <p className="text-sm text-gray-600">Never</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className="border-red-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-red-600 flex items-center gap-2">
              <UserX className="h-5 w-5" />
              Account Management
            </CardTitle>
            <CardDescription>
              Manage your account settings and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <p className="font-medium mb-2">Danger Zone</p>
                  <p className="mb-3">
                    Deleting your account will permanently remove all your data, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs mb-3">
                    <li>All connected Shopify stores and data</li>
                    <li>Order history and analytics</li>
                    <li>Product information and inventory</li>
                    <li>Subscription and billing information</li>
                    <li>Your profile and account settings</li>
                  </ul>
                  <p className="text-xs">
                    This action cannot be undone. Please make sure you have exported any important data before proceeding.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Delete Account</p>
                <p className="text-sm text-gray-600">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button
                onClick={() => setShowDeleteModal(true)}
                className="bg-white text-red-600 hover:bg-red-700 hover:text-white border border-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </FadeIn>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        userEmail={user?.email}
      />
    </AppLayout>
  );
}

