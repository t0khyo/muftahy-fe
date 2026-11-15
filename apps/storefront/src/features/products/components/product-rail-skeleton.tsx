import { ProductCardPlaceholder } from './product-card-placeholder'

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
          className="w-[calc(43.5%-12px)] sm:w-[calc(33.333%-12px)] lg:w-[calc(20%-13px)] shrink-0"
        >
          <ProductCardPlaceholder />
        </div>
      ))}
    </div>
  )
}

