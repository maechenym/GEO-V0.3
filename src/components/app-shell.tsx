"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // 所有页面都不使用顶部 padding，因为都有 header
  const mainPadding = "px-6 pb-6 pt-0"

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex w-48 flex-col border-r border-border bg-card">
          <AppSidebar />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Menu Button */}
        <div className="lg:hidden border-b border-border bg-background px-4 py-2">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation menu"
                aria-expanded={sidebarOpen}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-48 p-0">
              <div className="flex h-full flex-col">
                <AppSidebar onNavigate={() => setSidebarOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <main className={`flex-1 overflow-y-auto bg-background ${mainPadding}`}>{children}</main>
      </div>
    </div>
  )
}

