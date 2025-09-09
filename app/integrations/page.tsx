"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'

export default function IntegrationsPage() {

  return (
    <AppLayout title="Integrations">
      <div className="space-y-6">
            {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Connect your Shopify store
              </h1>
              <p className="text-gray-600">
            Connect your Shopify store to automatically sync data and track your business metrics.
              </p>
            </div>

        {/* Shopify Integration */}
        <div className="max-w-md mx-auto">
          <Card className="border-gray-200 shadow-sm">
                <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <img 
                        src="/Shopify_logo_2018.svg" 
                        alt="Shopify" 
                      className="w-6 h-6"
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
                    </div>

                    </div>
    </AppLayout>
  )
}