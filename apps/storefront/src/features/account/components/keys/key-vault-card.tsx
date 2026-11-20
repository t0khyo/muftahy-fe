import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Calendar,
} from 'lucide-react'
import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { formatDate } from '@workspace/domain/formatters/date'
import type { UserKey } from '@workspace/domain/schemas/key'

interface KeyVaultCardProps {
  userKey: UserKey
  onReportIssue?: (userKey: UserKey) => void
}

export function KeyVaultCard({ userKey, onReportIssue }: KeyVaultCardProps) {
  const { t } = useTranslation('account')
  const { lang = 'ar' } = useParams<{ lang: string }>()

  const [isRevealed, setIsRevealed] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userKey.serial)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      // Fallback if clipboard API is blocked
    }
  }

  const maskedSerial = '•••••-•••••-•••••-•••••-•••••'
  const formattedDate = userKey.sold_at
    ? formatDate(userKey.sold_at, {
        locale: lang,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <Card className="p-4 sm:p-5 transition-all hover:border-primary/40 hover:shadow-xs">
      <div className="flex flex-col gap-4">
        {/* Top: Product Title & Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <h3 className="font-heading text-base font-semibold text-foreground">
              {userKey.product_name}
            </h3>
            {formattedDate && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 shrink-0" />
                <span>{t('keys.deliveredDate', { date: formattedDate })}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3 w-3 shrink-0" />
              <span>{t('orders.detail.keyReady')}</span>
            </span>
          </div>
        </div>

        {/* Middle: Masked / Revealed Key Box */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3 sm:px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span
              className={`font-mono text-sm sm:text-base font-semibold tracking-wider select-all transition-colors ${
                isRevealed ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {isRevealed ? userKey.serial : maskedSerial}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Reveal / Hide Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRevealed(!isRevealed)}
              className="gap-1.5 text-xs"
              aria-label={isRevealed ? t('keys.hide') : t('keys.reveal')}
            >
              {isRevealed ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  <span>{t('keys.hide')}</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  <span>{t('keys.reveal')}</span>
                </>
              )}
            </Button>

            {/* Copy Button */}
            <Button
              type="button"
              variant={isCopied ? 'outline' : 'default'}
              size="sm"
              onClick={handleCopy}
              className={`gap-1.5 text-xs transition-colors ${
                isCopied
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : ''
              }`}
              aria-label={t('keys.copy')}
            >
              {isCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('keys.copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{t('keys.copy')}</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Bottom Actions: Report Issue */}
        {onReportIssue && (
          <div className="flex items-center justify-end border-t border-border pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onReportIssue(userKey)}
              className="text-xs text-muted-foreground hover:text-destructive gap-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>{t('keys.reportIssue')}</span>
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

