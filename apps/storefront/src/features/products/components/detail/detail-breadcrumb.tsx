import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'

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

  type CategoryKey = 'categoryGames' | 'categorySoftware' | 'categorySubscriptions' | 'categoryGiftCards'
  const categoryKeyMap: Record<string, CategoryKey> = {
    games: 'categoryGames',
    software: 'categorySoftware',
    subscriptions: 'categorySubscriptions',
    'gift-cards': 'categoryGiftCards',
  }

  const catKey = categoryKeyMap[category]
  const categoryLabel = catKey
    ? t(catKey, { ns: 'products' })
    : category

  return (
    <nav aria-label="Breadcrumb" className="w-full mb-6">
      <ol className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
        <li>
          <Link
            to={`/${lang}`}
            className="hover:text-foreground transition-colors"
          >
            {t('home', { ns: 'common', defaultValue: lang === 'ar' ? 'الرئيسية' : 'Home' })}
          </Link>
        </li>
        <li aria-hidden="true" className="flex items-center">
          <ChevronRight className="size-3.5 rtl:rotate-180 text-muted-foreground/60" />
        </li>
        <li>
          <Link
            to={`/${lang}/products?category=${category}`}
            className="hover:text-foreground transition-colors"
          >
            {categoryLabel}
          </Link>
        </li>
        <li aria-hidden="true" className="flex items-center">
          <ChevronRight className="size-3.5 rtl:rotate-180 text-muted-foreground/60" />
        </li>
        <li aria-current="page" className="font-medium text-foreground truncate max-w-[200px] sm:max-w-md">
          {productTitle}
        </li>
      </ol>
    </nav>
  )
}
