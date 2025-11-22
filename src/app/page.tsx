"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LandingHeader } from "@/components/landing-header"

/**
 * Landing Page - 公共展示页
 * 
 * 页面跳转逻辑：
 * - "Start Free Trial" 按钮 → /signup
 * - 已有账户 → /login
 * - Header 导航：Pricing, Docs, Blog
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <LandingHeader />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-ink-900">
            Gain the Competitive Edge in the AI Era
          </h1>
          <p className="text-lg sm:text-xl text-ink-600 mb-12 max-w-2xl">
            ximu helps you see and understand your brand&apos;s influence in AI search, track visibility and sentiment metrics, and discover high-potential acquisition channels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start 7-day free trial
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Talk to sales
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-ink-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-ink-900 mb-4">
                Powerful Features
              </h2>
              <p className="text-lg text-ink-600 max-w-2xl mx-auto">
                Everything you need to track and analyze your brand's performance
              </p>
            </div>
            
            {/* Features List - Vertical Layout */}
            <div className="space-y-20 max-w-7xl mx-auto">
              {/* Feature 1: 品牌影响力 (Brand Influence) */}
              <div className="bg-white rounded-xl border border-ink-200 overflow-hidden shadow-sm">
                <div className="flex flex-col lg:flex-row items-center">
                  <div className="w-full lg:w-2/5 p-8 lg:p-12">
                    <h3 className="text-3xl font-semibold text-ink-900 mb-6">
                      Brand Influence
                    </h3>
                    <p className="text-lg text-ink-600 leading-relaxed">
                      Comprehensively track your brand&apos;s influence metrics in AI search, understand your brand&apos;s overall performance and market position across multiple AI platforms, and make more informed brand decisions.
                    </p>
                  </div>
                  <div className="w-full lg:w-3/5 bg-ink-50 flex items-center justify-center p-2 lg:p-4">
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-ink-200 bg-white">
                      <Image
                        src="/features/brand-influence.png"
                        alt="Brand Influence"
                        fill
                        className="object-contain"
                        onError={(e) => {
                          // If image doesn't exist, show placeholder
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const placeholder = target.parentElement?.querySelector('.placeholder')
                          if (placeholder) {
                            (placeholder as HTMLElement).style.display = 'flex'
                          }
                        }}
                      />
                      <div className="placeholder absolute inset-0 hidden items-center justify-center text-ink-400">
                        <div className="text-center">
                          <p className="text-sm mb-2">Brand Influence Screenshot</p>
                          <p className="text-xs text-ink-500">Please place the screenshot at /public/features/brand-influence.png</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2: 品牌可见度 (Brand Visibility) */}
              <div className="bg-white rounded-xl border border-ink-200 overflow-hidden shadow-sm">
                <div className="flex flex-col lg:flex-row-reverse items-center">
                  <div className="w-full lg:w-2/5 p-8 lg:p-12">
                    <h3 className="text-3xl font-semibold text-ink-900 mb-6">
                      Brand Visibility
                    </h3>
                    <p className="text-lg text-ink-600 leading-relaxed">
                      Monitor your brand&apos;s appearance frequency, ranking, and attention in AI search results. Track your brand&apos;s visibility performance across different AI platforms to help optimize your brand exposure strategy.
                    </p>
                  </div>
                  <div className="w-full lg:w-3/5 bg-ink-50 flex items-center justify-center p-2 lg:p-4">
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-ink-200 bg-white">
                      <Image
                        src="/features/brand-visibility.png"
                        alt="Brand Visibility"
                        fill
                        className="object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const placeholder = target.parentElement?.querySelector('.placeholder')
                          if (placeholder) {
                            (placeholder as HTMLElement).style.display = 'flex'
                          }
                        }}
                      />
                      <div className="placeholder absolute inset-0 hidden items-center justify-center text-ink-400">
                        <div className="text-center">
                          <p className="text-sm mb-2">Brand Visibility Screenshot</p>
                          <p className="text-xs text-ink-500">Please place the screenshot at /public/features/brand-visibility.png</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 3: 情绪分析 (Sentiment Analysis) */}
              <div className="bg-white rounded-xl border border-ink-200 overflow-hidden shadow-sm">
                <div className="flex flex-col lg:flex-row items-center">
                  <div className="w-full lg:w-2/5 p-8 lg:p-12">
                    <h3 className="text-3xl font-semibold text-ink-900 mb-6">
                      Sentiment Analysis
                    </h3>
                    <p className="text-lg text-ink-600 leading-relaxed">
                      Gain deep insights into how AI models perceive your brand sentiment. Analyze positive, neutral, and negative mentions, identify trending topics and potential risks, and help improve your brand reputation and user experience.
                    </p>
                  </div>
                  <div className="w-full lg:w-3/5 bg-ink-50 flex items-center justify-center p-2 lg:p-4">
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-ink-200 bg-white">
                      <Image
                        src="/features/sentiment-analysis.png"
                        alt="Sentiment Analysis"
                        fill
                        className="object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const placeholder = target.parentElement?.querySelector('.placeholder')
                          if (placeholder) {
                            (placeholder as HTMLElement).style.display = 'flex'
                          }
                        }}
                      />
                      <div className="placeholder absolute inset-0 hidden items-center justify-center text-ink-400">
                        <div className="text-center">
                          <p className="text-sm mb-2">Sentiment Analysis Screenshot</p>
                          <p className="text-xs text-ink-500">Please place the screenshot at /public/features/sentiment-analysis.png</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-ink-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Upper Footer Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Brand Info */}
            <div>
              <p className="text-lg font-bold text-white mb-1">Gain the Competitive Edge</p>
              <p className="text-sm text-ink-400 mb-4">in the AI Era</p>
              <div className="flex items-center">
                <Image
                  src="/ximu-logo-horizontal-white.svg"
                  alt="ximu logo"
                  width={100}
                  height={36}
                  className="h-auto"
                  priority
                />
              </div>
            </div>

            {/* Middle Column - Product / Company */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Product / Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-sm text-ink-300 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-sm text-ink-300 hover:text-white transition-colors">
                    Docs
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-sm text-ink-300 hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Right Column - Follow Us */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Follow Us</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-ink-300 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span>x.com</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-ink-300 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    <span>LinkedIn</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Lower Footer Section - Separator */}
          <div className="border-t border-ink-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-ink-400">
                © {new Date().getFullYear()} ximu. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link href="/privacy" className="text-sm text-ink-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm text-ink-400 hover:text-white transition-colors">
                  Terms of Services
                </Link>
                <Link href="/imprint" className="text-sm text-ink-400 hover:text-white transition-colors">
                  Imprint
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}



