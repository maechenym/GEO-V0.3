"use client"

import { useAuthStore } from "@/store/auth.store"
import { useLanguageStore } from "@/store/language.store"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LogOut, Mail, Globe, Calendar, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { translate } from "@/lib/i18n"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/services/api"

interface CurrentPlan {
  id: string
  name: string
  status: string
  startDate: string
  endDate: string
  remainingDays: number
  isTrial: boolean
}

interface PlanResponse {
  plan: CurrentPlan | null
}

export default function ProfilePage() {
  const { profile, logout } = useAuthStore()
  const { language, setLanguage } = useLanguageStore()
  const router = useRouter()

  // 获取当前订阅信息
  const { data: planData, isLoading: planLoading } = useQuery<PlanResponse>({
    queryKey: ["currentPlan"],
    queryFn: async () => {
      const response = await apiClient.get("/api/plan/current")
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5分钟
    retry: 1,
  })

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const handleLanguageChange = (value: string) => {
    setLanguage(value as "en" | "zh-TW")
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === "zh-TW" ? "zh-TW" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // 格式化剩余天数
  const formatRemainingDays = (days: number) => {
    if (days <= 0) {
      return language === "zh-TW" ? "已过期" : "Expired"
    }
    if (days === 1) {
      return language === "zh-TW" ? "1 天" : "1 day"
    }
    return language === "zh-TW" ? `${days} 天` : `${days} days`
  }

  return (
    <div className="bg-background -mx-6">
      {/* Top Filter Bar */}
      <div className="sticky top-0 z-50 bg-white dark:bg-background border-b border-border px-6 py-2">
        <div className="container mx-auto max-w-[1600px]">
          <div className="flex items-center justify-between">
            {/* Left: Title */}
            <div className="-ml-6">
              <h1 className="text-xl font-semibold text-foreground">Profile</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {translate("Manage your account settings", language)}
              </p>
            </div>
            
            {/* Right: Language Selector */}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh-TW">中文繁體</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-pageX py-4 sm:py-pageY max-w-[1600px]">
        <div className="space-y-6">
          {/* Account Information Card */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">
                {translate("Account Information", language)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {translate("Your account details", language)}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {translate("Email", language)}
                  </label>
                  <p className="text-sm">{profile?.email || translate("Not available", language)}</p>
                </div>

                <div className="h-px bg-border" />

                {/* Brand Status */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    {translate("Brand Status", language)}
                  </label>
                  <p className="text-sm">
                    {profile?.hasBrand ? (
                      <span className="text-green-600">{translate("Brand configured", language)}</span>
                    ) : (
                      <span className="text-muted-foreground">{translate("No brand configured", language)}</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Plan Card */}
          {planData?.plan && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">
                  {translate("Subscription Plan", language)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {translate("Your current subscription details", language)}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Plan Name */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      {translate("Plan", language)}
                    </label>
                    <p className="text-sm font-semibold">{planData.plan.name}</p>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Subscription Start Date */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {translate("Subscription Start Date", language)}
                    </label>
                    <p className="text-sm">{formatDate(planData.plan.startDate)}</p>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Subscription End Date */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {translate("Subscription End Date", language)}
                    </label>
                    <p className="text-sm">{formatDate(planData.plan.endDate)}</p>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Remaining Days */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {translate("Remaining Days", language)}
                    </label>
                    <p className={`text-sm font-semibold ${
                      planData.plan.remainingDays <= 3 
                        ? "text-red-600" 
                        : planData.plan.remainingDays <= 7 
                        ? "text-orange-600" 
                        : "text-green-600"
                    }`}>
                      {formatRemainingDays(planData.plan.remainingDays)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions Card */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">{translate("Actions", language)}</CardTitle>
              <p className="text-sm text-muted-foreground">{translate("Account actions", language)}</p>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {translate("Logout", language)}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
