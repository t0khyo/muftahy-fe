import * as React from 'react'
import { Box } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import type { ProductMediaItem } from '@workspace/domain/schemas/product'

export interface DetailMediaProps {
  coverImage: string
  productTitle: string
  media?: ProductMediaItem[]
  lang: string
}

export function DetailMedia({
  coverImage,
  productTitle,
  media = [],
  lang,
}: DetailMediaProps) {
  // Synthesize items list: if media is empty, use coverImage as single item
  const allMedia = React.useMemo(() => {
    if (media && media.length > 0) return media
    return [
      {
        type: 'image' as const,
        url: coverImage,
        alt: { en: productTitle, ar: productTitle },
      },
    ]
  }, [media, coverImage, productTitle])

  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [failedUrls, setFailedUrls] = React.useState<Record<string, boolean>>({})

  const currentItem = allMedia[selectedIndex] || allMedia[0]
  const currentAlt = (lang === 'ar' ? currentItem.alt.ar : currentItem.alt.en) || productTitle
  const isBroken = Boolean(currentItem?.url && failedUrls[currentItem.url])

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 4:3 Main Surface - Product Big, Full-Bleed (No Padded Shrink) */}
      <div className="group relative aspect-4/3 w-full rounded-2xl bg-secondary/30 border border-border/40 flex items-center justify-center overflow-hidden">
        {!isBroken && currentItem?.url ? (
          <img
            key={currentItem.url}
            src={currentItem.url}
            alt={currentAlt}
            loading="eager"
            decoding="async"
            onError={() => {
              if (currentItem?.url) {
                setFailedUrls((prev) => ({ ...prev, [currentItem.url]: true }))
              }
            }}
            className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.02] motion-reduce:transform-none select-none"
          />
        ) : (
          <div
            role="img"
            aria-label={currentAlt}
            className="flex flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground"
          >
            <Box className="size-16 sm:size-20 text-muted-foreground/50" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground line-clamp-1">{productTitle}</span>
          </div>
        )}
      </div>

      {/* Thumbnails (only if 2 or more media entries) */}
      {allMedia.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2" role="tablist" aria-label="Product Media">
          {allMedia.map((item, idx) => {
            const isSelected = idx === selectedIndex
            const altText = (lang === 'ar' ? item.alt.ar : item.alt.en) || `${productTitle} ${idx + 1}`
            return (
              <Button
                key={item.url + idx}
                type="button"
                variant="ghost"
                size="icon"
                role="tab"
                aria-selected={isSelected}
                aria-label={altText}
                onClick={() => setSelectedIndex(idx)}
                className={cn(
                  'relative size-14 shrink-0 rounded-xl overflow-hidden border-2 p-1 bg-secondary/30 transition-all',
                  isSelected
                    ? 'border-primary'
                    : 'border-border/40 hover:border-border opacity-70 hover:opacity-100',
                )}
              >
                <img
                  src={item.url}
                  alt=""
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    // Hide thumbnail image if broken
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}
