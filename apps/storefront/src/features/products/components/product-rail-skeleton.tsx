import { ProductCardSkeleton } from './product-card-skeleton'

export interface ProductRailSkeletonProps {
  count?: number
}

export function ProductRailSkeleton({ count = 5 }: ProductRailSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="product-rail-skeleton"
      className="flex gap-4 overflow-x-hidden"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="w-[260px] sm:w-[280px] shrink-0"
        >
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  )
}

