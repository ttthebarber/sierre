"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock } from 'lucide-react'
import { FadeIn } from '@/components/ui/fade-in'

export default function IntegrationsPage() {

  return (
    <AppLayout title="Integrations">
      <FadeIn>
        <div className="space-y-6">
              {/* Page Header */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Integrations
                </h1>
                <p className="text-gray-600">
              Connect your e-commerce platforms to automatically sync data and track your business metrics.
                </p>
              </div>

          {/* Integrations Grid */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shopify Integration */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                      <img 
                        src="/shopify_glyph.svg" 
                        alt="Shopify" 
                        className="w-auto h-full"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Shopify</CardTitle>
                      <Badge variant="outline" className="text-xs">Available</Badge>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <CardDescription>
                  Connect your Shopify store to track orders, products, revenue, and customer data in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const shop = (e.target as HTMLFormElement).shop.value
                  if (shop) {
                    window.location.href = `/api/integrations/shopify/connect?shop=${encodeURIComponent(shop)}`
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
                    <Button type="submit" className="w-full bg-black hover:bg-gray-900 text-white">
                      Connect Shopify Store
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* WooCommerce Integration */}
            <Card className="border-gray-200 shadow-sm opacity-75">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                      <img 
                        src="/woocommerce-icon-svgrepo-com.svg" 
                        alt="WooCommerce" 
                        className="w-auto h-full"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">WooCommerce</CardTitle>
                      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                    </div>
                  </div>
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <CardDescription>
                  Connect your WooCommerce store to track orders, products, revenue, and customer data. Integration coming soon.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="woo-store" className="text-sm font-medium text-gray-500">Store URL</Label>
                    <Input
                      id="woo-store"
                      name="woo-store"
                      placeholder="your-store.com"
                      className="mt-1 bg-gray-50"
                      disabled
                    />
                  </div>
                  <Button 
                    type="button" 
                    className="w-full bg-gray-300 text-gray-500 cursor-not-allowed" 
                    disabled
                  >
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </FadeIn>
    </AppLayout>
  )

}
