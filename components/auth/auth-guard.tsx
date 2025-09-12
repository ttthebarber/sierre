"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Shield, Zap, Users } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to Sierre
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Track KPIs, sync data, and get AI insights across your e-commerce platforms. 
                Connect your Shopify store and unlock the power of data-driven decisions.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg mb-2">Real-time Sync</CardTitle>
                <CardDescription>
                  Automatically sync orders, products, and customer data from your Shopify store
                </CardDescription>
              </Card>

              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg mb-2">Smart Analytics</CardTitle>
                <CardDescription>
                  Get AI-powered insights and recommendations to grow your business
                </CardDescription>
              </Card>

              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg mb-2">Secure & Private</CardTitle>
                <CardDescription>
                  Your data is encrypted and secure. We never share your business information
                </CardDescription>
              </Card>
            </div>

            {/* Authentication Section */}
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  {showSignUp ? "Create your account" : "Sign in to continue"}
                </CardTitle>
                <CardDescription>
                  {showSignUp 
                    ? "Join thousands of merchants tracking their KPIs with Sierre"
                    : "Access your dashboard and start tracking your business metrics"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showSignUp ? (
                  <SignUp 
                    appearance={{
                      elements: {
                        formButtonPrimary: "bg-black hover:bg-gray-900 text-white",
                        card: "shadow-none border-0",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                      }
                    }}
                    redirectUrl="/dashboard"
                    afterSignUpUrl="/dashboard"
                  />
                ) : (
                  <SignIn 
                    appearance={{
                      elements: {
                        formButtonPrimary: "bg-black hover:bg-gray-900 text-white",
                        card: "shadow-none border-0",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                      }
                    }}
                    redirectUrl="/dashboard"
                    afterSignInUrl="/dashboard"
                  />
                )}
                
                <div className="mt-4 text-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowSignUp(!showSignUp)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {showSignUp 
                      ? "Already have an account? Sign in" 
                      : "Don't have an account? Sign up"
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center mt-12">
              <p className="text-sm text-gray-500">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
