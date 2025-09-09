"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { User } from "lucide-react";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

interface HeaderProps {
  title?: string;
  className?: string;
}

export function Header({ title = "Dashboard", className }: HeaderProps) {
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
        <SignedOut>
    {/* Default look (lucide person icon) when logged out */}
    <User className="w-5 h-5 text-gray-700" />
  </SignedOut>
  <SignedIn>
    {/* Clerk will show profile image if Google account is linked */}
    <UserButton
      appearance={{
        elements: {
          avatarBox: "w-5 h-5", // size of the profile image
        },
      }}
    />
  </SignedIn>

      </div>
    </header>
  );
}
