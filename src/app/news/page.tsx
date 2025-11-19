"use client"

import { LandingHeader } from "@/components/landing-header"

export default function NewsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LandingHeader />
      
      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-6">
              News & Updates
            </h1>
            <p className="text-lg text-ink-600 mb-12">
              Stay up to date with the latest news, updates, and announcements from ximu.
            </p>
            
            <div className="space-y-8">
              {/* News Item 1 */}
              <article className="bg-white p-6 rounded-lg border border-ink-200 hover:shadow-md transition-shadow">
                <div className="text-sm text-ink-500 mb-2">December 15, 2024</div>
                <h2 className="text-2xl font-semibold text-ink-900 mb-3">
                  New Features: Enhanced Sentiment Analysis
                </h2>
                <p className="text-ink-600">
                  We've launched new sentiment analysis features that provide deeper insights into how AI models perceive your brand.
                </p>
              </article>

              {/* News Item 2 */}
              <article className="bg-white p-6 rounded-lg border border-ink-200 hover:shadow-md transition-shadow">
                <div className="text-sm text-ink-500 mb-2">November 20, 2024</div>
                <h2 className="text-2xl font-semibold text-ink-900 mb-3">
                  Platform Update: Improved Performance
                </h2>
                <p className="text-ink-600">
                  Our latest update includes significant performance improvements and faster data processing times.
                </p>
              </article>

              {/* News Item 3 */}
              <article className="bg-white p-6 rounded-lg border border-ink-200 hover:shadow-md transition-shadow">
                <div className="text-sm text-ink-500 mb-2">October 10, 2024</div>
                <h2 className="text-2xl font-semibold text-ink-900 mb-3">
                  Welcome to ximu
                </h2>
                <p className="text-ink-600">
                  We're excited to announce the launch of ximu, your AI-powered brand visibility and analytics platform.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

