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
import type { CategoryResponse } from '@workspace/domain/schemas/product'

export interface DetailBreadcrumbProps {
  category: Pick<CategoryResponse, 'name' | 'slug'> | string
  productTitle: string
  lang: string
}

export function DetailBreadcrumb({
  category,
  productTitle,
  lang,
}: DetailBreadcrumbProps) {
  const { t, i18n } = useTranslation(['products', 'common'])

  const categoryLabel = (() => {
    const catObj = typeof category === 'object' && category !== null ? category : null
    const catSlug = catObj ? catObj.slug : (typeof category === 'string' ? category : '')
    const catName = catObj ? catObj.name : catSlug
    const isAr = lang === 'ar' || i18n.language === 'ar'
    if (isAr && (catSlug.toLowerCase() === 'windows' || catName.toLowerCase() === 'windows')) return 'ويندوز'
    if (isAr && (catSlug.toLowerCase() === 'office' || catName.toLowerCase() === 'office')) return 'أوفيس'
    return catName
  })()

  const categorySlug = typeof category === 'string' ? category : category.slug

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
          <BreadcrumbLink render={<Link to={`/${lang}/categories/${categorySlug}`} />}>
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
