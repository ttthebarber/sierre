"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard,
  Settings, 
  Menu,
  X,
  User,
  CloudLightning,
  Brain,
} from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ErrorProvider } from "@/lib/contexts/error-context";
import { ErrorDisplay } from "@/components/ui/error-display";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Insights",
    href: "/insights",
    icon: Brain,
  },
  {
    name: "Integrations",
    href: "/integrations",
    icon: CloudLightning,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  }
];

// Component to display user name
function UserProfileName() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const displayName = user.user_metadata?.full_name || user.email || "User";
  
  return (
    <span className="text-sm text-gray-900 truncate">
      {displayName}
    </span>
  );
}

export function AppLayout({ children, title, actions }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <ErrorProvider>
      <div className="min-h-screen bg-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 bg-gray-100 border-r border-gray-200 transform transition-all duration-300 ease-in-out md:translate-x-0 w-56",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900 text-md">Sierre</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-6 w-6 p-0"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 rounded-lg text-sm font-medium transition-colors px-2 py-1.5",
                    isActive
                      ? "bg-gray-300 text-gray-900"
                      : "text-gray-600 hover:bg-gray-300 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="py-3 px-3">
            {user ? (
              <button 
                onClick={() => signOut()}
                className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-gray-300 transition-colors group"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden">
                  {user.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <UserProfileName />
              </button>
            ) : (
              <button 
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-sm text-gray-600">Sign in</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-56">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                {title || "Dashboard"}
              </h1>
            </div>
            {actions}
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      </div>
      
      {/* Error Display */}
      <ErrorDisplay />
    </ErrorProvider>
  );
}
