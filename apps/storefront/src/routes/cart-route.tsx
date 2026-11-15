import { useTranslation } from 'react-i18next'
import { useCartStore } from '../features/cart/stores/cart-store'

export function CartRoute() {
  const { t } = useTranslation(['cart', 'common'])
  const count = useCartStore((s) => s.count)

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6">
      <div className="space-y-4 text-start">
        <h1 className="font-heading text-heading font-bold text-foreground">
          {t('title', { ns: 'cart' })}
        </h1>
        <p className="text-body text-muted-foreground">
          {count === 0 ? t('empty', { ns: 'cart' }) : `Items in cart: ${count}`}
        </p>
      </div>
    </div>
  )
}

