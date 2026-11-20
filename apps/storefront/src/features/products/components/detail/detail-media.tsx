import * as React from 'react'
import { Box } from 'lucide-react'

export interface DetailMediaProps {
  coverImage: string
  productTitle: string
  lang?: string
}

export function DetailMedia({
  coverImage,
  productTitle,
}: DetailMediaProps) {
  const [imageFailed, setImageFailed] = React.useState(false)

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="group relative aspect-4/3 w-full rounded-2xl bg-secondary/30 border border-border/40 flex items-center justify-center overflow-hidden">
        {!imageFailed && coverImage ? (
          <img
            src={coverImage}
            alt={productTitle}
            loading="eager"
            decoding="async"
            onError={() => setImageFailed(true)}
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
    </div>
  )
}
