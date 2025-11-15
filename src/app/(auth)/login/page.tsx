"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { Mail } from "lucide-react"
import { useAuthStore } from "@/store/auth.store"
import apiClient from "@/services/api"
import { MagicLinkResponseSchema } from "@/types/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormMessage } from "@/components/ui/form-message"

const magicLinkSchema = z.object({
  email: z.string().min(1, "请输入邮箱地址").email("请输入有效的邮箱地址"),
})

type MagicLinkForm = z.infer<typeof magicLinkSchema>

export default function LoginPage() {
  const router = useRouter()
  const { token, profile } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<MagicLinkForm>({
    resolver: zodResolver(magicLinkSchema),
    mode: "onChange",
  })

  useEffect(() => {
    if (token && profile && profile.hasBrand) {
      const email = profile.email
      if (email === "test1@example.com" || email === "test1@gmail.com") {
        router.push("/analysis-results")
      } else {
        router.push("/overview")
      }
    }
  }, [token, profile, router])

  const onSendMagicLink = async (data: MagicLinkForm) => {
    try {
      const response = await apiClient.post("/api/auth/magic-link", { email: data.email })
      const result = MagicLinkResponseSchema.parse(response.data)
      if (result.ok) {
        router.push("/auth/check-inbox")
      }
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "发送失败，请重试"
      setError("root", { message })
    }
  }

  const onGoogleLogin = () => {
    router.push("/auth/google")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Login</h1>
          <p className="text-muted-foreground">登录你的账户</p>
        </div>

        <form onSubmit={handleSubmit(onSendMagicLink)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              {...register("email")}
              disabled={isSubmitting}
              className={errors.email ? "border-destructive" : ""}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            <FormMessage message={errors.email?.message} variant="error" />
          </div>

          <div className="space-y-1 text-sm text-muted-foreground">
            <p>我们会将一次性的 Magic Link 发送到您的邮箱，请在 10 分钟内完成登录。</p>
          </div>

          {errors.root && <FormMessage message={errors.root.message} variant="error" />}

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
            <Mail className="mr-2 h-4 w-4" />
            {isSubmitting ? "发送中..." : "Send Magic Link"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={onGoogleLogin} disabled={isSubmitting}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
