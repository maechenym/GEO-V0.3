"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCheckoutStore } from "@/store/checkout.store"
import { Button } from "@/components/ui/button"

export default function CheckoutPage() {
  const router = useRouter()
  const { selectedPlan, reset } = useCheckoutStore()

  useEffect(() => {
    if (!selectedPlan) {
      router.push("/settings/plan")
    }
  }, [selectedPlan, router])

  if (!selectedPlan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="bg-background -mx-6">
      {/* Top Filter Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-border px-6 py-2">
        <div className="container mx-auto max-w-[1600px]">
          <div className="flex items-center justify-between">
            {/* Left: Title */}
            <div className="-ml-6">
              <h1 className="text-xl font-semibold text-foreground">Checkout</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review your selected plan: <strong>{selectedPlan.name}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto pl-4 pr-4 pt-4 pb-10 max-w-[1600px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="text-lg font-semibold">{selectedPlan.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-lg font-semibold">{selectedPlan.priceText}</p>
              </div>
              <div className="pt-4 flex gap-4">
                <Button variant="outline" onClick={() => router.back()}>
                  Back
                </Button>
                <Button onClick={() => {
                  // TODO: Implement checkout flow
                  console.log("Checkout for plan:", selectedPlan)
                }}>
                  Continue to Payment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

