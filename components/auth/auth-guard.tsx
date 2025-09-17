"use client";

import { useAuth } from "@/lib/supabase/auth-context";
import { AuthModal } from "./auth-modal";
import { useState, useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Only show modal if auth state is loaded and user is signed out
    if (!loading && !user) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, user]);

  // Don't render anything until auth state is loaded
  if (loading) {
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

  // If user is authenticated, show the protected content
  if (user) {
    return <>{children}</>;
  }

  // If user is not authenticated, show auth modal
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
