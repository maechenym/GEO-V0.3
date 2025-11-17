"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  TrendingUp,
  Heart,
  FileText,
  Lightbulb,
  Eye,
  Target,
  LogOut,
  User,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { useLanguageStore } from "@/store/language.store"
import { translate } from "@/lib/i18n"
import { useAuthStore } from "@/store/auth.store"
import { mapPlanIdToPlanType } from "@/store/plan.store"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  group?: string
}

const navigation: NavItem[] = [
  // Group A: Tracking
  { title: "Overview", href: "/overview", icon: BarChart3, group: "Tracking" },
  // Group B: Insights
  { title: "Visibility", href: "/insights/visibility", icon: Eye, group: "Insights" },
  { title: "Sentiment", href: "/insights/sentiment", icon: Heart, group: "Insights" },
  { title: "Sources", href: "/insights/sources", icon: FileText, group: "Insights" },
  { title: "Queries", href: "/insights/intent", icon: Target, group: "Insights" },
  // Group C: Settings
  // { title: "Team", href: "/settings/team", icon: Users, group: "Settings" }, // Hidden for now - complex account storage logic
  { title: "Plan", href: "/settings/plan", icon: TrendingUp, group: "Settings" },
  { title: "Products", href: "/settings/products", icon: Lightbulb, group: "Settings" },
  // Profile moved to bottom user info button
]

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { language } = useLanguageStore()
  const { profile, logout } = useAuthStore()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const groupedNav = navigation.reduce((acc, item) => {
    const group = item.group || "Other"
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(item)
    return acc
  }, {} as Record<string, NavItem[]>)

  // Get plan display name
  const getPlanDisplayName = () => {
    if (!profile?.subscription?.planId) {
      return "Trial"
    }
    const planType = mapPlanIdToPlanType(profile.subscription.planId)
    switch (planType) {
      case "basic":
        return "Basic"
      case "pro":
        return "Pro"
      case "enterprise":
        return "Enterprise"
      case "trial":
        return "Trial"
      default:
        return "Trial"
    }
  }

  const planDisplayName = getPlanDisplayName()
  const userEmail = profile?.email || ""

  const handleLogout = async () => {
    setLogoutDialogOpen(false)
    setPopoverOpen(false)
    await logout()
    router.push("/login")
  }

  const handleProfileClick = () => {
    setPopoverOpen(false)
    router.push("/profile")
    onNavigate?.()
  }

  return (
    <nav className="flex h-full flex-col space-y-1 p-4" aria-label="Main navigation">
      {/* Logo - 点击跳转到 /overview */}
      <Link
        href="/overview"
        className="mb-6 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-lg transition-colors duration-200 -mt-1"
        aria-label="Go to overview page"
      >
        <Logo size={36} showText={true} textSize="3xl" />
      </Link>

      {/* Navigation items - flex-1 to push user info to bottom */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedNav).map(([group, items]) => (
          <div key={group} className="mb-6">
            <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-ink-500">
              {translate(group, language)}
            </h2>
            <div className="space-y-1">
              {items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href as any}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      "focus:outline-none",
                      isActive ? "bg-brand-50 hover:bg-brand-50" : "hover:bg-brand-50",
                      "text-ink-700"
                    )}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`Navigate to ${item.title}`}
                  >
                    <Icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors text-ink-700"
                      )}
                      aria-hidden="true"
                    />
                    <span>{translate(item.title, language)}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Info Button - Fixed at bottom */}
      <div className="shrink-0 pt-4 border-t border-ink-100">
        <div className="relative">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full rounded-lg px-3 py-3 text-left transition-all duration-200",
                  "hover:bg-ink-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
                  pathname === "/profile" ? "bg-brand-50" : "bg-transparent"
                )}
                aria-label="Open user menu"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-ink-900 truncate">
                    {userEmail || translate("Not available", language)}
                  </p>
                  <p className="text-xs text-ink-500">
                    {translate("Current Plan", language)}: {planDisplayName}
                  </p>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-56 p-0" 
              align="end" 
              side="top" 
              sideOffset={8}
            >
            <div className="flex flex-col">
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-ink-700 transition hover:bg-ink-50 rounded-t-lg"
              >
                <User className="h-4 w-4" />
                {translate("Profile", language)}
              </button>
              <button
                onClick={() => {
                  setPopoverOpen(false)
                  setLogoutDialogOpen(true)
                }}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-destructive transition hover:bg-destructive/10 rounded-b-lg"
              >
                <LogOut className="h-4 w-4" />
                {translate("Logout", language)}
              </button>
            </div>
          </PopoverContent>
          </Popover>
        </div>

        {/* Logout Confirmation Dialog */}
        <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {translate("Are you sure you want to log out?", language)}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {translate("You will need to sign in again to continue.", language)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {translate("Cancel", language)}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {translate("Logout", language)}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </nav>
  )
}

