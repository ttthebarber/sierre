"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { shopifyApi } from "@/lib/api/integrations/shopify";
import { woocommerceApi } from "@/lib/api/integrations/woocommerce";
import { Header } from "@/components/ui/header";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { Home, Settings, CloudLightning } from "lucide-react";

interface ShopifyStatus {
  connected: boolean;
  connected_at: string | null;
  last_orders_sync_at: string | null;
  last_products_sync_at: string | null;
  last_inventory_sync_at: string | null;
}

interface WooCommerceStatus {
  connected: boolean;
  connected_at: string | null;
  last_orders_sync_at: string | null;
  last_products_sync_at: string | null;
}

export default function SettingsPage() {
  const [shopifyStatus, setShopifyStatus] = useState<ShopifyStatus | null>(null);
  const [woocommerceStatus, setWooCommerceStatus] = useState<WooCommerceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shop, setShop] = useState("demo-store");

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const [shopify, woocommerce] = await Promise.allSettled([
          shopifyApi.getStatus(shop),
          woocommerceApi.getStatus(shop),
        ]);

        if (shopify.status === "fulfilled") setShopifyStatus(shopify.value);
        if (woocommerce.status === "fulfilled") setWooCommerceStatus(woocommerce.value);
      } catch (error) {
        console.error("Failed to load integration status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStatus();
  }, [shop]);

  const handleSync = async (provider: "shopify" | "woocommerce") => {
    try {
      if (provider === "shopify") {
        await shopifyApi.sync(shop);
      } else {
        await woocommerceApi.sync(shop);
      }
      alert(`${provider} store synced successfully!`);
      window.location.reload();
    } catch (error: any) {
      alert(`Failed to sync ${provider}: ${error.message}`);
    }
  };

  const handleDisconnect = async (provider: "shopify" | "woocommerce") => {
    if (!confirm(`Are you sure you want to disconnect your ${provider} store?`)) return;
    try {
      if (provider === "shopify") {
        await shopifyApi.disconnect(shop);
      } else {
        await woocommerceApi.disconnect(shop);
      }
      alert(`${provider} store disconnected successfully!`);
      window.location.reload();
    } catch (error: any) {
      alert(`Failed to disconnect ${provider}: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="Settings" />
        <div className="flex h-screen bg-white">
          <Sidebar animate={false}>
            <SidebarBody className="bg-white border-r border-gray-200 w-14">
              <div className="flex flex-col h-full">
                <nav className="flex-1 p-3 space-y-4">
                  {[
                    { label: "", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
                    { label: "", href: "/integrations", icon: <CloudLightning className="w-5 h-5" /> },
                    { label: "", href: "/settings", icon: <Settings className="w-5 h-5" /> },
                  ].map((link, index) => (
                    <SidebarLink
                      key={index}
                      link={link}
                      className="text-gray-700 hover:text-black hover:bg-gray-200 rounded-lg p-2 transition-colors flex justify-center"
                    />
                  ))}
                </nav>
              </div>
            </SidebarBody>
          </Sidebar>
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Settings" />
      <div className="flex h-screen bg-white">
        <Sidebar animate={true}>
          <SidebarBody className="bg-white border-r border-gray-200 w-14">
            <div className="flex flex-col h-full">
              <nav className="flex-1 p-3 space-y-4">
                {[
                  { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
                  { label: "Integrations", href: "/integrations", icon: <CloudLightning className="w-5 h-5" /> },
                  { label: "Settings", href: "/settings", icon: <Settings className="w-5 h-5" /> },
                ].map((link, index) => (
                  <SidebarLink
                    key={index}
                    link={link}
                    className="text-gray-700 hover:text-black hover:bg-gray-200 rounded-lg p-2 transition-colors flex justify-center"
                  />
                ))}
              </nav>
            </div>
          </SidebarBody>
        </Sidebar>
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-black">Settings</h1>

            <div className="space-y-6">
              {/* Account Settings */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-black">Account</CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage your account settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-black">Email</p>
                      <p className="text-sm text-gray-600">user@example.com</p>
                    </div>
                    <Button variant="outline">Change Email</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-black">Password</p>
                      <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Integrations */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-black">Connected Stores</CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage your connected e‑commerce platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Shopify */}
                  <div className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold">S</div>
                        <div>
                          <h3 className="font-medium text-black">Shopify</h3>
                          <p className="text-sm text-gray-600">{shop}.myshopify.com</p>
                        </div>
                      </div>
                      <Badge variant={shopifyStatus?.connected ? "default" : "secondary"}>
                        {shopifyStatus?.connected ? "Connected" : "Not Connected"}
                      </Badge>
                    </div>

                    {shopifyStatus?.connected && (
                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <p>Connected: {shopifyStatus.connected_at ? new Date(shopifyStatus.connected_at).toLocaleDateString() : "Unknown"}</p>
                        <p>Last Orders Sync: {shopifyStatus.last_orders_sync_at ? new Date(shopifyStatus.last_orders_sync_at).toLocaleString() : "Never"}</p>
                        <p>Last Products Sync: {shopifyStatus.last_products_sync_at ? new Date(shopifyStatus.last_products_sync_at).toLocaleString() : "Never"}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {shopifyStatus?.connected ? (
                        <>
                          <Button onClick={() => handleSync("shopify")} size="sm">
                            Sync Now
                          </Button>
                          <Button onClick={() => handleDisconnect("shopify")} variant="outline" size="sm">
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button asChild size="sm">
                          <a href="/integrations">Connect Shopify</a>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* WooCommerce */}
                  <div className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img src="/WooCommerce_logo.svg" alt="WooCommerce" className="h-6" />
                        <div>
                          <h3 className="font-medium text-black">WooCommerce</h3>
                          <p className="text-sm text-gray-600">{shop}.com</p>
                        </div>
                      </div>
                      <Badge variant={woocommerceStatus?.connected ? "default" : "secondary"}>
                        {woocommerceStatus?.connected ? "Connected" : "Not Connected"}
                      </Badge>
                    </div>

                    {woocommerceStatus?.connected && (
                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <p>Connected: {woocommerceStatus.connected_at ? new Date(woocommerceStatus.connected_at).toLocaleDateString() : "Unknown"}</p>
                        <p>Last Orders Sync: {woocommerceStatus.last_orders_sync_at ? new Date(woocommerceStatus.last_orders_sync_at).toLocaleString() : "Never"}</p>
                        <p>Last Products Sync: {woocommerceStatus.last_products_sync_at ? new Date(woocommerceStatus.last_products_sync_at).toLocaleString() : "Never"}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {woocommerceStatus?.connected ? (
                        <>
                          <Button onClick={() => handleSync("woocommerce")} size="sm">
                            Sync Now
                          </Button>
                          <Button onClick={() => handleDisconnect("woocommerce")} variant="outline" size="sm">
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button asChild size="sm">
                          <a href="/integrations">Connect WooCommerce</a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-black">Billing & Subscription</CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage your subscription and billing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-black">Current Plan</p>
                      <p className="text-sm text-gray-600">Free Plan</p>
                    </div>
                    <Button variant="outline">Upgrade Plan</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-black">Next Billing Date</p>
                      <p className="text-sm text-gray-600">No active subscription</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
