import * as React from 'react'
import { Box } from 'lucide-react'
import type { ProductImageResponse } from '@workspace/domain/schemas/product'
import { resolveStorageUrl } from '../../utils/asset-resolver'
import { cn } from '@workspace/ui/lib/utils'

export interface DetailMediaProps {
  coverImage?: string
  images?: ProductImageResponse[]
  productTitle: string
  lang?: string
}

export function DetailMedia({
  coverImage = '',
  images = [],
  productTitle,
}: DetailMediaProps) {
  const sortedImages = React.useMemo(() => {
    return [...images].sort((a, b) => a.display_order - b.display_order)
  }, [images])

  const initialIndex = React.useMemo(() => {
    const primaryIndex = sortedImages.findIndex((img) => img.is_primary)
    return primaryIndex >= 0 ? primaryIndex : 0
  }, [sortedImages])

  const [selectedIndex, setSelectedIndex] = React.useState(initialIndex)
  const [failedUrls, setFailedUrls] = React.useState<Set<string>>(() => new Set())

  const safeIndex = selectedIndex >= sortedImages.length && sortedImages.length > 0 ? 0 : selectedIndex
  const currentImage = sortedImages[safeIndex]
  const currentImageUrl = currentImage
    ? resolveStorageUrl(currentImage.url) || resolveStorageUrl(currentImage.file_path)
    : coverImage

  const isCurrentFailed = !currentImageUrl || failedUrls.has(currentImageUrl)

  const handleImageError = (url: string) => {
    setFailedUrls((prev) => new Set(prev).add(url))
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Primary Display Stage */}
      <div className="group relative aspect-4/3 w-full rounded-2xl bg-secondary/30 border border-border/40 flex items-center justify-center overflow-hidden">
        {!isCurrentFailed ? (
          <img
            src={currentImageUrl}
            alt={productTitle}
            loading="eager"
            decoding="async"
            onError={() => currentImageUrl && handleImageError(currentImageUrl)}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02] motion-reduce:transform-none select-none"
          />
        ) : (
          <div
            role="img"
            aria-label={productTitle}
            className="flex flex-col items-center justify-center gap-3 text-muted-foreground/50 p-6 text-center select-none"
          >
            <Box className="size-16 stroke-[1.25]" aria-hidden="true" />
            <span className="text-sm font-medium">{productTitle}</span>
          </div>
        )}
      </div>

      {/* Thumbnail Strip (Rendered when 2 or more images) */}
      {sortedImages.length > 1 && (
        <div
          role="region"
          aria-label="Image gallery thumbnails"
          className="flex items-center gap-2 overflow-x-auto pb-1"
        >
          {sortedImages.map((img, idx) => {
            const thumbUrl = resolveStorageUrl(img.url) || resolveStorageUrl(img.file_path)
            const isSelected = idx === selectedIndex
            const isFailed = !thumbUrl || failedUrls.has(thumbUrl)

            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`${productTitle} - Image ${idx + 1}`}
                aria-current={isSelected ? 'true' : undefined}
                className={cn(
                  'relative size-16 sm:size-20 shrink-0 rounded-xl overflow-hidden border-2 bg-secondary/30 cursor-pointer transition-all',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-border/40 hover:border-border/80 opacity-70 hover:opacity-100',
                )}
              >
                {!isFailed ? (
                  <img
                    src={thumbUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={() => thumbUrl && handleImageError(thumbUrl)}
                    className="size-full object-cover select-none"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center text-muted-foreground/40">
                    <Box className="size-6 stroke-[1.25]" aria-hidden="true" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
