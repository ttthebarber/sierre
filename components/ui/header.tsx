"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { User } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";

interface HeaderProps {
  title?: string;
  className?: string;
}

export function Header({ title = "Dashboard", className }: HeaderProps) {
  const { user } = useAuth();
  
  return (
    <header className={cn(
      "flex items-center justify-between px-6 py-2 bg-white border-b border-gray-300",
      className
    )}>
      {/* Left side - Title and Logo */}
      <div className="flex items-center">
        <a href="/dashboard">
          <Image src="/Logo.png" alt="Logo" width={40} height={40} className="mr-2" />
        </a>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>

      {/* Right side - Plan badge, notifications, user */}
      <div className="flex items-center space-x-4">
        {/* User profile */}
        {user ? (
          <div className="w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
        ) : (
          <User className="w-5 h-5 text-gray-700" />
        )}
      </div>
    </header>
  );
}
