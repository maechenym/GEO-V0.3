"use client"

import { useState, KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { CheckoutPlan } from "@/store/checkout.store"
import { useCheckoutStore } from "@/store/checkout.store"
import { usePlanStore, mapPlanIdToPlanType } from "@/store/plan.store"
import { useLanguageStore } from "@/store/language.store"
import { useAuthStore } from "@/store/auth.store"
import { translate } from "@/lib/i18n"
import apiClient from "@/services/api"

interface PlanCardProps {
  plan: CheckoutPlan
  isCurrentPlan?: boolean
}

export function PlanCard({ plan, isCurrentPlan = false }: PlanCardProps) {
  const router = useRouter()
  const { setSelectedPlan } = useCheckoutStore()
  const { language } = useLanguageStore()
  const { token, profile } = useAuthStore()
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleCardClick = () => {
    // Check if user is logged in
    if (!token || !profile) {
      // Save plan to store for later use after login
      setSelectedPlan(plan)
      // Redirect to login page
      router.push("/login")
      return
    }

    if (plan.planId === "enterprise") {
      setContactDialogOpen(true)
    } else {
      handleSelectPlan()
    }
  }

  const handleCardKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleCardClick()
    }
  }

  const handleSelectPlan = async () => {
    // Check if user is logged in
    if (!token || !profile) {
      // Save plan to store for later use after login
      setSelectedPlan(plan)
      // Redirect to login page
      router.push("/login")
      return
    }

    // Save plan to store
    setSelectedPlan(plan)

    // Free plan doesn't need payment
    if (plan.planId === "free") {
      // TODO: Handle free plan activation
      router.push("/settings/plan")
      return
    }

    // Enterprise plan uses contact sales dialog
    if (plan.planId === "enterprise") {
      setContactDialogOpen(true)
      return
    }

    setIsRedirecting(true)

    try {
      console.log("[PlanCard] Creating checkout session for plan:", plan.planId)
      
      // Create Stripe Checkout Session with 7-day trial
      const response = await apiClient.post("/api/stripe/create-checkout-session", {
        priceId: plan.priceId,
        planId: plan.planId,
        trialPeriodDays: 7, // 7-day free trial
      })

      console.log("[PlanCard] Checkout session response:", response.data)

      const { checkoutUrl } = response.data

      if (checkoutUrl) {
        // Redirect to Stripe Checkout (real mode)
        console.log("[PlanCard] Redirecting to Stripe Checkout:", checkoutUrl)
        window.location.href = checkoutUrl
        return
      } else {
        // Mock mode: simulate successful subscription with trial
        setIsRedirecting(false)
        // Calculate trial end date (7 days from now)
        const trialEndsAt = new Date()
        trialEndsAt.setDate(trialEndsAt.getDate() + 7)
        
        // Update plan store
        const { setPlan } = usePlanStore.getState()
        setPlan({
          planType: mapPlanIdToPlanType(plan.planId),
          trialEndsAt: trialEndsAt.toISOString(),
        })
        
        // Update user subscription in profile (mock mode)
        const { setProfile, profile } = useAuthStore.getState()
        if (profile) {
          setProfile({
            ...profile,
            subscription: {
              planId: plan.planId,
              planName: plan.name,
              status: "active",
              trialEndsAt: trialEndsAt.toISOString(),
            },
          })
        }
        
        // Redirect to overview page (mock mode: default payment successful)
        console.log("[PlanCard] Mock mode: redirecting to overview")
        router.push("/overview?success=true&trial=true")
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error)
      setIsRedirecting(false)
      
      // 即使 API 失败，也尝试跳转到计划页面（让用户可以看到计划详情）
      router.push("/settings/plan")
      
      // TODO: Show error toast
    }
  }

  const handleContactSales = () => {
    window.location.href = "mailto:sales@example.com?subject=Enterprise Plan Inquiry"
    setContactDialogOpen(false)
  }

  const getButtonLabel = () => {
    if (isCurrentPlan) {
      // 检查订阅状态（从 profile 或 props 传入）
      const { profile } = useAuthStore.getState()
      const subscriptionStatus = profile?.subscription?.status
      
      // 如果订阅已取消或过期，显示 "Get Started"
      if (subscriptionStatus === "canceled" || subscriptionStatus === "expired") {
        return translate("Get Started", language)
      }
      return translate("Current Plan", language)
    }
    if (plan.planId === "free") return translate("Start for $0", language)
    if (plan.planId === "basic") return translate("Start 7-Day Free Trial", language)
    if (plan.planId === "advanced") return translate("Start 7-Day Free Trial", language)
    if (plan.planId === "enterprise") return translate("Contact Sales", language)
    return translate("Select Plan", language)
  }

  // Parse price text to separate currency symbol, amount, and unit
  const parsePrice = (priceText: string) => {
    // Match format: "$199 USD/month" or "$599+ USD/month"
    const match = priceText.match(/^(\$)([\d,]+)(\+?)\s*(USD\/month)$/)
    if (match) {
      return {
        currencySymbol: match[1],
        amount: match[2],
        plus: match[3] || "",
        unit: match[4],
      }
    }
    // Fallback for "$0 USD/month"
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
  const isPro = plan.planId === "advanced" // Pro plan

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        className={cn(
          "relative flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          isCurrentPlan
            ? "border-2 border-primary shadow-md"
            : isPro
            ? "border-2 border-brand-600 shadow-lg hover:shadow-xl"
            : "border-border hover:border-primary/50"
        )}
        style={
          isCurrentPlan
            ? {
                boxShadow:
                  "0 20px 40px rgba(19, 69, 140, 0.12), 0 4px 6px -1px rgb(0 0 0 / 0.04), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
              }
            : isPro
            ? {
                boxShadow:
                  "0 0 0 2px rgba(19, 69, 140, 0.2), 0 20px 40px rgba(19, 69, 140, 0.15), 0 4px 6px -1px rgb(0 0 0 / 0.04), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
              }
            : undefined
        }
        aria-label={`${translate(plan.name, language)} plan${isCurrentPlan ? ` (${translate("Current Plan", language)})` : ""}`}
      >
        {/* Top Right Badges */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
          {/* Current Plan Badge */}
          {isCurrentPlan && (
            <Badge
              variant="secondary"
              className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border font-normal uppercase tracking-wide"
            >
              {translate("Current Plan", language)}
            </Badge>
          )}
          {/* Most Popular Badge */}
          {plan.badge && !isCurrentPlan && (
            <Badge
              variant="default"
              className="text-[10px] px-2 py-0.5 rounded-md bg-primary text-white border-0 font-normal uppercase tracking-wide"
            >
              {translate(plan.badge, language)}
            </Badge>
          )}
        </div>

        {/* Title */}
        <div className="pr-20">
          <h3 className="text-xl font-semibold text-foreground">{translate(plan.name, language)}</h3>
        </div>

        {/* Price - Show for all plans including Enterprise */}
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-4xl font-extrabold text-foreground flex items-baseline">
            <span className="text-lg font-bold mr-0.5">{priceParts.currencySymbol}</span>
            <span>{priceParts.amount}</span>
            {priceParts.plus && <span className="text-4xl font-extrabold">{priceParts.plus}</span>}
          </span>
          <span className="text-xs text-muted-foreground font-normal">
            {priceParts.unit}
          </span>
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

        {/* CTA Button */}
        <div className="mt-auto pt-6">
          {isCurrentPlan ? (() => {
            const { profile } = useAuthStore.getState()
            const subscriptionStatus = profile?.subscription?.status
            const isCanceled = subscriptionStatus === "canceled" || subscriptionStatus === "expired"
            
            // 如果订阅已取消，显示 "Get Started" 按钮（可以重新订阅）
            if (isCanceled) {
              return (
                <Button
                  type="button"
                  variant="default"
                  className="w-full h-12"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectPlan()
                  }}
                >
                  {translate("Get Started", language)}
                </Button>
              )
            }
            
            // 否则显示当前计划（禁用）
            return (
              <Button type="button" disabled variant="secondary" className="w-full h-12">
                <Check className="mr-2 h-4 w-4" />
                {translate("Current Plan", language)}
              </Button>
            )
          })() : (
            <Button
              type="button"
              variant="default"
              className="w-full h-12"
              disabled={isRedirecting}
              onClick={(e) => {
                e.stopPropagation()
                if (plan.planId === "enterprise") {
                  setContactDialogOpen(true)
                } else {
                  handleSelectPlan()
                }
              }}
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {translate("Redirecting...", language)}
                </>
              ) : (
                getButtonLabel()
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Enterprise Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>{translate("Contact Sales", language)}</DialogTitle>
            <DialogDescription>{translate("We'll tailor a plan for your organization.", language)}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setContactDialogOpen(false)}
            >
              {translate("Cancel", language)}
            </Button>
            <Button type="button" onClick={handleContactSales}>
              {translate("Email us", language)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

