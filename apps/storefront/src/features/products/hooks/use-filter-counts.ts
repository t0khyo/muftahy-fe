import type { ProductResponse } from '@workspace/domain/schemas/product'

export interface FilterCounts {
  windowsCount: number
  officeCount: number
  retailCount: number
  oemCount: number
  inStockCount: number
  preorderCount: number
  total: number
}

export function calculateFilterCounts(products: ProductResponse[] = []): FilterCounts {
  return {
    windowsCount: products.filter((p) => p.category === 'windows').length,
    officeCount: products.filter((p) => p.category === 'office').length,
    retailCount: products.filter((p) => p.variant === 'retail').length,
    oemCount: products.filter((p) => p.variant === 'oem').length,
    inStockCount: products.filter((p) => p.stock_status === 'in_stock').length,
    preorderCount: products.filter((p) => p.stock_status === 'preorder').length,
    total: products.length,
  }
}
