import * as React from 'react'
import { useParams, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { PackageOpen } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Breadcrumbs, type BreadcrumbItem } from '../../../components/breadcrumbs'
import { useCategoryBySlug } from '../hooks/use-products'
import { ProductCard } from '../components/product-card'
import { ProductCardSkeleton } from '../components/product-card-skeleton'

export function CategoryCatalogPage() {
  const { lang, slug } = useParams<{ lang: string; slug: string }>()
  const currentLang = lang || 'en'
  const currentSlug = slug || ''
  const { t } = useTranslation(['products', 'breadcrumb', 'common'])

  const { data: category, isLoading, isError, refetch } = useCategoryBySlug(currentSlug)

  const localizedCategoryName = currentSlug
    ? t(`categories.${currentSlug}`, {
        ns: 'products',
        defaultValue: category?.name || currentSlug,
      })
    : category?.name || ''

  const breadcrumbItems: BreadcrumbItem[] = React.useMemo(() => {
    return [
      { label: t('breadcrumb:home', 'Home'), href: `/${currentLang}` },
      { label: t('breadcrumb:products', 'Products'), href: `/${currentLang}/products` },
      { label: localizedCategoryName },
    ]
  }, [currentLang, localizedCategoryName, t])

  return (
    <div className="site-container py-6 lg:py-8 space-y-6 lg:space-y-8">
      <Breadcrumbs items={breadcrumbItems} />

      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {localizedCategoryName || (isLoading ? '...' : currentSlug)}
        </h1>
        {category?.description && (
          <p className="text-muted-foreground text-sm max-w-2xl">
            {category.description}
          </p>
        )}
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card">
          <p className="text-destructive font-medium mb-3">
            {t('common:error', 'An error occurred loading this category.')}
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            {t('common:retry', 'Try again')}
          </Button>
        </div>
      ) : !category || !category.products || category.products.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card space-y-3">
          <PackageOpen className="size-12 text-muted-foreground stroke-1" />
          <h2 className="text-lg font-semibold text-foreground">
            {t('products:noProductsFound', 'No products found')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('products:emptyCategoryDescription', 'There are no active products in this category at the moment.')}
          </p>
          <Button render={<Link to={`/${currentLang}/products`} />} variant="outline">
            {t('products:browseAll', 'Browse all products')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {category.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

