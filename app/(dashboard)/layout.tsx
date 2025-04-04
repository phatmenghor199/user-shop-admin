"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { TopBar } from "@/components/dashboard/top-bar"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isMobile = useIsMobile()
  const pathname = usePathname()

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }, [pathname, isMobile])

  // Set sidebar to open by default on desktop
  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(true)
    }
  }, [isMobile])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden transition-all duration-300",
          isMobile ? "w-full" : isSidebarOpen ? "ml-64" : "ml-[70px]",
        )}
      >
        <TopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

