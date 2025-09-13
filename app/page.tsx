"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";

const Page = () => {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Redirecting to Dashboard...
          </h1>
          <p className="text-gray-600">
            Please wait while we redirect you to your dashboard.
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}

export default Page