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
  KeyRound,
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
    <Card className="p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Top: Product Title & Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <KeyRound className="size-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <h3 className="font-heading text-base font-semibold text-foreground truncate">
                {userKey.product_name}
              </h3>
              {formattedDate && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3 shrink-0" />
                  <span>{t('keys.deliveredDate', { date: formattedDate })}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="size-3 shrink-0" />
              <span>{t('orders.detail.keyReady')}</span>
            </span>
          </div>
        </div>

        {/* Middle: Masked / Revealed Key Box */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-primary/20 bg-muted/50 p-3 sm:px-4">
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
              className="gap-1.5 text-xs active:scale-[0.98] transition-all"
              aria-label={isRevealed ? t('keys.hide') : t('keys.reveal')}
            >
              {isRevealed ? (
                <>
                  <EyeOff className="size-3.5" />
                  <span>{t('keys.hide')}</span>
                </>
              ) : (
                <>
                  <Eye className="size-3.5" />
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
              className={`gap-1.5 text-xs transition-all active:scale-[0.98] ${
                isCopied
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : ''
              }`}
              aria-label={t('keys.copy')}
            >
              {isCopied ? (
                <>
                  <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('keys.copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
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
              className="text-xs text-muted-foreground hover:text-destructive gap-1.5 active:scale-[0.98] transition-all"
            >
              <AlertTriangle className="size-3.5 shrink-0" />
              <span>{t('keys.reportIssue')}</span>
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

