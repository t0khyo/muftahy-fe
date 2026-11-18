import * as React from 'react'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ShoppingBag } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { useCartStore } from '../features/cart/stores/cart-store'
import { CartLineItem } from '../features/cart/components/cart-line-item'
import { getCurrencySubtotals } from '../features/cart/lib/cart-selectors'

export function CartRoute() {
  const { lang = 'ar' } = useParams<{ lang: string }>()
  const { t } = useTranslation(['cart', 'common'])
  const items = useCartStore((s) => s.items)
  const count = useCartStore((s) => s.count)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)

  const emptyBrowseRef = React.useRef<HTMLAnchorElement | null>(null)
  const removeRefs = React.useRef<Map<string, HTMLButtonElement | null>>(new Map())
  const itemIds = React.useMemo(() => items.map((i) => i.id), [items])

  const handleRemove = React.useCallback(
    (id: string) => {
      const index = itemIds.indexOf(id)
      const nextId = itemIds[index + 1]
      const prevId = itemIds[index - 1]

      removeItem(id)

      // Focus handoff
      requestAnimationFrame(() => {
        if (nextId && removeRefs.current.get(nextId)) {
          removeRefs.current.get(nextId)?.focus()
        } else if (prevId && removeRefs.current.get(prevId)) {
          removeRefs.current.get(prevId)?.focus()
        } else {
          emptyBrowseRef.current?.focus()
        }
      })
    },
    [itemIds, removeItem],
  )

  const currencySubtotals = React.useMemo(() => {
    return getCurrencySubtotals(items, lang)
  }, [items, lang])

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="space-y-6">
        {/* Page Title */}
        <div className="space-y-1 text-start">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {count === 0
              ? t('empty')
              : `${count} ${count === 1 ? t('item') : t('title')}`}
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border bg-card/50">
            <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
              <ShoppingBag className="size-7" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              {t('empty')}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {lang === 'ar'
                ? 'استكشف مكتبتنا من الألعاب الأصلية واشتراكات البرامج والبطاقات الرقمية.'
                : 'Explore our catalog of digital game keys, software licenses, and gift cards.'}
            </p>
            <Button
              nativeButton={false}
              render={
                <Link
                  ref={emptyBrowseRef}
                  to={`/${lang}/products`}
                />
              }
              className="h-10 px-6 rounded-xl font-medium"
            >
              {t('browseProducts')}
            </Button>
          </div>
        ) : (
          /* Cart List & Summary */
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs">
              <ul className="divide-y divide-border/40" aria-label={t('title')}>
                {items.map((item) => (
                  <CartLineItem
                    key={item.id}
                    item={item}
                    lang={lang}
                    onUpdateQuantity={updateQuantity}
                    onRemove={handleRemove}
                    removeButtonRef={(el) => {
                      if (el) {
                        removeRefs.current.set(item.id, el)
                      } else {
                        removeRefs.current.delete(item.id)
                      }
                    }}
                  />
                ))}
              </ul>
            </div>

            {/* Subtotals & Actions */}
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs">
              <div className="space-y-3">
                <div className="text-sm font-semibold text-foreground">
                  {t('subtotal')}
                </div>
                <div className="space-y-2 border-t border-border/40 pt-3">
                  {currencySubtotals.map((sub) => (
                    <div
                      key={sub.currency}
                      className="flex items-center justify-between text-base"
                    >
                      <span className="text-muted-foreground">
                        {sub.currency}
                      </span>
                      <span className="font-semibold text-foreground tabular-nums">
                        {sub.formatted}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
