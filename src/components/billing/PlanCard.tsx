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
import { usePlanStore } from "@/store/plan.store"
import { useLanguageStore } from "@/store/language.store"
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
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleCardClick = () => {
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
      // Create Stripe Checkout Session
      const response = await apiClient.post("/stripe/create-checkout-session", {
        priceId: plan.priceId,
        planId: plan.planId,
      })

      const { checkoutUrl } = response.data

      if (checkoutUrl) {
        // Redirect to Stripe Checkout (real mode)
        window.location.href = checkoutUrl
      } else {
        // Mock mode: simulate successful subscription
        setIsRedirecting(false)
        // TODO: Update plan store with selected plan
        // For now, just redirect back to plan page
        router.push("/settings/plan?success=true")
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error)
      setIsRedirecting(false)
      // TODO: Show error toast
    }
  }

  const handleContactSales = () => {
    window.location.href = "mailto:sales@example.com?subject=Enterprise Plan Inquiry"
    setContactDialogOpen(false)
  }

  const getButtonLabel = () => {
    if (isCurrentPlan) return translate("Current Plan", language)
    if (plan.planId === "free") return translate("Start for $0", language)
    if (plan.planId === "basic") return translate("Choose Basic", language)
    if (plan.planId === "advanced") return translate("Choose Advanced", language)
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
            : "border-border hover:border-primary/50"
        )}
        style={
          isCurrentPlan
            ? {
                boxShadow:
                  "0 20px 40px rgba(0, 0, 210, 0.12), 0 4px 6px -1px rgb(0 0 0 / 0.04), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
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
          {isCurrentPlan ? (
            <Button type="button" disabled variant="secondary" className="w-full h-12">
              <Check className="mr-2 h-4 w-4" />
              {translate("Current Plan", language)}
            </Button>
          ) : (
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

