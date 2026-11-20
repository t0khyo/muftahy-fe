import type { ProductCategory, ProductVariant } from '@workspace/domain/schemas/product'

export function resolveProductImage(category: ProductCategory, variant: ProductVariant): string {
  if (category === 'windows') {
    return variant === 'oem'
      ? '/images/products/windows-oem.webp'
      : '/images/products/windows-retail.webp'
  }
  return '/images/products/office-retail.webp'
}

