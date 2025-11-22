"use client"

import { useMemo } from "react"
import { PlanCard } from "@/components/billing/PlanCard"
import { UpgradeCard } from "@/components/billing/UpgradeCard"
import type { CheckoutPlan } from "@/store/checkout.store"
import { useLanguageStore } from "@/store/language.store"
import { translate } from "@/lib/i18n"
import { useAuthStore } from "@/store/auth.store"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/services/api"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Calendar, Settings, Loader2, Receipt, Check } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { InvoiceListDialog } from "@/components/billing/InvoiceListDialog"

const allPlans: CheckoutPlan[] = [
  {
    planId: "basic",
    priceId: "price_basic_monthly",
    name: "Basic",
    priceText: "$299 USD/month",
    perks: [
      "3 products monitoring",
      "50 core queries per product",
      "Unlimited total queries",
      "Unlimited countries/regions",
      "Queries run daily on multiple models",
      "Email support",
    ],
  },
  {
    planId: "advanced",
    priceId: "price_advanced_monthly",
    name: "Pro",
    priceText: "$399 USD/month",
    badge: "Most Popular",
    perks: [
      "9 products monitoring",
      "80 core queries per product",
      "Unlimited total queries",
      "Unlimited countries/regions",
      "Queries run daily on multiple models",
      "Email support",
    ],
  },
  {
    planId: "enterprise",
    priceId: null,
    name: "Enterprise",
    priceText: "$599 USD/month",
    perks: [
      "Multiple companies monitoring",
      "Multiple products monitoring",
      "Custom queries",
      "Dedicated business support",
    ],
  },
]

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

