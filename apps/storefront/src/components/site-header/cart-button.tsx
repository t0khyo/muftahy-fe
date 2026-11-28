import * as React from "react"
import { Link, useLocation, useParams } from "react-router"
import { useTranslation } from "react-i18next"
import { KeyRound, ShoppingBag, X } from "lucide-react"
import { formatMoney } from "@workspace/domain/formatters/money"
import {
  getProductThumbnailUrl,
  resolveStorageUrl,
} from "../../features/products/utils/asset-resolver"
import { useProduct } from "../../features/products/hooks/use-products"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@workspace/ui/components/empty"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { CART_CONFIG } from "../../features/cart/cart.config"
import { QuantityStepper } from "../../features/cart/components/quantity-stepper"
import { resolveLocalizedName } from "../../features/cart/lib/cart-selectors"
import type { UnifiedCartItem } from "../../features/cart/hooks/use-cart"
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItemQuantity,
} from "../../features/cart/hooks/use-cart"

interface BagDrawerItemProps {
  item: UnifiedCartItem
  currentLang: string
  onClose: () => void
  onUpdateQuantity: (id: string, qty: number) => void
  onRemove: (id: string) => void
}

function BagDrawerItem({
  item,
  currentLang,
  onClose,
  onUpdateQuantity,
  onRemove,
}: BagDrawerItemProps) {
  const { t } = useTranslation(["header", "products"])
  const { data: product } = useProduct(item.coverImage ? "" : item.product_id)
  const [failedUrl, setFailedUrl] = React.useState<string | null>(null)

  const productName = item.name
    ? resolveLocalizedName(item.name, currentLang) || item.product_name
    : item.product_name
  const lineTotal = formatMoney(item.unit_price * item.quantity, {
    currency: "EGP",
    locale: currentLang,
  })
  const resolvedCover = item.coverImage
    ? resolveStorageUrl(item.coverImage) || item.coverImage
    : null
  const thumbnailUrl = resolvedCover || getProductThumbnailUrl(product)
  const showImage = Boolean(thumbnailUrl && failedUrl !== thumbnailUrl)
  const productSlug = product?.slug || item.slug || item.product_id

  return (
    <div className="flex gap-4 border-b border-border/30 pb-5 last:border-b-0 last:pb-0">
      {/* 4:3 Thumbnail with KeyRound fallback */}
      <div className="flex aspect-[4/3] w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/40 bg-secondary/60 lg:w-24">
        {showImage && thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            onError={() => setFailedUrl(thumbnailUrl)}
            className="size-full object-cover"
          />
        ) : (
          <KeyRound
            className="size-7 text-muted-foreground/80 lg:size-8"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Content Column */}
      <div className="flex min-w-0 flex-1 flex-col justify-between text-start">
        <div className="space-y-0.5">
          <Link
            to={`/${currentLang}/products/${productSlug}`}
            onClick={onClose}
            className="line-clamp-2 text-[15px] leading-snug font-semibold text-foreground transition-colors hover:text-primary"
          >
            {productName}
          </Link>

          {item.variant && (
            <div className="text-[12px] font-medium text-muted-foreground uppercase">
              {item.variant}
            </div>
          )}
          {item.is_preorder && (
            <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
              {t("stock.preorder", {
                ns: "products",
                defaultValue: "Preorder",
              })}
            </div>
          )}
        </div>

        {/* Interactive Quantity Stepper + Remove Link */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <QuantityStepper
            size="sm"
            quantity={item.quantity}
            min={1}
            decreaseLabel={t("decreaseQuantity", {
              ns: "header",
              defaultValue: "Decrease quantity",
            })}
            increaseLabel={t("increaseQuantity", {
              ns: "header",
              defaultValue: "Increase quantity",
            })}
            quantityLabel={`${t("quantity", { ns: "header", defaultValue: "Quantity" })}: ${item.quantity}`}
            onDecrease={() => onUpdateQuantity(item.id, item.quantity - 1)}
            onIncrease={() => onUpdateQuantity(item.id, item.quantity + 1)}
          />

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="cursor-pointer text-xs text-muted-foreground underline decoration-border/60 underline-offset-4 transition-colors hover:text-destructive hover:decoration-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            {t("remove", { ns: "header", defaultValue: "Remove" })}
          </button>
        </div>
      </div>

      {/* End Price Column */}
      <div className="shrink-0 pt-0.5 text-end">
        <span className="text-[15px] font-semibold text-foreground tabular-nums">
          {lineTotal}
        </span>
      </div>
    </div>
  )
}

export interface CartButtonProps {
  className?: string
  isOpen?: boolean
  onToggle?: () => void
  onClose?: () => void
}

export function CartButton({
  className = "",
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  onClose: controlledOnClose,
}: CartButtonProps) {
  const { lang } = useParams<{ lang: string }>()
  const currentLang = lang || "en"
  const location = useLocation()
  const { t, i18n } = useTranslation(["header", "cart", "common"])
  const isRtl = currentLang === "ar" || i18n.dir() === "rtl"

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

  // Unified Cart hooks
  const cart = useCart()
  const { mutate: removeItemMutation } = useRemoveCartItem()
  const { mutate: updateQuantityMutation } = useUpdateCartItemQuantity()
  const items = cart.items
  const count = cart.item_count

  // Pulse animation on count increase
  const [isPulsing, setIsPulsing] = React.useState(false)
  const prevCountRef = React.useRef(count)

  React.useEffect(() => {
    if (count > prevCountRef.current) {
      setIsPulsing(true)
      const timer = setTimeout(() => setIsPulsing(false), 500)
      return () => clearTimeout(timer)
    }
    prevCountRef.current = count
  }, [count])

  // Polite live region status announcement
  const [liveAnnouncement, setLiveAnnouncement] = React.useState("")

  // Trigger ref for focus return
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)

  const formattedSubtotal = React.useMemo(() => {
    return formatMoney(cart.subtotal_egp, {
      currency: "EGP",
      locale: currentLang,
    })
  }, [cart.subtotal_egp, currentLang])

  // Close panel on route change
  const prevLocationRef = React.useRef(location.pathname + location.search)
  React.useEffect(() => {
    if (prevLocationRef.current !== location.pathname + location.search) {
      prevLocationRef.current = location.pathname + location.search
      if (isOpen) {
        requestAnimationFrame(() => {
          handleClose()
        })
      }
    }
  }, [location.pathname, location.search, isOpen, handleClose])

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        handleClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, handleClose])

  const handleRemove = (id: string) => {
    removeItemMutation(id)
    setLiveAnnouncement(
      t("itemRemoved", { ns: "header", defaultValue: "Item removed" })
    )
  }

  const handleUpdateQuantity = (id: string, quantity: number) => {
    updateQuantityMutation({ itemId: id, quantity })
    setLiveAnnouncement(
      t("quantityUpdated", { ns: "header", defaultValue: "Quantity updated" })
    )
  }

  const ariaLabel =
    count === 0
      ? t("cartEmpty", { ns: "header", defaultValue: "Cart is empty" })
      : t("cartAria", {
          ns: "header",
          count,
          defaultValue: `Cart, ${count} items`,
        })

  const badgeText = count > 9 ? "9+" : String(count)

  const itemsCountText = t("items", {
    ns: "header",
    count,
    defaultValue: `${count} items`,
  })

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
        aria-controls="cart-panel"
        className={`relative inline-flex h-11 w-11 cursor-pointer items-center justify-center text-foreground/80 transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none lg:h-11 lg:w-9 ${className}`}
      >
        <svg
          aria-hidden="true"
          className={`h-[17px] w-[17px] shrink-0 transition-transform duration-200 ${
            isPulsing ? "scale-110 text-primary" : ""
          }`}
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

        {count > 0 && (
          <span
            aria-hidden="true"
            className={`absolute end-1 top-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-foreground px-0.5 text-[10px] leading-none font-bold text-background tabular-nums transition-all duration-200 ${
              isPulsing ? "scale-125 bg-primary text-primary-foreground" : ""
            }`}
          >
            {badgeText}
          </span>
        )}
      </button>

      {/* ── Slide-Over Panel (End side, 420px desktop, full width/height mobile) ── */}
      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleClose()
          }
        }}
      >
        <SheetContent
          id="cart-panel"
          side={isRtl ? "left" : "right"}
          showCloseButton={false}
          className="flex h-full !w-full !max-w-full flex-col justify-between gap-0 border-s border-border/40 bg-background p-0 text-foreground shadow-2xl sm:!w-[620px] sm:!max-w-[620px]"
          aria-label={t("bag", { ns: "header", defaultValue: "Bag" })}
        >
          {/* 1 ── Header: "Bag" + count at start, Close X at end */}
          <SheetHeader className="flex h-14 shrink-0 flex-row items-center justify-between border-b border-border/40 px-5 lg:h-16 lg:px-6">
            <div className="flex items-baseline gap-2">
              <SheetTitle className="text-lg font-semibold tracking-tight text-foreground lg:text-xl">
                {t("bag", { ns: "header", defaultValue: "Bag" })}
              </SheetTitle>
              {count > 0 && (
                <span className="text-xs font-normal text-muted-foreground tabular-nums sm:text-sm">
                  ({itemsCountText})
                </span>
              )}
            </div>

            <SheetClose
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 cursor-pointer rounded-full text-muted-foreground transition-transform hover:text-foreground active:scale-95"
                  aria-label={t("close", {
                    ns: "header",
                    defaultValue: "Close",
                  })}
                />
              }
            >
              <X className="size-4" aria-hidden="true" />
            </SheetClose>
          </SheetHeader>

          {/* 2 ── Body: Scrollable Item List OR Empty State */}
          {items.length === 0 ? (
            /* Empty State (no footer) */
            <Empty className="flex flex-1 flex-col items-center justify-center border-none px-6 py-12 text-center">
              <EmptyHeader>
                <EmptyMedia
                  variant="icon"
                  className="mb-2 size-16 rounded-2xl border border-border/40 bg-secondary/60"
                >
                  <ShoppingBag
                    className="size-8 text-muted-foreground"
                    aria-hidden="true"
                  />
                </EmptyMedia>

                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {t("nothingSelectedYet", {
                    ns: "header",
                    defaultValue: "Nothing selected yet",
                  })}
                </span>

                <EmptyTitle className="text-[26px] leading-tight font-semibold text-foreground lg:text-[28px]">
                  <h2>
                    {t("yourBagIsEmpty", {
                      ns: "header",
                      defaultValue: "Your bag is empty",
                    })}
                  </h2>
                </EmptyTitle>

                <EmptyDescription className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {t("findNext", {
                    ns: "header",
                    defaultValue:
                      "Find your next game, license, or subscription.",
                  })}
                </EmptyDescription>
              </EmptyHeader>

              <EmptyContent className="flex w-full max-w-[280px] flex-col items-center gap-2.5 pt-4">
                <Button
                  nativeButton={false}
                  render={
                    <Link
                      to={`/${currentLang}/products`}
                      onClick={handleClose}
                    />
                  }
                  variant="default"
                  className="h-12 w-full rounded-full text-sm font-medium transition-transform active:scale-[0.98]"
                >
                  {t("exploreProducts", {
                    ns: "header",
                    defaultValue: "Explore products",
                  })}
                </Button>

                <Button
                  nativeButton={false}
                  render={
                    <Link
                      to={`/${currentLang}${CART_CONFIG.bundlesHash}`}
                      onClick={handleClose}
                    />
                  }
                  variant="outline"
                  className="h-12 w-full rounded-full border-border/80 text-sm font-medium transition-transform hover:bg-secondary/60 active:scale-[0.98]"
                >
                  {t("browseBundles", {
                    ns: "header",
                    defaultValue: "Browse bundles",
                  })}
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            /* Populated Scrollable List (only this scrolls) */
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4 lg:px-6">
              {items.map((item) => (
                <BagDrawerItem
                  key={item.id}
                  item={item}
                  currentLang={currentLang}
                  onClose={handleClose}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}

          {/* 3 ── Sticky Footer (Items > 0 only) */}
          {items.length > 0 && (
            <div className="shrink-0 space-y-4 border-t border-border/40 bg-background p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] lg:p-6">
              {/* Total Row */}
              <div className="flex items-center justify-between text-start">
                <span className="text-sm font-normal text-muted-foreground">
                  {t("total", { ns: "header", defaultValue: "Total" })}
                </span>
                <span className="text-lg font-semibold text-foreground tabular-nums">
                  {formattedSubtotal}
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {/* 48px Primary Pill Checkout */}
                <Button
                  nativeButton={false}
                  render={
                    <Link
                      to={`/${currentLang}/checkout`}
                      onClick={handleClose}
                    />
                  }
                  variant="default"
                  className="h-12 w-full rounded-full text-sm font-medium transition-transform active:scale-[0.98]"
                >
                  {t("checkout", { ns: "header", defaultValue: "Checkout" })}
                </Button>

                {/* 44px Underlined Ghost "View full bag" */}
                <Button
                  nativeButton={false}
                  render={
                    <Link to={`/${currentLang}/cart`} onClick={handleClose} />
                  }
                  variant="ghost"
                  className="min-h-[44px] w-full text-center text-sm text-muted-foreground underline decoration-border/60 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
                >
                  {t("viewFullBag", {
                    ns: "header",
                    defaultValue: "View full bag",
                  })}
                </Button>
              </div>
            </div>
          )}

          {/* Polite live region for screen reader updates */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {liveAnnouncement}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
