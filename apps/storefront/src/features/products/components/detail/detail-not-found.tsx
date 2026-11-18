import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { PackageSearch } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'

export interface DetailNotFoundProps {
  lang: string
}

export function DetailNotFound({ lang }: DetailNotFoundProps) {
  const { t } = useTranslation(['detail', 'common'])

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border border-dashed border-border bg-card/40 max-w-lg mx-auto">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
          <PackageSearch className="size-8" aria-hidden="true" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          {t('notFoundTitle')}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {t('notFoundSubtitle')}
        </p>
        <Button
          nativeButton={false}
          render={<Link to={`/${lang}/products`} />}
          className="h-11 px-6 rounded-full font-medium"
        >
          {t('browseProducts')}
        </Button>
      </div>
    </div>
  )
}
