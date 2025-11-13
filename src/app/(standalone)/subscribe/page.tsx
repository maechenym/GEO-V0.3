"use client"

import { PlanCard } from "@/components/billing/PlanCard"
import { Check, Gift } from "lucide-react"
import { useLanguageStore } from "@/store/language.store"
import { translate } from "@/lib/i18n"
import type { CheckoutPlan } from "@/store/checkout.store"

/**
 * 订阅计划选择页面（独立页面）
 * 
 * 路径：/subscribe
 * 目的：用户选择订阅计划并开始7天免费试用
 */
const plans: CheckoutPlan[] = [
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

export default function SubscribePage() {
  const { language } = useLanguageStore()

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-border px-6 py-4">
        <div className="container mx-auto max-w-[1600px]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {language === "zh-TW" ? "選擇訂閱計劃" : "Choose Your Plan"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {language === "zh-TW"
                  ? "開始7天免費試用，試用期結束前可退款"
                  : "Start your 7-day free trial. Cancel anytime before trial ends for a full refund"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-pageX py-8 sm:py-12 max-w-[1600px]">
        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 mb-12">
          {plans.map((plan) => (
            <PlanCard key={plan.planId} plan={plan} />
          ))}
        </div>

        {/* Invitation Bonus */}
        <div className="mt-12 rounded-2xl border border-brand-200 bg-brand-50 p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {language === "zh-TW" ? "邀請獎勵" : "Referral Bonus"}
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                {language === "zh-TW"
                  ? "每邀請一位企業用戶加入waiting list，可以延長7天免費試用時間！"
                  : "Invite one business user to join the waiting list and extend your free trial by 7 days!"}
              </p>
            </div>
          </div>
        </div>

        {/* Plan Comparison Table */}
        <div className="mt-8 rounded-lg border border-border bg-white p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {language === "zh-TW" ? "計劃對比" : "Plan Comparison"}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    {language === "zh-TW" ? "功能" : "Feature"}
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Basic</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Pro</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 text-muted-foreground">
                    {language === "zh-TW" ? "適用對象" : "Target Audience"}
                  </td>
                  <td className="py-3 px-4 text-center text-muted-foreground">
                    {language === "zh-TW" ? "小型企業" : "Small Businesses"}
                  </td>
                  <td className="py-3 px-4 text-center text-muted-foreground">
                    {language === "zh-TW" ? "成長中的公司" : "Growing Companies"}
                  </td>
                  <td className="py-3 px-4 text-center text-muted-foreground">
                    {language === "zh-TW" ? "大型企業" : "Large Enterprises"}
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 text-muted-foreground">
                    {language === "zh-TW" ? "產品監測" : "Product Monitoring"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Check className="h-4 w-4 text-brand-600 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Check className="h-4 w-4 text-brand-600 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Check className="h-4 w-4 text-brand-600 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 text-muted-foreground">
                    {language === "zh-TW" ? "核心提示詞" : "Core Queries"}
                  </td>
                  <td className="py-3 px-4 text-center text-muted-foreground">50/product</td>
                  <td className="py-3 px-4 text-center text-muted-foreground">80/product</td>
                  <td className="py-3 px-4 text-center text-muted-foreground">
                    {language === "zh-TW" ? "定制化" : "Custom"}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-muted-foreground">
                    {language === "zh-TW" ? "支持" : "Support"}
                  </td>
                  <td className="py-3 px-4 text-center text-muted-foreground">
                    {language === "zh-TW" ? "郵件支持" : "Email"}
                  </td>
                  <td className="py-3 px-4 text-center text-muted-foreground">
                    {language === "zh-TW" ? "郵件支持" : "Email"}
                  </td>
                  <td className="py-3 px-4 text-center text-muted-foreground">
                    {language === "zh-TW" ? "專屬業務支持" : "Dedicated"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

