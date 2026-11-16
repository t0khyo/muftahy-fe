import { ProductCardSkeleton } from './product-card-skeleton'

export interface ProductRailSkeletonProps {
  count?: number
}

export function ProductRailSkeleton({ count = 5 }: ProductRailSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="product-rail-skeleton"
      className="flex gap-3 sm:gap-4 lg:gap-5 overflow-x-hidden"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="w-[164px] sm:w-[200px] lg:w-[240px] shrink-0"
        >
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  )
}

