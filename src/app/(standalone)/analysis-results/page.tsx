"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Eye, Heart, Search, Cpu, ArrowRight } from "lucide-react"
import { useLanguageStore } from "@/store/language.store"
import { translate } from "@/lib/i18n"

/**
 * 分析结果页面（独立页面）
 * 
 * 路径：/analysis-results
 * 目的：展示waitlist结束后的产品分析结果，引导用户选择订阅计划
 * 
 * 显示信息：
 * - 品牌影响力
 * - 同类产品排名
 * - 可见度
 * - 情绪
 * - 追踪的核心query个数
 * - 运行的模型
 */
export default function AnalysisResultsPage() {
  const router = useRouter()
  const { profile, token } = useAuthStore()
  const { language } = useLanguageStore()

  // 如果未登录，重定向到登录页
  useEffect(() => {
    console.log("[AnalysisResults] Auth check:", { token: !!token, profile: !!profile, email: profile?.email })
    if (!token) {
      console.log("[AnalysisResults] No token, redirecting to login")
      router.push("/login")
    } else if (!profile || !profile.email) {
      console.log("[AnalysisResults] No profile or email, waiting for profile to load...")
      // 等待 profile 加载，不要立即重定向
    }
  }, [token, profile, router])

  if (!token) {
    return null
  }

  // 如果 profile 还在加载中，显示加载状态
  if (!profile || !profile.email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Mock 分析结果数据（后续从API获取）
  const analysisData = {
    brandInfluence: 89.5,
    brandInfluenceRank: 35, // Brand Influence 的名次
    rank: 2,
    visibility: 74.3,
    sentiment: 0.71,
    coreQueries: 50,
    models: ["GPT-4", "Claude", "Gemini"],
  }

  const handleGetStarted = () => {
    router.push("/subscribe")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-white p-6">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            {language === "zh-TW" ? "您的分析結果已就緒" : "Your Analysis Results Are Ready"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {language === "zh-TW"
              ? "以下是您的品牌在AI搜索中的表现概览"
              : "Here's an overview of your brand's performance in AI search"}
          </p>
        </div>

        {/* Analysis Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Brand Influence */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand-600" />
                <h3 className="text-sm font-semibold text-foreground">
                  {language === "zh-TW" ? "品牌影響力" : "Brand Influence"}
                </h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">{analysisData.brandInfluence}</div>
              <p className="text-xs text-muted-foreground">
                {language === "zh-TW" ? "綜合評分" : "Overall Score"}
              </p>
            </div>
          </Card>

          {/* Rank */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-brand-600 text-white">{analysisData.brandInfluenceRank}</Badge>
                <h3 className="text-sm font-semibold text-foreground">
                  {language === "zh-TW" ? "同類產品排名" : "Product Ranking"}
                </h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">{analysisData.brandInfluenceRank}</div>
              <p className="text-xs text-muted-foreground">
                {language === "zh-TW" ? "品牌影響力名次" : "Brand Influence Rank"}
              </p>
            </div>
          </Card>

          {/* Visibility */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-brand-600" />
                <h3 className="text-sm font-semibold text-foreground">
                  {language === "zh-TW" ? "可見度" : "Visibility"}
                </h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">{analysisData.visibility}%</div>
              <p className="text-xs text-muted-foreground">
                {language === "zh-TW" ? "AI回應提及率" : "Mention Rate in AI Responses"}
              </p>
            </div>
          </Card>

          {/* Sentiment */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-brand-600" />
                <h3 className="text-sm font-semibold text-foreground">
                  {language === "zh-TW" ? "情緒" : "Sentiment"}
                </h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">{analysisData.sentiment}</div>
              <p className="text-xs text-muted-foreground">
                {language === "zh-TW" ? "情感傾向評分" : "Sentiment Score"}
              </p>
            </div>
          </Card>

          {/* Core Queries */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-brand-600" />
                <h3 className="text-sm font-semibold text-foreground">
                  {language === "zh-TW" ? "核心查詢" : "Core Queries"}
                </h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">{analysisData.coreQueries}</div>
              <p className="text-xs text-muted-foreground">
                {language === "zh-TW" ? "追蹤的查詢數量" : "Tracked Queries"}
              </p>
            </div>
          </Card>

          {/* Models */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-brand-600" />
                <h3 className="text-sm font-semibold text-foreground">
                  {language === "zh-TW" ? "運行模型" : "Models"}
                </h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {analysisData.models.map((model, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {model}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {language === "zh-TW" ? "多模型分析" : "Multi-Model Analysis"}
              </p>
            </div>
          </Card>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-6 text-lg"
          >
            {language === "zh-TW" ? "成為AI搜索中的領先品牌" : "Become a Leading Brand in AI Search"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Info Text */}
        <p className="text-center text-sm text-muted-foreground pt-4">
          {language === "zh-TW"
            ? "選擇適合的訂閱計劃，持續監控和優化您的品牌表現"
            : "Choose a subscription plan to continuously monitor and optimize your brand performance"}
        </p>
      </div>
    </div>
  )
}

