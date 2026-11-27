import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Share2 } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@workspace/ui/components/tooltip'
import { toast } from '@workspace/ui/components/sonner'

export interface DetailShareButtonProps {
  productName: string
  productDescription?: string | null
}

/**
 * Share button for the product detail page. Uses the native Web Share API
 * when supported and falls back to copying the current URL to the clipboard.
 */
export function DetailShareButton({
  productName,
  productDescription,
}: DetailShareButtonProps) {
  const { t } = useTranslation('detail')
  const [copied, setCopied] = React.useState(false)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: productName,
          text: productDescription || productName,
          url,
        })
        return
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') {
          return
        }
      }
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        throw new Error('Clipboard API unavailable')
      }

      setCopied(true)
      toast.success(t('shareCopied'))

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      toast.error(t('shareFailed'))
    }
  }

  const label = copied ? t('shareCopied') : t('share')

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleShare}
            aria-label={label}
            className="shrink-0 rounded-full"
          />
        }
      >
        {copied ? (
          <Check className="size-4 text-success" aria-hidden="true" />
        ) : (
          <Share2 className="size-4" aria-hidden="true" />
        )}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

