"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FormMessage } from "@/components/ui/form-message"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/services/api"
import { usePlanStore } from "@/store/plan.store"
import { Loader2 } from "lucide-react"

const paymentSchema = z.object({
  cardholderName: z.string().min(1, "持卡人姓名为必填"),
})

type PaymentFormData = z.infer<typeof paymentSchema>

// 延迟加载 Stripe，只在需要时加载
const getStripePromise = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!publishableKey) {
    return null
  }
  return loadStripe(publishableKey)
}

interface PaymentFormInnerProps {
  clientSecret: string
  onSuccess: () => void
}

/**
 * PaymentForm 内部表单组件（Mock 模式）
 */
function PaymentFormInnerMock({ clientSecret, onSuccess }: PaymentFormInnerProps) {
  const { toast } = useToast()
  const { setPlan } = usePlanStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  })

  const onSubmit = async (data: PaymentFormData) => {
    setIsLoading(true)

    try {
      // Mock 模式：直接使用假 payment_method_id
      const paymentMethodId = "pm_mock_123"

      // 调用激活 API
      const activateResponse = await apiClient.post("/plan/activate", {
        payment_method_id: paymentMethodId,
      })

      const { trialEndsAt, plan } = activateResponse.data

      // 写入 store
      setPlan({
        planType: plan,
        trialEndsAt,
      })

      // 成功提示
      toast({
        title: "试用已激活",
        description: `您的 7 天免费试用已开始，到期时间为 ${new Date(trialEndsAt).toLocaleDateString()}`,
      })

      // 触发成功回调
      onSuccess()
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "激活失败，请重试"
      toast({
        title: "激活失败",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 持卡人姓名 */}
      <div className="space-y-2">
        <Label htmlFor="cardholderName">
          持卡人姓名 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="cardholderName"
          {...register("cardholderName")}
          placeholder="John Doe"
          aria-describedby={errors.cardholderName ? "cardholderName-error" : undefined}
          disabled={isLoading}
        />
        {errors.cardholderName && (
          <FormMessage
            message={errors.cardholderName.message}
            variant="error"
          />
        )}
      </div>

      {/* Mock 模式：显示提示 */}
      <div className="space-y-2">
        <Label>支付信息</Label>
        <div className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
          Mock 模式：支付表单已禁用，可直接提交测试
        </div>
      </div>

      {/* 提交按钮 */}
      <Button
        type="submit"
        className="w-full bg-[#0000D2] hover:bg-[#0000D2]/90 text-white"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            处理中...
          </>
        ) : (
          "Start Free Trial"
        )}
      </Button>
    </form>
  )
}

/**
 * PaymentForm 内部表单组件（真实模式）
 */
function PaymentFormInnerReal({ clientSecret, onSuccess }: PaymentFormInnerProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const { setPlan } = usePlanStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  })

  const onSubmit = async (data: PaymentFormData) => {
    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    try {
      // 真实模式：确认 SetupIntent
      const result = await stripe.confirmSetup({
        clientSecret,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: data.cardholderName,
            },
          },
          return_url: window.location.origin + "/settings/plan",
        },
      })

      if (result.error) {
        throw new Error(result.error.message || "支付方式确认失败")
      }

      // Type assertion: Stripe types can be inconsistent
      const setupIntent = (result as any).setupIntent
      if (!setupIntent?.payment_method) {
        throw new Error("未获取到支付方式 ID")
      }

      const paymentMethodId =
        typeof setupIntent.payment_method === "string"
          ? setupIntent.payment_method
          : setupIntent.payment_method.id

      // 调用激活 API
      const activateResponse = await apiClient.post("/plan/activate", {
        payment_method_id: paymentMethodId,
      })

      const { trialEndsAt, plan } = activateResponse.data

      // 写入 store
      setPlan({
        planType: plan,
        trialEndsAt,
      })

      // 成功提示
      toast({
        title: "试用已激活",
        description: `您的 7 天免费试用已开始，到期时间为 ${new Date(trialEndsAt).toLocaleDateString()}`,
      })

      // 触发成功回调
      onSuccess()
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "激活失败，请重试"
      toast({
        title: "激活失败",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 持卡人姓名 */}
      <div className="space-y-2">
        <Label htmlFor="cardholderName">
          持卡人姓名 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="cardholderName"
          {...register("cardholderName")}
          placeholder="John Doe"
          aria-describedby={errors.cardholderName ? "cardholderName-error" : undefined}
          disabled={isLoading}
        />
        {errors.cardholderName && (
          <FormMessage
            message={errors.cardholderName.message}
            variant="error"
          />
        )}
      </div>

      {/* Stripe Payment Element */}
      <div className="space-y-2">
        <Label>支付信息</Label>
        <div className="rounded-lg border border-border bg-white p-4">
          <PaymentElement />
        </div>
      </div>

      {/* 提交按钮 */}
      <Button
        type="submit"
        className="w-full bg-[#0000D2] hover:bg-[#0000D2]/90 text-white"
        size="lg"
        disabled={isLoading || !stripe || !elements}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            处理中...
          </>
        ) : (
          "Start Free Trial"
        )}
      </Button>
    </form>
  )
}

interface PaymentFormProps {
  onSuccess: () => void
}

/**
 * PaymentForm 组件
 * 
 * 使用 Stripe Elements 收集支付信息
 */
export function PaymentForm({ onSuccess }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK === "true"

  // 获取 SetupIntent client_secret
  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const response = await apiClient.post("/stripe/create-setup-intent")
        setClientSecret(response.data.client_secret)
      } catch (err) {
        const message =
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "获取支付信息失败"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClientSecret()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive bg-destructive/10 p-6">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6">
        <p className="text-muted-foreground">无法初始化支付表单</p>
      </div>
    )
  }

  // 在 Mock 模式下，如果 Stripe publishable key 未设置，使用空字符串
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""

  if (!isMock && !publishableKey) {
    return (
      <div className="rounded-2xl border border-destructive bg-destructive/10 p-6">
        <p className="text-destructive">
          未配置 Stripe 发布密钥。请在 .env.local 中设置 NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        </p>
      </div>
    )
  }

  // Mock 模式下，直接渲染 Mock 版本的表单（不包裹 Elements）
  if (isMock) {
    return <PaymentFormInnerMock clientSecret={clientSecret} onSuccess={onSuccess} />
  }

  // 真实模式：包裹 Elements
  const stripePromise = getStripePromise()
  
  if (!stripePromise) {
    return (
      <div className="rounded-2xl border border-destructive bg-destructive/10 p-6">
        <p className="text-destructive">
          未配置 Stripe 发布密钥。请在 .env.local 中设置 NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        </p>
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
        },
      }}
    >
      <PaymentFormInnerReal clientSecret={clientSecret} onSuccess={onSuccess} />
    </Elements>
  )
}

