import { useTranslation } from 'react-i18next'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { formatMoneyFromMinor } from '@workspace/domain/formatters/money'
import type { Product } from '@workspace/domain/schemas/product'

export interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { t, i18n } = useTranslation(['products', 'common'])
  const currentLang = i18n.language === 'ar' ? 'ar' : 'en'

  const title = product.title[currentLang] ?? product.title.en
  const description = product.description[currentLang] ?? product.description.en
  const formattedPrice = formatMoneyFromMinor(
    product.price.amountMinor,
    product.price.currency,
    currentLang,
  )

  const formattedOriginalPrice = product.originalPrice
    ? formatMoneyFromMinor(
        product.originalPrice.amountMinor,
        product.originalPrice.currency,
        currentLang,
      )
    : null

  return (
    <Card className="flex flex-col justify-between transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 pb-2">
          <Badge variant="outline" className="text-xs uppercase">
            {product.platform}
          </Badge>
          <Badge
            variant={product.deliveryType === 'instant' ? 'secondary' : 'outline'}
            className="text-xs"
          >
            {product.deliveryType === 'instant'
              ? t('instantDelivery', { ns: 'products' })
              : product.deliveryType}
          </Badge>
        </div>
        <CardTitle className="line-clamp-2 text-start">{title}</CardTitle>
        <CardDescription className="line-clamp-3 text-start">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-xl font-bold text-foreground">
            {formattedPrice}
          </span>
          {formattedOriginalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formattedOriginalPrice}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Button
          className="w-full"
          disabled={!product.inStock}
          onClick={() => onAddToCart?.(product)}
        >
          {product.inStock
            ? t('addToCart', { ns: 'products' })
            : t('outOfStock', { ns: 'products' })}
        </Button>
      </CardFooter>
    </Card>
  )
}

