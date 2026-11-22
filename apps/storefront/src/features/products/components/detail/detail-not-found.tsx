import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { PackageSearch } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@workspace/ui/components/empty'

export interface DetailNotFoundProps {
  lang: string
}

export function DetailNotFound({ lang }: DetailNotFoundProps) {
  const { t } = useTranslation(['detail', 'common'])

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
      <Empty className="p-8 sm:p-12 rounded-3xl border border-dashed border-border bg-card/40 max-w-lg mx-auto">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="size-16 rounded-full mb-4">
            <PackageSearch className="size-8" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {t('notFoundTitle')}
            </h1>
          </EmptyTitle>
          <EmptyDescription className="text-sm">
            {t('notFoundSubtitle')}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="mt-4">
          <Button
            nativeButton={false}
            render={<Link to={`/${lang}/products`} />}
            className="h-11 px-6 rounded-full font-medium"
          >
            {t('browseProducts')}
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
