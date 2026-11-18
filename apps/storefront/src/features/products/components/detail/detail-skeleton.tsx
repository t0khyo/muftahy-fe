import { Skeleton } from '@workspace/ui/components/skeleton'

export function DetailSkeleton() {
  return (
    <div className="site-container py-8 sm:py-10 animate-pulse motion-reduce:animate-none">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-12 rounded-md" />
        <span className="text-muted-foreground/30">/</span>
        <Skeleton className="h-4 w-20 rounded-md" />
        <span className="text-muted-foreground/30">/</span>
        <Skeleton className="h-4 w-32 rounded-md" />
      </div>

      {/* Top 12-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Media Skeleton (7 cols) */}
        <div className="lg:col-span-7">
          <Skeleton className="aspect-4/3 w-full rounded-2xl" />
        </div>

        {/* Buy Box Skeleton (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="flex gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-9 w-4/5 rounded-lg" />
            <Skeleton className="h-4 w-3/5 rounded-md" />
          </div>

          <Skeleton className="h-16 w-full rounded-xl" />

          <div className="flex items-baseline gap-3">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>

          <Skeleton className="h-4 w-40 rounded-md" />
          <Skeleton className="h-12 w-full rounded-full" />

          <div className="pt-2">
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Lower Sections Skeleton */}
      <div className="border-t border-border/40 mt-12 sm:mt-16 pt-10 sm:pt-14">
        <div className="max-w-2xl space-y-10">
          <div className="space-y-3">
            <Skeleton className="h-6 w-36 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-6 w-40 rounded-md" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