export default function PlanSettingsPage() {
  const { language } = useLanguageStore()
  const { profile } = useAuthStore()
  const { toast } = useToast()
  const [isManaging, setIsManaging] = useState(false)
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)

  // 获取当前订阅信息
  const { data: planData, isLoading: planLoading, refetch: refetchPlan } = useQuery<PlanResponse>({
    queryKey: ["currentPlan"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/api/plan/current")
        return response.data
      } catch (error) {
        // 如果 API 失败，返回 null（表示没有订阅）
        return { plan: null }
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  // 处理管理订阅
  const handleManageSubscription = async () => {
    setIsManaging(true)
    try {
      const response = await apiClient.post("/api/stripe/create-portal-session")
      const { portalUrl } = response.data

      if (portalUrl) {
        // Redirect to Stripe Customer Portal (real mode)
        window.location.href = portalUrl
      } else {
        // Mock mode: simulate opening portal
        setIsManaging(false)
        toast({
          title: language === "zh-TW" ? "管理訂閱" : "Manage Subscription",
          description: language === "zh-TW"
            ? "在 Stripe 客戶門戶中，您可以查看訂閱詳情、更新支付方式或取消訂閱"
            : "In Stripe Customer Portal, you can view subscription details, update payment methods, or cancel subscription",
        })
        // 模拟取消订阅后的状态更新
        // 在实际场景中，这应该通过 Stripe webhook 处理
      }
    } catch (error) {
      console.error("Failed to create portal session:", error)
      setIsManaging(false)
      toast({
        title: language === "zh-TW" ? "錯誤" : "Error",
        description: language === "zh-TW"
          ? "無法打開訂閱管理頁面，請稍後再試"
          : "Failed to open subscription management page. Please try again later",
        variant: "destructive",
      })
    }
  }

  // 获取当前计划 ID（从 profile.subscription 或 planData）
  const currentPlanId = useMemo(() => {
    if (profile?.subscription?.planId) {
      // 映射 planId: basic -> basic, advanced -> advanced, enterprise -> enterprise
      return profile.subscription.planId
    }
    if (planData?.plan?.id) {
      // 映射 API 返回的 plan id
      if (planData.plan.id === "trial") return null
      if (planData.plan.id === "basic") return "basic"
      if (planData.plan.id === "advanced" || planData.plan.id === "pro") return "advanced"
      if (planData.plan.id === "enterprise") return "enterprise"
    }
    return null
  }, [profile?.subscription?.planId, planData?.plan?.id])

  // 获取当前计划详情
  const currentPlan = useMemo(() => {
    if (!currentPlanId) return null
    return allPlans.find((p) => p.planId === currentPlanId) || null
  }, [currentPlanId])

  // 获取可升级的计划（比当前计划更高级的）
  const upgradePlans = useMemo(() => {
    if (!currentPlanId) {
      // 如果没有订阅，显示所有计划
      return allPlans
    }

    const planOrder = ["basic", "advanced", "enterprise"]
    const currentIndex = planOrder.indexOf(currentPlanId)
    
    if (currentIndex === -1) return []

    // 返回比当前计划更高级的计划
    return allPlans.filter((plan) => {
      const planIndex = planOrder.indexOf(plan.planId)
      return planIndex > currentIndex
    })
  }, [currentPlanId])

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === "zh-TW" ? "zh-TW" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="bg-background -mx-6">
      {/* Top Filter Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-border px-6 py-2">
        <div className="container mx-auto max-w-[1600px]">
          <div className="flex items-center justify-between">
            {/* Left: Title */}
            <div className="-ml-6">
              <h1 className="text-xl font-semibold text-foreground">
                {language === "zh-TW" ? "訂閱管理" : "Subscription Management"}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {language === "zh-TW"
                  ? "管理您的訂閱計劃和升級選項"
                  : "Manage your subscription plan and upgrade options"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-pageX py-2 sm:py-4 max-w-[1600px]">
        <div className="space-y-6">
          {/* Loading State */}
          {planLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-muted-foreground">
                {language === "zh-TW" ? "載入中..." : "Loading..."}
              </div>
            </div>
          )}

          {/* Current Plan and Upgrade Options - Side by Side */}
          {/* 统一设计：所有用户都看到相同的布局结构 */}
          {!planLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Plan Section */}
              {currentPlan && planData?.plan ? (
                <div className="lg:col-span-1 space-y-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    {language === "zh-TW" ? "當前訂閱" : "Current Subscription"}
                  </h2>
                  <Card className="p-6 border-2 border-brand-600 bg-brand-50/50 h-full">
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <CheckCircle2 className="h-5 w-5 text-brand-600" />
                          <h3 className="text-xl font-semibold text-foreground">
                            {translate(currentPlan.name, language)}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className={
                              planData.plan.status === "canceled" || planData.plan.status === "expired"
                                ? "bg-ink-500 text-white"
                                : "bg-brand-600 text-white"
                            }
                          >
                            {planData.plan.status === "canceled" || planData.plan.status === "expired"
                              ? language === "zh-TW" ? "已取消" : "Canceled"
                              : language === "zh-TW" ? "當前計劃" : "Current Plan"}
                          </Badge>
                        </div>

                        {/* Plan Features/Perks */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-foreground mb-3">
                            {language === "zh-TW" ? "套餐功能" : "Plan Features"}
                          </h4>
                          <ul className="space-y-2">
                            {currentPlan.perks.map((perk, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-brand-600 mt-0.5 flex-shrink-0" />
                                <span>{translate(perk, language)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Subscription Dates */}
                        <div className="space-y-2 text-sm text-muted-foreground border-t border-border pt-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {language === "zh-TW" ? "訂閱開始" : "Started"}: {formatDate(planData.plan.startDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {language === "zh-TW" ? "到期時間" : "Expires"}: {formatDate(planData.plan.endDate)}
                            </span>
                          </div>
                          {planData.plan.remainingDays > 0 && (
                            <div className="text-brand-600 font-medium">
                              {language === "zh-TW"
                                ? `剩餘 ${planData.plan.remainingDays} 天`
                                : `${planData.plan.remainingDays} days remaining`}
                            </div>
                          )}
                          {(planData.plan.status === "canceled" || planData.plan.status === "expired") && (
                            <div className="text-ink-600 font-medium mt-2">
                              {language === "zh-TW"
                                ? "訂閱已取消，將在到期後停止服務"
                                : "Subscription canceled, service will stop after expiration"}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4">
                        {/* View Invoices Button */}
                        <Button
                          onClick={() => setInvoiceDialogOpen(true)}
                          variant="outline"
                          className="border-brand-600 text-brand-600 hover:bg-brand-50 w-full"
                        >
                          <Receipt className="mr-2 h-4 w-4" />
                          {language === "zh-TW" ? "查看账单" : "View Invoices"}
                        </Button>
                        
                        {/* Manage Subscription Button */}
                        {planData.plan.status !== "canceled" && planData.plan.status !== "expired" && (
                          <Button
                            onClick={handleManageSubscription}
                            disabled={isManaging}
                            variant="outline"
                            className="border-brand-600 text-brand-600 hover:bg-brand-50 w-full"
                          >
                            {isManaging ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {language === "zh-TW" ? "載入中..." : "Loading..."}
                              </>
                            ) : (
                              <>
                                <Settings className="mr-2 h-4 w-4" />
                                {language === "zh-TW" ? "管理訂閱" : "Manage Subscription"}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              ) : (
                // 如果没有当前订阅，显示空状态占位符（保持布局一致）
                <div className="lg:col-span-1 space-y-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    {language === "zh-TW" ? "當前訂閱" : "Current Subscription"}
                  </h2>
                  <Card className="p-6 border border-border h-full flex items-center justify-center min-h-[400px]">
                    <div className="text-center text-muted-foreground">
                      <p className="text-sm">
                        {language === "zh-TW" ? "暫無訂閱計劃" : "No active subscription"}
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              {/* Upgrade Plans Section / All Plans Section */}
              <div className={`${currentPlan && planData?.plan ? "lg:col-span-2" : "lg:col-span-3"} space-y-3`}>
                <h2 className="text-lg font-semibold text-foreground">
                  {currentPlan && planData?.plan
                    ? (language === "zh-TW" ? "升級選項" : "Upgrade Options")
                    : (language === "zh-TW" ? "選擇訂閱計劃" : "Choose Your Plan")}
                </h2>
                {upgradePlans.length > 0 ? (
                  // 有订阅时显示升级选项
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
                    {upgradePlans.map((plan) => (
                      <UpgradeCard key={plan.planId} plan={plan} currentPlanId={currentPlanId} />
                    ))}
                  </div>
                ) : (
                  // 没有订阅时显示所有计划
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {allPlans.map((plan) => (
                      <PlanCard key={plan.planId} plan={plan} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice List Dialog */}
      <InvoiceListDialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen} />
    </div>
  )
}
