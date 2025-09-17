"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { useEffect, useState } from "react";
import { AuthModal } from "@/components/auth/auth-modal";

const Page = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // Only redirect after auth state is loaded
    if (loading) return;

    // Add a small delay to ensure smooth transition
    const timer = setTimeout(() => {
      if (user) {
        router.push('/dashboard');
      } else {
        // Don't redirect if not signed in - let AuthGuard handle it
        setIsRedirecting(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [loading, user, router]);

  // Show loading while auth state is being determined
  if (loading) {
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
  if (user) {
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

  // For non-signed-in users, show the auth form directly
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <AuthModal isOpen={true} onClose={() => {}} />
    </div>
  );
}

export default Page