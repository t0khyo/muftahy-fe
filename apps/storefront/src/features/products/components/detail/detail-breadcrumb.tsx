import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb'

export interface DetailBreadcrumbProps {
  category: string
  productTitle: string
  lang: string
}

export function DetailBreadcrumb({
  category,
  productTitle,
  lang,
}: DetailBreadcrumbProps) {
  const { t } = useTranslation(['products', 'common'])

  const categoryLabel =
    category === 'windows'
      ? t('categories.windows', { ns: 'products', defaultValue: 'Windows' })
      : t('categories.office', { ns: 'products', defaultValue: 'Office' })

  return (
    <Breadcrumb aria-label="Breadcrumb" className="w-full mb-6">
      <BreadcrumbList className="gap-1.5 text-xs text-muted-foreground">
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link to={`/${lang}`} />}>
            {t('home', { ns: 'common', defaultValue: lang === 'ar' ? 'الرئيسية' : 'Home' })}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link to={`/${lang}/products?category=${category}`} />}>
            {categoryLabel}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium text-foreground truncate max-w-[200px] sm:max-w-md">
            {productTitle}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
