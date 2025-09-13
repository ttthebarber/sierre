"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard,
  Settings, 
  Menu,
  X,
  MoreHorizontal,
  Share2,
  User,
  CloudLightning,
  Brain,
  SidebarCloseIcon,
  SidebarOpenIcon,
} from "lucide-react";
import { UserButton, SignedIn, SignedOut, useUser, SignInButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const { user } = useUser();
  
  if (!user) return null;
  
  const displayName = user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || "User";
  
  return (
    <span className="text-sm text-gray-900 truncate">
      {displayName}
    </span>
  );
}

export function AppLayout({ children, title, actions }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

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
        "fixed inset-y-0 left-0 z-50 bg-gray-100 border-r border-gray-200 transform transition-all duration-300 ease-in-out md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        sidebarCollapsed ? "w-16" : "w-56"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between p-3">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900 text-md">Sierre</span>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="flex items-center justify-center w-full">
                <span className="font-semibold text-gray-900 text-lg">S</span>
              </div>
            )}
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
          <nav className={cn(
            "flex-1 py-4 space-y-1",
            sidebarCollapsed ? "px-2" : "px-3"
          )}>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg text-sm font-medium transition-colors",
                    sidebarCollapsed ? "justify-center px-2 py-3" : "space-x-2 px-2 py-1.5",
                    isActive
                      ? "bg-gray-300 text-gray-900"
                      : "text-gray-600 hover:bg-gray-300 hover:text-gray-900"
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-4 w-4" />
                  {!sidebarCollapsed && <span className="text-sm">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className={cn(
            "py-3",
            sidebarCollapsed ? "px-2" : "px-3"
          )}>
            <SignedIn>
              <div className={cn(
                "flex items-center",
                sidebarCollapsed ? "justify-center" : "space-x-2"
              )}>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-6 h-6",
                    },
                  }}
                />
                {!sidebarCollapsed && <UserProfileName />}
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className={cn(
                  "flex items-center w-full p-1 rounded-lg hover:bg-gray-300 transition-colors",
                  sidebarCollapsed ? "justify-center" : "space-x-2"
                )}>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-800" />
                  </div>
                  {!sidebarCollapsed && <span className="text-sm text-gray-800">Sign in</span>}
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "md:pl-16" : "md:pl-56"
      )}>
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
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex h-6 w-6 p-0"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  {sidebarCollapsed ? <SidebarOpenIcon className="h-6 w-6" /> : <SidebarCloseIcon className="h-6 w-6" />}
                </Button>                
                <h1 className="text-xl font-semibold text-gray-900">
                  {title || "Dashboard"}
                </h1>

              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {actions || (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Export data</DropdownMenuItem>
                      <DropdownMenuItem>Print</DropdownMenuItem>
                      <DropdownMenuItem>
                        <a href="settings">Settings</a>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <div className={cn(
            "mx-auto",
            sidebarCollapsed ? "max-w-7xl" : "max-w-7xl"
          )}>
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
