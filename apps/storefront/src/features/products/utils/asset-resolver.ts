import { resolveStorageUrl, getProductMainImageUrl } from '@workspace/api/factory'
import type { ProductImageResponse, ProductResponse, ProductVariant } from '@workspace/domain/schemas/product'

export { resolveStorageUrl, getProductMainImageUrl }

export function resolveProductImage(category?: string | null, variant?: ProductVariant | null): string {
  const cat = category?.toLowerCase() || ''
  if (cat === 'windows' || cat.includes('operating') || cat === 'os') {
    return variant === 'oem'
      ? '/images/products/windows-oem.webp'
      : '/images/products/windows-retail.webp'
  }
  return '/images/products/office-retail.webp'
}

export function getProductMainImage(
  product: Pick<ProductResponse, 'images'> | null | undefined,
): ProductImageResponse | null {
  if (!product || !product.images || product.images.length === 0) return null
  return (
    product.images.find((img) => img.is_primary) ??
    [...product.images].sort((a, b) => a.display_order - b.display_order)[0] ??
    null
  )
}

