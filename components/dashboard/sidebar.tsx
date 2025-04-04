"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Settings,
  Truck,
  Image,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function DashboardSidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Categories",
      href: "/dashboard/categories",
      icon: Layers,
    },
    {
      title: "Products",
      href: "/dashboard/products",
      icon: Package,
    },
    {
      title: "Orders",
      href: "/dashboard/orders",
      icon: ShoppingCart,
    },
    {
      title: "Delivery Methods",
      href: "/dashboard/delivery",
      icon: Truck,
    },
    {
      title: "Banners",
      href: "/dashboard/banners",
      icon: Image,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-[70px]",
          isMobile && !isOpen && "hidden"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2 font-semibold",
              !isOpen && "justify-center"
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            {isOpen && <span>Smart Shop</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(!isOpen && "rotate-180")}
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href && "bg-accent text-accent-foreground",
                  !isOpen && "justify-center px-0"
                )}
              >
                <item.icon className="h-5 w-5" />
                {isOpen && <span>{item.title}</span>}
              </Link>
            ))}
          </nav>
        </ScrollArea>
        <div className="border-t p-4">
          <Link
            href="/dashboard/profile"
            className={cn(
              "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              !isOpen && "justify-center px-0"
            )}
          >
            <Avatar className="h-9 w-9">
              <AvatarImage
                src="/placeholder.svg?height=36&width=36"
                alt="Admin User"
              />
              <AvatarFallback>AU</AvatarFallback>
            </Avatar>
            {isOpen && (
              <div className="grid gap-0.5 text-sm">
                <div className="font-medium">Admin User</div>
                <div className="text-xs text-muted-foreground">
                  admin@smartshop.com
                </div>
              </div>
            )}
          </Link>
        </div>
      </div>
    </>
  );
}
