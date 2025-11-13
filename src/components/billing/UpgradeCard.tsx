"use client"

import { useState, KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CheckoutPlan } from "@/store/checkout.store"
import { useLanguageStore } from "@/store/language.store"
import { translate } from "@/lib/i18n"
import apiClient from "@/services/api"
import { usePlanStore } from "@/store/plan.store"

interface UpgradeCardProps {
  plan: CheckoutPlan
  currentPlanId: string | null
}

/**
 * 升级卡片组件
 * 显示可升级的套餐选项
 */
export function UpgradeCard({ plan, currentPlanId }: UpgradeCardProps) {
  const router = useRouter()
  const { language } = useLanguageStore()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleUpgrade = async () => {
    // Enterprise plan uses contact sales
    if (plan.planId === "enterprise") {
      window.location.href = "mailto:sales@example.com?subject=Enterprise Plan Inquiry"
      return
    }

    setIsRedirecting(true)

    try {
      // Create Stripe Checkout Session for upgrade
      const response = await apiClient.post("/api/stripe/create-checkout-session", {
        priceId: plan.priceId,
        planId: plan.planId,
        trialPeriodDays: 0, // No trial for upgrades
        isUpgrade: true,
        currentPlanId: currentPlanId,
      })

      const { checkoutUrl } = response.data

      if (checkoutUrl) {
        // Redirect to Stripe Checkout (real mode)
        window.location.href = checkoutUrl
      } else {
        // Mock mode: simulate successful upgrade
        setIsRedirecting(false)
        // Update plan store
        const { setPlan } = usePlanStore.getState()
        const trialEndsAt = new Date()
        trialEndsAt.setDate(trialEndsAt.getDate() + 30) // 30天周期
        
        setPlan({
          planType: plan.planId === "basic" ? "pro" : plan.planId === "advanced" ? "pro" : "enterprise",
          trialEndsAt: trialEndsAt.toISOString(),
        })
        
        // Reload page to show updated subscription
        router.push("/settings/plan?upgraded=true&plan=" + plan.planId)
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to create upgrade checkout session:", error)
      setIsRedirecting(false)
      // TODO: Show error toast
    }
  }

  // Parse price text
  const parsePrice = (priceText: string) => {
    const match = priceText.match(/^(\$)([\d,]+)(\+?)\s*(USD\/month)$/)
    if (match) {
      return {
        currencySymbol: match[1],
        amount: match[2],
        plus: match[3] || "",
        unit: match[4],
      }
    }
    if (priceText.startsWith("$")) {
      return {
        currencySymbol: "$",
        amount: priceText.replace(/[^0-9]/g, "") || "0",
        plus: "",
        unit: "USD/month",
      }
    }
    return { currencySymbol: "", amount: priceText, plus: "", unit: "" }
  }

  const priceParts = parsePrice(plan.priceText)
  const isEnterprise = plan.planId === "enterprise"

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md",
        plan.planId === "advanced" && "border-2 border-brand-600 shadow-lg"
      )}
      style={
        plan.planId === "advanced"
          ? {
              boxShadow:
                "0 0 0 2px rgba(19, 69, 140, 0.2), 0 20px 40px rgba(19, 69, 140, 0.15), 0 4px 6px -1px rgb(0 0 0 / 0.04), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
            }
          : undefined
      }
    >
      {/* Upgrade Badge */}
      <div className="absolute top-3 right-3 z-10">
        <Badge
          variant="default"
          className="text-[10px] px-2 py-0.5 rounded-md bg-brand-600 text-white border-0 font-normal uppercase tracking-wide flex items-center gap-1"
        >
          <ArrowUp className="h-3 w-3" />
          {language === "zh-TW" ? "升級" : "Upgrade"}
        </Badge>
      </div>

      {/* Title */}
      <div className="pr-20">
        <h3 className="text-xl font-semibold text-foreground">{translate(plan.name, language)}</h3>
      </div>

      {/* Price */}
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-4xl font-extrabold text-foreground flex items-baseline">
          <span className="text-lg font-bold mr-0.5">{priceParts.currencySymbol}</span>
          <span>{priceParts.amount}</span>
          {priceParts.plus && <span className="text-4xl font-extrabold">{priceParts.plus}</span>}
        </span>
        <span className="text-xs text-muted-foreground font-normal">{priceParts.unit}</span>
      </div>

      {/* Perks List */}
      <ul className="mt-6 flex-1 space-y-3">
        {plan.perks.map((perk, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm leading-6">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
            <span className="text-foreground">{translate(perk, language)}</span>
          </li>
        ))}
      </ul>

      {/* Upgrade Button */}
      <div className="mt-auto pt-6">
        <Button
          type="button"
          variant="default"
          className="w-full h-12"
          disabled={isRedirecting}
          onClick={handleUpgrade}
        >
          {isRedirecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {translate("Redirecting...", language)}
            </>
          ) : isEnterprise ? (
            translate("Contact Sales", language)
          ) : (
            <>
              {language === "zh-TW" ? "升級到" : "Upgrade to"} {translate(plan.name, language)}
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}

