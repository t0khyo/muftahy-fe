import { useTranslation } from 'react-i18next'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@workspace/ui/components/empty'

export interface DetailErrorProps {
  onRetry: () => void
}

export function DetailError({ onRetry }: DetailErrorProps) {
  const { t } = useTranslation(['detail', 'common'])

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
      <Empty className="p-8 sm:p-12 rounded-3xl border border-destructive/30 bg-destructive/5 max-w-lg mx-auto">
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className="size-16 rounded-full bg-destructive/10 text-destructive mb-4"
          >
            <AlertCircle className="size-8" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {t('errorTitle')}
            </h1>
          </EmptyTitle>
          <EmptyDescription className="text-sm">
            {t('errorSubtitle')}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="mt-4">
          <Button
            type="button"
            onClick={onRetry}
            className="h-11 px-6 rounded-full font-medium flex items-center gap-2"
          >
            <RotateCcw className="size-4" />
            {t('retry')}
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
