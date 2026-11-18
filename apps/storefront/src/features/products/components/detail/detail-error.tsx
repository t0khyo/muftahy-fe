import { useTranslation } from 'react-i18next'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'

export interface DetailErrorProps {
  onRetry: () => void
}

export function DetailError({ onRetry }: DetailErrorProps) {
  const { t } = useTranslation(['detail', 'common'])

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border border-destructive/30 bg-destructive/5 max-w-lg mx-auto">
        <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4 text-destructive">
          <AlertCircle className="size-8" aria-hidden="true" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          {t('errorTitle')}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {t('errorSubtitle')}
        </p>
        <Button
          type="button"
          onClick={onRetry}
          className="h-11 px-6 rounded-full font-medium flex items-center gap-2"
        >
          <RotateCcw className="size-4" />
          {t('retry')}
        </Button>
      </div>
    </div>
  )
}
