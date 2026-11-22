import * as React from 'react'
import { Button } from '@workspace/ui/components/button'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@workspace/ui/components/tooltip'
import { Eye, EyeOff, Copy, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface MaskedKeyRevealProps {
  serial: string
  className?: string
}

function maskSerial(serial: string): string {
  if (serial.length <= 8) return '****-****'
  const firstFour = serial.slice(0, 4)
  const lastFour = serial.slice(-4)
  return `${firstFour}-****-****-${lastFour}`
}

export function MaskedKeyReveal({ serial, className }: MaskedKeyRevealProps) {
  const { t } = useTranslation()
  const [revealed, setRevealed] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!revealed) return
    const timer = setTimeout(() => {
      setRevealed(false)
    }, 15_000)
    return () => clearTimeout(timer)
  }, [revealed])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(serial)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Ignore clipboard permission errors silently
    }
  }

  return (
    <div className={`inline-flex items-center gap-2 font-mono text-xs tabular-nums ${className ?? ''}`}>
      <span className="rounded bg-muted px-2 py-1 text-foreground border border-border select-all">
        {revealed ? serial : maskSerial(serial)}
      </span>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setRevealed((prev) => !prev)}
              aria-label={revealed ? t('admin.inventoryModule.maskKey', 'Mask') : t('admin.inventoryModule.revealKey', 'Reveal')}
            >
              {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </Button>
          }
        />
        <TooltipContent>
          {revealed ? t('admin.inventoryModule.maskKey', 'Mask') : t('admin.inventoryModule.revealKey', 'Reveal')}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleCopy}
              aria-label={copied ? t('admin.inventoryModule.copied', 'Copied!') : t('admin.inventoryModule.copyKey', 'Copy')}
            >
              {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
            </Button>
          }
        />
        <TooltipContent>
          {copied ? t('admin.inventoryModule.copied', 'Copied!') : t('admin.inventoryModule.copyKey', 'Copy')}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

