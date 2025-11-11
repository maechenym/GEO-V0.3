"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Brand Influence Card Skeleton */}
      <Card className="rounded-lg border border-ink-200 shadow-subtle">
        <CardHeader>
          <Skeleton className="h-5 w-48 bg-ink-100" />
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Skeleton className="h-10 w-32 mb-2 bg-ink-100" />
          </div>
          <Skeleton className="h-[360px] w-full rounded-lg bg-ink-100" />
        </CardContent>
      </Card>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-lg border border-ink-200 shadow-subtle">
            <CardHeader>
              <Skeleton className="h-4 w-24 bg-ink-100" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2 bg-ink-100" />
              <Skeleton className="h-4 w-16 ml-auto bg-ink-100" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function RankingTableSkeleton() {
  return (
    <Card className="rounded-lg border border-ink-200 shadow-subtle">
      <CardHeader>
        <Skeleton className="h-5 w-40 bg-ink-100" />
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Pinned brand skeleton */}
        <Skeleton className="h-12 w-full rounded-lg bg-ink-100" />
        <Skeleton className="h-px w-full bg-ink-100" />
        {/* List items skeleton */}
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg bg-ink-100" />
        ))}
        {/* Pagination skeleton */}
        <div className="mt-4 pt-4 border-t border-ink-100">
          <div className="flex justify-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg bg-ink-100" />
            <Skeleton className="h-8 w-8 rounded-lg bg-ink-100" />
            <Skeleton className="h-8 w-8 rounded-lg bg-ink-100" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

