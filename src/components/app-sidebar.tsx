"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Users,
  TrendingUp,
  Heart,
  FileText,
  Lightbulb,
  User,
  Eye,
  Target,
} from "lucide-react"
import { Logo } from "@/components/logo"

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
  { title: "Team", href: "/settings/team", icon: Users, group: "Settings" },
  { title: "Plan", href: "/settings/plan", icon: TrendingUp, group: "Settings" },
  { title: "Products", href: "/settings/products", icon: Lightbulb, group: "Settings" },
  // Group D: Profile
  { title: "Profile", href: "/profile", icon: User, group: "Profile" },
]

const groupTitles: Record<string, string> = {
  Tracking: "Tracking",
  Insights: "Insights",
  Settings: "Settings",
  Profile: "Profile",
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  const groupedNav = navigation.reduce((acc, item) => {
    const group = item.group || "Other"
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(item)
    return acc
  }, {} as Record<string, NavItem[]>)

  return (
    <nav className="flex h-full flex-col space-y-1 p-4" aria-label="Main navigation">
      {/* Logo - 点击跳转到 /overview */}
      <Link
        href="/overview"
        className="mb-6 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-lg transition-colors duration-200 -mt-1"
        aria-label="Go to overview page"
      >
        <Logo size={28} showText={true} textSize="3xl" />
      </Link>

      {Object.entries(groupedNav).map(([group, items]) => (
        <div key={group} className="mb-6">
          <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-ink-500">
            {groupTitles[group] || group}
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
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

