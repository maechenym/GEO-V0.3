"use client"

import { PlanGrid } from "@/components/billing/PlanGrid"
import type { CheckoutPlan } from "@/store/checkout.store"
import { useLanguageStore } from "@/store/language.store"
import { translate } from "@/lib/i18n"

const plans: CheckoutPlan[] = [
  {
    planId: "free",
    priceId: null,
    name: "Free Trial",
    priceText: "$0 USD/month",
    perks: [
      "1 product monitoring",
      "5 competitor tracking",
      "50 AI queries per month",
      "Get 7 days of full access, and earn an extra 7-day free trial by inviting one business user",
    ],
  },
  {
    planId: "basic",
    priceId: "price_basic",
    name: "Basic",
    priceText: "$199 USD/month",
    perks: [
      "3 products monitoring",
      "15 competitor tracking",
      "150 AI queries per month",
      "Email support",
    ],
  },
  {
    planId: "advanced",
    priceId: "price_advanced",
    name: "Advanced",
    priceText: "$399 USD/month",
    badge: "Most Popular",
    perks: [
      "10 products monitoring",
      "50 competitor tracking",
      "500 AI queries per month",
      "Priority support",
      "Advanced analytics",
    ],
  },
  {
    planId: "enterprise",
    priceId: "price_enterprise",
    name: "Enterprise",
    priceText: "$599+ USD/month",
    perks: [
      "20+ products monitoring",
      "100+ competitor tracking",
      "Unlimited AI queries",
      "Dedicated support",
      "Custom integrations",
      "Security & compliance",
    ],
  },
]

export default function PlanSettingsPage() {
  const { language } = useLanguageStore()
  
  return (
    <div className="bg-background -mx-6">
      {/* Top Filter Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-border px-6 py-2">
        <div className="container mx-auto max-w-[1600px]">
          <div className="flex items-center justify-between">
            {/* Left: Title */}
            <div className="-ml-6">
              <h1 className="text-xl font-semibold text-foreground">{translate("Plan", language)}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {translate("Choose the subscription that fits your team.", language)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-pageX py-4 sm:py-pageY max-w-[1600px]">
        <div className="space-y-6">
          {/* Plan Cards Grid */}
          <PlanGrid plans={plans} />
        </div>
      </div>
    </div>
  )
}
