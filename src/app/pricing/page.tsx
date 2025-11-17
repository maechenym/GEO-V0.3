"use client"

import { LandingHeader } from "@/components/landing-header"
import { PlanCard } from "@/components/billing/PlanCard"
import { Check, Gift } from "lucide-react"
import { useLanguageStore } from "@/store/language.store"
import { translate } from "@/lib/i18n"
import type { CheckoutPlan } from "@/store/checkout.store"

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

export default function PricingPage() {
  const { language } = useLanguageStore()

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LandingHeader />
      
      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4">
              {translate("Pricing", language)}
            </h1>
            <p className="text-lg text-ink-600 max-w-2xl mx-auto">
              {language === "zh-TW"
                ? "選擇適合您需求的方案"
                : "Choose the plan that fits your needs"}
            </p>
          </div>
          
          {/* Plan Cards Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 mb-12 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <PlanCard key={plan.planId} plan={plan} />
            ))}
          </div>

          {/* Invitation Bonus */}
          <div className="mt-12 rounded-2xl border border-brand-200 bg-brand-50 p-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-ink-900 mb-2">
                  {language === "zh-TW" ? "邀請獎勵" : "Referral Bonus"}
                </h3>
                <p className="text-base text-ink-600 leading-relaxed">
                  {language === "zh-TW"
                    ? "每邀請一位企業用戶加入waiting list，可以延長7天免費試用時間！"
                    : "Invite one business user to join the waiting list and extend your free trial by 7 days!"}
                </p>
              </div>
            </div>
          </div>

          {/* Plan Comparison Table */}
          <div className="mt-8 rounded-lg border border-ink-200 bg-white p-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-ink-900 mb-4">
              {language === "zh-TW" ? "計劃對比" : "Plan Comparison"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-200">
                    <th className="text-left py-3 px-4 font-semibold text-ink-900">
                      {language === "zh-TW" ? "功能" : "Feature"}
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-ink-900">Basic</th>
                    <th className="text-center py-3 px-4 font-semibold text-ink-900">Pro</th>
                    <th className="text-center py-3 px-4 font-semibold text-ink-900">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-ink-200">
                    <td className="py-3 px-4 text-ink-600">
                      {language === "zh-TW" ? "適用對象" : "Target Audience"}
                    </td>
                    <td className="py-3 px-4 text-center text-ink-600">
                      {language === "zh-TW" ? "小型企業" : "Small Businesses"}
                    </td>
                    <td className="py-3 px-4 text-center text-ink-600">
                      {language === "zh-TW" ? "成長中的公司" : "Growing Companies"}
                    </td>
                    <td className="py-3 px-4 text-center text-ink-600">
                      {language === "zh-TW" ? "大型企業" : "Large Enterprises"}
                    </td>
                  </tr>
                  <tr className="border-b border-ink-200">
                    <td className="py-3 px-4 text-ink-600">
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
                  <tr className="border-b border-ink-200">
                    <td className="py-3 px-4 text-ink-600">
                      {language === "zh-TW" ? "核心提示詞" : "Core Queries"}
                    </td>
                    <td className="py-3 px-4 text-center text-ink-600">50/product</td>
                    <td className="py-3 px-4 text-center text-ink-600">80/product</td>
                    <td className="py-3 px-4 text-center text-ink-600">
                      {language === "zh-TW" ? "定制化" : "Custom"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-ink-600">
                      {language === "zh-TW" ? "支持" : "Support"}
                    </td>
                    <td className="py-3 px-4 text-center text-ink-600">
                      {language === "zh-TW" ? "郵件支持" : "Email"}
                    </td>
                    <td className="py-3 px-4 text-center text-ink-600">
                      {language === "zh-TW" ? "郵件支持" : "Email"}
                    </td>
                    <td className="py-3 px-4 text-center text-ink-600">
                      {language === "zh-TW" ? "專屬業務支持" : "Dedicated"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

