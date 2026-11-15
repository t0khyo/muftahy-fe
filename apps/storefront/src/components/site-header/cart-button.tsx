import * as React from 'react'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { formatMoneyFromMinor } from '@workspace/domain/formatters/money'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@workspace/ui/components/sheet'
import { useCartStore } from '../../features/cart/stores/cart-store'

export interface CartButtonProps {
  className?: string
  isOpen?: boolean
  onToggle?: () => void
  onClose?: () => void
}

export function CartButton({
  className = '',
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  onClose: controlledOnClose,
}: CartButtonProps) {
  const { lang } = useParams<{ lang: string }>()
  const currentLang = lang || 'en'
  const { t, i18n } = useTranslation(['header', 'nav', 'common'])
  const isRtl = currentLang === 'ar' || i18n.dir() === 'rtl'

  // Internal open state if uncontrolled
  const [internalIsOpen, setInternalIsOpen] = React.useState(false)
  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen

  const handleToggle = () => {
    if (isControlled) {
      controlledOnToggle?.()
    } else {
      setInternalIsOpen((prev) => !prev)
    }
  }

  const handleClose = React.useCallback(() => {
    if (isControlled) {
      controlledOnClose?.()
    } else {
      setInternalIsOpen(false)
    }
  }, [isControlled, controlledOnClose])

  const items = useCartStore((s) => s.items)
  const count = useCartStore((s) => s.count)

  const dropdownRef = React.useRef<HTMLDivElement | null>(null)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)

  // Subtotal in minor units
  const subtotalMinor = React.useMemo(() => {
    return items.reduce((acc, item) => acc + item.priceMinor * item.quantity, 0)
  }, [items])

  const formattedSubtotal = React.useMemo(() => {
    return formatMoneyFromMinor(subtotalMinor, 'USD', currentLang)
  }, [subtotalMinor, currentLang])

  // Close desktop dropdown on outside click or Escape
  React.useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node | null
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        handleClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleClose])

  const ariaLabel =
    count === 0
      ? t('cartEmpty', { ns: 'header' })
      : t('cartAria', { ns: 'header', count })

  const badgeText = count > 9 ? '9+' : String(count)

  return (
    <div className="relative inline-flex items-center">
      {/* ── Cart Trigger Button (Shopping Bag) ── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`cursor-pointer relative inline-flex items-center justify-center text-foreground/80 transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-11 w-11 lg:h-11 lg:w-9 ${className}`}
      >
        {/* 17px Shopping Bag Icon, stroke-width 1.5 */}
        <svg
          aria-hidden="true"
          className="h-[17px] w-[17px] shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>

        {/* Neutral Badge (14px circle, top-end) */}
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute end-1 top-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-foreground px-0.5 text-[10px] font-bold leading-none text-background tabular-nums"
          >
            {badgeText}
          </span>
        )}
      </button>

      {/* ── Desktop Apple-Style Dropdown Menu (lg and up) ── */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="dialog"
          aria-label={t('yourBag', { ns: 'header' })}
          className="hidden lg:block absolute end-0 top-[calc(100%+8px)] w-[340px] z-50 rounded-2xl header-glass border border-border/40 shadow-2xl p-5 text-start animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Top arrow caret pointing to bag icon */}
          <div
            aria-hidden="true"
            className="absolute -top-1.5 end-3 h-3 w-3 rotate-45 border-t border-l border-border/40 bg-background/90"
          />

          {items.length === 0 ? (
            /* Empty State */
            <div className="py-2 space-y-4">
              <p className="text-lg font-semibold text-foreground tracking-tight text-center">
                {t('bagEmpty', { ns: 'header' })}
              </p>

              <Link
                to={`/${currentLang}/cart`}
                onClick={handleClose}
                className="w-full flex items-center justify-center py-2 px-4 rounded-xl text-xs font-medium border border-border/60 hover:bg-secondary/60 text-foreground transition-colors"
              >
                {t('reviewBag', { ns: 'header' })}
              </Link>

              <div className="border-t border-border/40 my-3" />

              {/* Quick Profile / Order Links */}
              <ul className="space-y-1 text-xs">
                <li>
                  <Link
                    to={`/${currentLang}/account/saved`}
                    onClick={handleClose}
                    className="flex items-center justify-between py-2 px-1 text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <span>{t('savedItems', { ns: 'header' })}</span>
                    <svg
                      aria-hidden="true"
                      className="h-3 w-3 text-muted-foreground group-hover:text-foreground rtl:rotate-180"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${currentLang}/account/orders`}
                    onClick={handleClose}
                    className="flex items-center justify-between py-2 px-1 text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <span>{t('orders', { ns: 'header' })}</span>
                    <svg
                      aria-hidden="true"
                      className="h-3 w-3 text-muted-foreground group-hover:text-foreground rtl:rotate-180"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${currentLang}/account`}
                    onClick={handleClose}
                    className="flex items-center justify-between py-2 px-1 text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <span>{t('account', { ns: 'header' })}</span>
                    <svg
                      aria-hidden="true"
                      className="h-3 w-3 text-muted-foreground group-hover:text-foreground rtl:rotate-180"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </li>
              </ul>
            </div>
          ) : (
            /* Populated State */
            <div className="space-y-3">
              <div className="max-h-60 overflow-y-auto space-y-2 pe-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-border/20 last:border-b-0 text-xs"
                  >
                    <div className="truncate me-2">
                      <span className="font-medium text-foreground block truncate">
                        {item.name}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        Qty: {item.quantity}
                      </span>
                    </div>
                    <span className="shrink-0 font-medium text-foreground tabular-nums">
                      {formatMoneyFromMinor(
                        item.priceMinor * item.quantity,
                        'USD',
                        currentLang,
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotal */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs font-semibold">
                <span className="text-muted-foreground">{t('subtotal', { ns: 'header' })}</span>
                <span className="text-foreground tabular-nums">{formattedSubtotal}</span>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <Link
                  to={`/${currentLang}/cart`}
                  onClick={handleClose}
                  className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                >
                  {t('checkOut', { ns: 'header' })}
                </Link>
                <Link
                  to={`/${currentLang}/cart`}
                  onClick={handleClose}
                  className="w-full flex items-center justify-center py-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('reviewBag', { ns: 'header' })}
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Mobile Full shadcn Sheet (below lg) ── */}
      <div className="lg:hidden">
        <Sheet
          open={isOpen}
          onOpenChange={(open) => {
            if (!open) handleClose()
          }}
        >
          <SheetContent
            side={isRtl ? 'left' : 'right'}
            className="w-full sm:max-w-md header-glass flex flex-col justify-between"
          >
            <div>
              <SheetHeader>
                <SheetTitle className="text-lg font-semibold text-foreground">
                  {t('yourBag', { ns: 'header' })}
                </SheetTitle>
              </SheetHeader>

              <div className="px-4 py-4">
                {items.length === 0 ? (
                  <div className="py-8 text-center space-y-4">
                    <p className="text-xl font-semibold text-muted-foreground">
                      {t('bagEmpty', { ns: 'header' })}
                    </p>

                    <div className="border-t border-border/40 my-4" />

                    <ul className="space-y-2 text-start text-sm">
                      <li>
                        <Link
                          to={`/${currentLang}/account/saved`}
                          onClick={handleClose}
                          className="flex items-center justify-between py-2 text-muted-foreground hover:text-foreground transition-colors group"
                        >
                          <span>{t('savedItems', { ns: 'header' })}</span>
                          <svg
                            aria-hidden="true"
                            className="h-4 w-4 text-muted-foreground group-hover:text-foreground rtl:rotate-180"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to={`/${currentLang}/account/orders`}
                          onClick={handleClose}
                          className="flex items-center justify-between py-2 text-muted-foreground hover:text-foreground transition-colors group"
                        >
                          <span>{t('orders', { ns: 'header' })}</span>
                          <svg
                            aria-hidden="true"
                            className="h-4 w-4 text-muted-foreground group-hover:text-foreground rtl:rotate-180"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to={`/${currentLang}/account`}
                          onClick={handleClose}
                          className="flex items-center justify-between py-2 text-muted-foreground hover:text-foreground transition-colors group"
                        >
                          <span>{t('account', { ns: 'header' })}</span>
                          <svg
                            aria-hidden="true"
                            className="h-4 w-4 text-muted-foreground group-hover:text-foreground rtl:rotate-180"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </Link>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="max-h-[50vh] overflow-y-auto space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2 border-b border-border/20 last:border-b-0"
                        >
                          <div className="truncate me-2">
                            <span className="font-medium text-foreground block truncate">
                              {item.name}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              Qty: {item.quantity}
                            </span>
                          </div>
                          <span className="shrink-0 font-medium text-foreground tabular-nums">
                            {formatMoneyFromMinor(
                              item.priceMinor * item.quantity,
                              'USD',
                              currentLang,
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/40 text-sm font-semibold">
                      <span className="text-muted-foreground">{t('subtotal', { ns: 'header' })}</span>
                      <span className="text-foreground tabular-nums">{formattedSubtotal}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <SheetFooter className="border-t border-border/40 p-4 space-y-2">
              <Link
                to={`/${currentLang}/cart`}
                onClick={handleClose}
                className="w-full h-11 flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm"
              >
                {items.length > 0 ? t('checkOut', { ns: 'header' }) : t('reviewBag', { ns: 'header' })}
              </Link>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
