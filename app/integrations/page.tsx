"use client";

import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { CloudLightning, CloudLightningIcon, Home, LucideCloudLightning, Settings } from "lucide-react";
import { Header } from "@/components/ui/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { woocommerceApi } from '@/lib/api/integrations/woocommerce'

export default function IntegrationsPage() {
  const [woocommerceForm, setWooCommerceForm] = useState({
    site_url: '',
    consumer_key: '',
    consumer_secret: '',
    shop: ''
  })
  const [isConnecting, setIsConnecting] = useState(false)

  const handleWooCommerceConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsConnecting(true)
    
    try {
      await woocommerceApi.connect(woocommerceForm)
      alert('WooCommerce store connected successfully!')
      setWooCommerceForm({ site_url: '', consumer_key: '', consumer_secret: '', shop: '' })
    } catch (error: any) {
      alert(`Failed to connect: ${error.message}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const sidebarLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <Home className="w-5 h-5" />,
    },
    {
      label: "Integrations",
      href: "/integrations",
      icon: <CloudLightning className="w-5 h-5"/>
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Sticky Header */}
      <div className="sticky top-0 z-50">
        <Header title="Integrations" />
      </div>
      
      <div className="flex h-screen bg-white">
        {/* Sticky Sidebar */}
        <div className="sticky top-0 h-screen">
          <Sidebar animate={true}>
            <SidebarBody className="bg-white border-r border-gray-200 w-14">
              <div className="flex flex-col h-full">
                {/* Navigation Links */}
                <nav className="flex-1 p-3 space-y-4">
                  {sidebarLinks.map((link, index) => (
                    <SidebarLink
                      key={index}
                      link={link}
                      className="text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg p-2 transition-colors flex justify-center"
                    />
                  ))}
                </nav>
              </div>
            </SidebarBody>
          </Sidebar>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Connect your KPI tracker seamlessly with the tools you already use.
              </h1>
              <p className="text-gray-600">
                Integrate your e-commerce platforms to automatically sync data and track your business metrics.
              </p>
            </div>

            {/* Integration Cards Grid - 2x2 Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Shopify Integration - Larger Card */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-25 h-10 flex items-center justify-center">
                      <img 
                        src="/Shopify_logo_2018.svg" 
                        alt="Shopify" 
                        className="w-fit h-fit"
                      />
                    </div>
                  </CardTitle>
                  <CardDescription className="text-base">
                    Connect your Shopify store to track orders, products, revenue, and customer data in real-time.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const shop = (e.target as HTMLFormElement).shop.value
                    if (shop) {
                      window.location.href = `/api/integrations/shopify/install?shop=${encodeURIComponent(shop)}`
                    }
                  }}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="shop" className="text-sm font-medium">Shop Domain</Label>
                        <Input
                          id="shop"
                          name="shop"
                          placeholder="your-store.myshopify.com"
                          className="mt-1"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-medium">
                        Connect Shopify Store
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* WooCommerce Integration - Larger Card */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-25 h-10 flex items-center justify-center">
                      <img 
                        src="/WooCommerce_logo.svg" 
                        alt="WooCommerce" 
                        className="w-fit h-fit"
                      />
                    </div>
                  </CardTitle>
                  <CardDescription className="text-base">
                    Connect your WooCommerce store to sync orders, products, and revenue data automatically.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleWooCommerceConnect}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="woo-site-url" className="text-sm font-medium">Site URL</Label>
                        <Input
                          id="woo-site-url"
                          placeholder="https://your-store.com"
                          value={woocommerceForm.site_url}
                          onChange={(e) => setWooCommerceForm(prev => ({ ...prev, site_url: e.target.value }))}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="woo-consumer-key" className="text-sm font-medium">Consumer Key</Label>
                        <Input
                          id="woo-consumer-key"
                          placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          value={woocommerceForm.consumer_key}
                          onChange={(e) => setWooCommerceForm(prev => ({ ...prev, consumer_key: e.target.value }))}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="woo-consumer-secret" className="text-sm font-medium">Consumer Secret</Label>
                        <Input
                          id="woo-consumer-secret"
                          type="password"
                          placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          value={woocommerceForm.consumer_secret}
                          onChange={(e) => setWooCommerceForm(prev => ({ ...prev, consumer_secret: e.target.value }))}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="woo-shop" className="text-sm font-medium">Shop Identifier</Label>
                        <Input
                          id="woo-shop"
                          placeholder="your-store"
                          value={woocommerceForm.shop}
                          onChange={(e) => setWooCommerceForm(prev => ({ ...prev, shop: e.target.value }))}
                          className="mt-1"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-medium" disabled={isConnecting}>
                        {isConnecting ? 'Connecting...' : 'Connect WooCommerce Store'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Squarespace Integration - Smaller Card */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg">□</div>
                    <div>
                      <div className="text-xl font-semibold">Squarespace</div>
                      <div className="text-sm text-gray-500">All-in-One Website Builder</div>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-base">
                    Connect your Squarespace Commerce store to track sales, orders, and customer data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-3">
                        Squarespace integration is coming soon. We're working on connecting to their Commerce API.
                      </p>
                      <div className="text-xs text-gray-500">
                        <p>• Order tracking</p>
                        <p>• Revenue analytics</p>
                        <p>• Customer insights</p>
                      </div>
                    </div>
                    <Button disabled className="w-full bg-gray-400 text-white font-medium">
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Etsy Integration - Smaller Card */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">E</div>
                    <div>
                      <div className="text-xl font-semibold">Etsy</div>
                      <div className="text-sm text-gray-500">Handmade & Vintage Marketplace</div>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-base">
                    Connect your Etsy shop to track sales, listings, and shop performance metrics.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-3">
                        Etsy integration is coming soon. We're working on connecting to their REST API.
                      </p>
                      <div className="text-xs text-gray-500">
                        <p>• Shop analytics</p>
                        <p>• Sales tracking</p>
                        <p>• Listing performance</p>
                      </div>
                    </div>
                    <Button disabled className="w-full bg-gray-400 text-white font-medium">
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* How It Works Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                    1
                  </span>
                  <p className="text-gray-700">
                    Select an integration and authorize access to your store data.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                    2
                  </span>
                  <p className="text-gray-700">
                    Your data syncs securely and automatically in the background.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                    3
                  </span>
                  <p className="text-gray-700">
                    View your KPIs and manage active integrations from your dashboard.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tips Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2"></span>
                  <p className="text-gray-700">
                    Only enable integrations relevant to your workflow to keep your dashboard focused.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2"></span>
                  <p className="text-gray-700">
                    Review permissions carefully during connection to ensure data security.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2"></span>
                  <p className="text-gray-700">
                    You can disconnect integrations anytime from the Settings page.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}