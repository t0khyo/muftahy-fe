import type { ProductResponse } from '@workspace/domain/schemas/product'

export interface FilterCounts {
  byCategorySlug: Record<string, number>
  windowsCount: number
  officeCount: number
  retailCount: number
  oemCount: number
  total: number
}

export function calculateFilterCounts(products: ProductResponse[] = []): FilterCounts {
  const byCategorySlug: Record<string, number> = {}

  for (const p of products) {
    const slug =
      typeof p.category === 'object' && p.category !== null
        ? p.category.slug
        : String(p.category || '')
    if (slug) {
      byCategorySlug[slug] = (byCategorySlug[slug] || 0) + 1
    }
  }

  return {
    byCategorySlug,
    windowsCount: byCategorySlug['windows'] || 0,
    officeCount: byCategorySlug['office'] || 0,
    retailCount: products.filter((p) => p.variant === 'retail').length,
    oemCount: products.filter((p) => p.variant === 'oem').length,
    total: products.length,
  }
}
