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
import { LoginResponseSchema, MagicLinkResponseSchema } from "@/types/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormMessage } from "@/components/ui/form-message"

const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
})

type LoginForm = z.infer<typeof loginSchema>

/**
 * 登录页面
 * 
 * 功能：
 * - Email 输入（必填，Zod 邮箱校验）
 * - Login 按钮（POST /api/auth/login）
 * - Send Magic Link 按钮（POST /api/auth/magic-link）
 * - Continue with Google 按钮
 * 
 * 页面跳转逻辑：
 * - 登录成功后根据 hasBrand/isNew 跳转 /onboarding/brand 或 /overview
 * - 发送 Magic Link 后跳转 /auth/check-inbox
 * - Google 登录跳转 /auth/google
 * - 已登录用户自动跳转 /overview
 */
export default function LoginPage() {
  const router = useRouter()
  const { token, profile, loginWithToken, loadProfile, setIsNew } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  // 已登录且有品牌的用户重定向到 overview
  // 已登录但无品牌的用户可以继续访问登录页（可能需要重新登录）
  useEffect(() => {
    if (token && profile && profile.hasBrand) {
      router.push("/overview")
    }
  }, [token, profile, router])

  // Login 提交
  const onLogin = async (data: LoginForm) => {
    try {
      const response = await apiClient.post("/auth/login", { email: data.email })
      const result = LoginResponseSchema.parse(response.data)

      if (result.ok) {
        await loginWithToken(result.token)
        setIsNew(result.isNew)
        const profile = await loadProfile()

        // 根据 isNew 和 hasBrand 决定跳转
        if (result.isNew || !profile.hasBrand) {
          router.push("/onboarding/brand")
        } else {
          router.push("/overview")
        }
      }
    } catch (error: unknown) {
      const message = error && typeof error === "object" && "message" in error
        ? String(error.message)
        : "登录失败，请重试"
      setError("root", { message })
    }
  }

  // Send Magic Link
  const onSendMagicLink = async (data: LoginForm) => {
    try {
      const response = await apiClient.post("/auth/magic-link", { email: data.email })
      const result = MagicLinkResponseSchema.parse(response.data)

      if (result.ok) {
        router.push("/auth/check-inbox")
      }
    } catch (error: unknown) {
      const message = error && typeof error === "object" && "message" in error
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

        <form onSubmit={handleSubmit(onLogin)} className="space-y-6">
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

          {errors.root && <FormMessage message={errors.root.message} variant="error" />}

          <div className="space-y-3">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? "登录中..." : "Login"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleSubmit(onSendMagicLink)}
              disabled={isSubmitting}
            >
              <Mail className="mr-2 h-4 w-4" />
              Send Magic Link
            </Button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onGoogleLogin}
          disabled={isSubmitting}
        >
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
