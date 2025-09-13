"use client";

import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Shield, Zap, BarChart3 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoaded } = useUser();
  const [showSignUp, setShowSignUp] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Only show modal if auth state is loaded and user is signed out
    if (isLoaded) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  // Don't render anything until auth state is loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Loading...
          </h1>
          <p className="text-gray-600">
            Please wait while we check your authentication status.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        {/* Dashboard layout with authentication modal overlay */}
        <div className="min-h-screen bg-gray-50 relative">
          {/* Dashboard content (always visible, blurred when modal is open) */}
          <div className={`transition-all duration-300 ${showModal ? 'blur-md pointer-events-none' : ''}`}>
            {children}
          </div>

          {/* Modal backdrop - positioned absolutely over the dashboard */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30">
              <div className="relative">
                <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                  <CardHeader className="text-center relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-gray-100"
                      onClick={() => setShowModal(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">
                      {showSignUp ? "Create your account" : "Sign in to continue"}
                    </CardTitle>
                    <CardDescription>
                      {showSignUp 
                        ? "Join thousands of merchants tracking their KPIs with Sierre"
                        : "Please sign in to access your dashboard and start tracking your business metrics"
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

                    {/* Quick features */}
                    <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-xs text-gray-600">Real-time Sync</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                          <BarChart3 className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-xs text-gray-600">AI Insights</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                          <Shield className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-xs text-gray-600">Secure</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </SignedOut>
    </>
  );
}
