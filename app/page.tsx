"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure the page is fully loaded before redirecting
    const timer = setTimeout(() => {
      router.push('/dashboard');
      setIsRedirecting(false);
    }, 100);

    // Fallback redirect in case the first one doesn't work
    const fallbackTimer = setTimeout(() => {
      window.location.href = '/dashboard';
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

export default Page