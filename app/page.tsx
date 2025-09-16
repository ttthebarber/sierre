"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const Page = () => {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // Only redirect after auth state is loaded
    if (!isLoaded) return;

    // Add a small delay to ensure smooth transition
    const timer = setTimeout(() => {
      if (isSignedIn) {
        router.push('/dashboard');
      } else {
        // Don't redirect if not signed in - let AuthGuard handle it
        setIsRedirecting(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn, router]);

  // Show loading while auth state is being determined
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
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

  // Show redirect message only for signed-in users
  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Redirecting to Dashboard...
          </h1>
          <p className="text-gray-600">
            Please wait while we redirect you to your dashboard.
          </p>
          {!isRedirecting && (
            <p className="text-sm text-gray-500 mt-2">
              If you are not redirected automatically, <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">click here</button>.
            </p>
          )}
        </div>
      </div>
    );
  }

  // For non-signed-in users, show a simple landing page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Welcome to Sierre
        </h1>
        <p className="text-gray-600 mb-6">
          Track your store performance with AI-powered insights
        </p>
        <button 
          onClick={() => router.push('/dashboard')} 
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors border-2 border-black"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default Page