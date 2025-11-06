"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Brand Influence Card Skeleton */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Skeleton className="h-10 w-32 mb-2" />
          </div>
          <Skeleton className="h-[340px] w-full rounded-xl" />
        </CardContent>
      </Card>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-2xl shadow-sm">
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-5 w-16 ml-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function RankingTableSkeleton() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Pinned brand skeleton */}
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-px w-full" />
        {/* List items skeleton */}
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
        {/* Pagination skeleton */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

