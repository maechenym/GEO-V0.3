"use client"

export default function DashboardPage() {
  return (
    <div className="bg-background -mx-6">
      {/* Top Filter Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-border px-6 py-2">
        <div className="container mx-auto max-w-[1600px]">
          <div className="flex items-center justify-between">
            {/* Left: Title */}
            <div className="-ml-6">
              <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Coming soon
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto pl-4 pr-4 pt-4 pb-10 max-w-[1600px]">
        <div className="space-y-6">
        </div>
      </div>
    </div>
  )
}

