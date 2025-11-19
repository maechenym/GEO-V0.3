"use client"

import { LandingHeader } from "@/components/landing-header"

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LandingHeader />
      
      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-6">
              Documentation
            </h1>
            <div className="prose prose-ink max-w-none">
              <p className="text-lg text-ink-600 mb-8">
                Welcome to the ximu documentation. Here you'll find guides, API references, and examples to help you get started.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <div className="bg-ink-50 p-6 rounded-lg border border-ink-200">
                  <h2 className="text-xl font-semibold text-ink-900 mb-2">Getting Started</h2>
                  <p className="text-ink-600">
                    Learn the basics and set up your account
                  </p>
                </div>
                <div className="bg-ink-50 p-6 rounded-lg border border-ink-200">
                  <h2 className="text-xl font-semibold text-ink-900 mb-2">API Reference</h2>
                  <p className="text-ink-600">
                    Complete API documentation and examples
                  </p>
                </div>
                <div className="bg-ink-50 p-6 rounded-lg border border-ink-200">
                  <h2 className="text-xl font-semibold text-ink-900 mb-2">Guides</h2>
                  <p className="text-ink-600">
                    Step-by-step tutorials and best practices
                  </p>
                </div>
                <div className="bg-ink-50 p-6 rounded-lg border border-ink-200">
                  <h2 className="text-xl font-semibold text-ink-900 mb-2">FAQ</h2>
                  <p className="text-ink-600">
                    Frequently asked questions and answers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

