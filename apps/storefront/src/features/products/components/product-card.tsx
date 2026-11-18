import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { cn } from '@workspace/ui/lib/utils';
import { getSummaryPlan, type Product } from '@workspace/domain/schemas/product';
import { useCartStore } from '../../cart/stores/cart-store';
import { Box } from 'lucide-react';
import { AddToCartButton } from './add-to-cart-button';
import { formatPrice } from './utils';
import type {
  Platform,
  ProductCardData,
  ProductCardPlan,
  ProductCardTranslations,
} from './types';

// ─── Sub-components ───────────────────────────────────────────────────────────

interface BadgePillProps {
  label: string;
  isDiscount?: boolean;
}

function BadgePill({ label, isDiscount = false }: BadgePillProps) {
  return (
    <span
      className={cn(
        'absolute start-2.5 top-2.5 z-10',
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
        'text-[10px] font-semibold leading-none',
        isDiscount
          ? 'bg-discount text-discount-foreground'
          : 'bg-background/90 text-foreground backdrop-blur-xs shadow-xs'
      )}
    >
      {label}
    </span>
  );
}

// ─── Main Product Card ────────────────────────────────────────────────────────

export interface BaseProductCardProps {
  locale?: string;
  translations?: ProductCardTranslations;
  priority?: boolean;
  className?: string;
  renderLink?: (props: {
    href: string;
    className: string;
    children: React.ReactNode;
  }) => React.ReactNode;
  renderImage?: (props: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className: string;
    priority?: boolean;
  }) => React.ReactNode;
}

export type ProductCardProps = BaseProductCardProps &
  (
    | {
        card: ProductCardData;
        product?: never;
        onAddToCart?: (plan: ProductCardPlan) => void;
      }
    | {
        product: Product;
        card?: never;
        onAddToCart?: (product: Product) => void;
      }
  );

export function ProductCard(props: ProductCardProps) {
  const { t, i18n } = useTranslation(['products', 'common']);
  const currentLang = props.locale ?? (i18n.language === 'ar' ? 'ar' : 'en');
  const isRtl = currentLang === 'ar';

  // Support both `card` (template format) and `product` (domain model)
  const isDomainProduct = 'product' in props && Boolean(props.product);
  const domainProduct = isDomainProduct ? props.product : null;

  const card: ProductCardData = React.useMemo(() => {
    if (domainProduct) {
      const p = domainProduct;
      const summaryPlan = getSummaryPlan(p);
      const title = p.title[isRtl ? 'ar' : 'en'] ?? p.title.en;
      const desc = p.description[isRtl ? 'ar' : 'en'] ?? p.description.en;
      const priceNum = (summaryPlan.price.amountMinor / 100).toFixed(2);
      const originalPriceNum = summaryPlan.originalPrice
        ? (summaryPlan.originalPrice.amountMinor / 100).toFixed(2)
        : undefined;

      const platformsMap: Platform[] =
        p.platform === 'steam'
          ? ['windows', 'mac']
          : p.platform === 'microsoft' || p.platform === 'pc'
            ? ['windows']
            : ['web'];

      return {
        slug: p.slug,
        name: title,
        imageUrl: p.coverImage,
        imageAlt: title,
        badge: p.featured ? 'offer' : null,
        productType: p.category === 'subscriptions' ? 'subscription' : 'service',
        activationType: 'ready_account',
        platforms: platformsMap,
        startingPrice: priceNum,
        originalPrice: originalPriceNum,
        startingPlanDuration:
          summaryPlan.deliveryType === 'instant'
            ? (isRtl ? 'تسليم فوري' : 'Instant')
            : (isRtl ? 'شهر' : 'month'),
        startingPlanDurationEn: summaryPlan.deliveryType === 'instant' ? 'Instant' : 'month',
        trustNote: desc || (isRtl ? 'ضمان التسليم الفوري' : 'Instant Delivery Guaranteed'),
        plans: [
          {
            id: summaryPlan.id,
            label: summaryPlan.name[isRtl ? 'ar' : 'en'] ?? summaryPlan.name.en,
            duration:
              summaryPlan.deliveryType === 'instant'
                ? (isRtl ? 'ترخيص فوري' : 'Instant License')
                : (isRtl ? 'اشتراك' : 'Subscription'),
            price: priceNum,
            activationType: 'ready_account',
          },
        ],
      };
    }
    const c = props.card!;
    if (isRtl && c.nameAr) {
      return { ...c, name: c.nameAr };
    }
    return c;
  }, [domainProduct, props.card, isRtl]);

  const isInStock = domainProduct ? domainProduct.inStock : true;

  // Platform and Region Meta line
  const metaText = React.useMemo(() => {
    if (domainProduct) {
      const platformKey = `platform${domainProduct.platform.charAt(0).toUpperCase() + domainProduct.platform.slice(1)}`;
      const regionKey = `region${domainProduct.region.charAt(0).toUpperCase() + domainProduct.region.slice(1)}`;
      const platformLabel = t(platformKey, { defaultValue: domainProduct.platform });
      const regionLabel = t(regionKey, { defaultValue: domainProduct.region });
      return [platformLabel, regionLabel].filter(Boolean).join(' • ');
    }
    if (card.platforms && card.platforms.length > 0) {
      return card.platforms.map((p) => p.toUpperCase()).join(' • ');
    }
    return null;
  }, [domainProduct, card.platforms, t]);

  // Badge label
  const badgeLabels: Record<string, string> = {
    warranty: props.translations?.badge?.warranty ?? (isRtl ? 'ضمان' : 'Warranty'),
    offer: props.translations?.badge?.offer ?? (isRtl ? 'عرض خاص' : 'Special Offer'),
    new: props.translations?.badge?.new ?? (isRtl ? 'جديد' : 'New'),
  };
  const badgeLabel = card.badge ? badgeLabels[card.badge] : null;

  // Discount calculation
  const discountPercent = React.useMemo(() => {
    if (domainProduct?.originalPrice && domainProduct.originalPrice.amountMinor > domainProduct.price.amountMinor) {
      const orig = domainProduct.originalPrice.amountMinor;
      const current = domainProduct.price.amountMinor;
      return Math.round(((orig - current) / orig) * 100);
    }
    if (card.originalPrice && parseFloat(card.originalPrice) > parseFloat(card.startingPrice)) {
      const orig = parseFloat(card.originalPrice);
      const current = parseFloat(card.startingPrice);
      return Math.round(((orig - current) / orig) * 100);
    }
    return null;
  }, [domainProduct, card.originalPrice, card.startingPrice]);

  const hasMultiplePrices = Boolean(
    domainProduct &&
      domainProduct.plans &&
      domainProduct.plans.length > 1 &&
      new Set(domainProduct.plans.map((p) => p.price.amountMinor)).size > 1
  );

  const defaultCurrency = domainProduct
    ? (domainProduct.price.currency === 'USD' ? '$' : (isRtl ? 'ج.م' : domainProduct.price.currency))
    : (isRtl ? 'ج.م' : '$');
  const currency = props.translations?.currency ?? defaultCurrency;
  const fromPriceText = props.translations?.startingFrom ?? t('fromPrice', { ns: 'products', defaultValue: isRtl ? 'يبدأ من' : 'From' });

  const addToCartLabel = !isInStock
    ? t('outOfStock', { ns: 'products', defaultValue: isRtl ? 'نفدت الكمية' : 'Out of stock' })
    : (props.translations?.addToCart ?? t('addToCart', { ns: 'products', defaultValue: isRtl ? 'أضف إلى السلة' : 'Add to cart' }));
  const addedLabel = props.translations?.addedToCart ?? (isRtl ? 'تمت الإضافة' : 'Added!');

  const resolvedSummaryPlan = domainProduct ? getSummaryPlan(domainProduct) : null;
  const productUrl = domainProduct && resolvedSummaryPlan
    ? `/${currentLang}/products/${card.slug}?plan=${resolvedSummaryPlan.slug}`
    : `/${currentLang}/products/${card.slug}`;
  const [prevImageUrl, setPrevImageUrl] = React.useState(card.imageUrl);
  const [imageError, setImageError] = React.useState(false);

  if (prevImageUrl !== card.imageUrl) {
    setPrevImageUrl(card.imageUrl);
    setImageError(false);
  }

  const hasImage = Boolean(card.imageUrl) && !imageError;

  const handleAddToCart = (plan: ProductCardPlan) => {
    if ('product' in props && props.product) {
      if (props.onAddToCart) {
        props.onAddToCart(props.product);
      } else {
        const summary = getSummaryPlan(props.product);
        useCartStore.getState().addItem({
          id: `${props.product.id}:${summary.id}`,
          productId: props.product.id,
          planId: summary.id,
          slug: props.product.slug,
          name: props.product.title,
          planName: summary.name,
          priceMinor: summary.price.amountMinor,
          currency: summary.price.currency,
          platform: props.product.platform,
          region: props.product.region,
          coverImage: props.product.coverImage,
        });
      }
    } else if ('card' in props && props.card) {
      if (props.onAddToCart) {
        props.onAddToCart(plan);
      }
    }
  };

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl',
        'bg-card border border-border/40 hover:border-border/80 text-card-foreground',
        'p-3 sm:p-3.5 lg:p-4 h-full',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        !isInStock && 'opacity-70',
        props.className
      )}
    >
      {/* 1 ── Cover Area (4:3, prominent whole-artwork surface, never cropped) */}
      <div className='relative aspect-4/3 w-full rounded-xl bg-secondary/35 p-4 sm:p-5 flex items-center justify-center overflow-hidden'>
        {hasImage && card.imageUrl ? (
          props.renderImage ? (
            props.renderImage({
              src: card.imageUrl,
              alt: card.imageAlt || card.name,
              width: 640,
              height: 480,
              className: 'h-full w-full object-contain transition-transform duration-300 ease-out lg:group-hover:scale-[1.03] motion-reduce:transform-none',
              priority: props.priority,
            })
          ) : (
            <img
              src={card.imageUrl}
              alt={card.imageAlt || card.name}
              width={640}
              height={480}
              loading={props.priority ? 'eager' : 'lazy'}
              decoding='async'
              onError={() => setImageError(true)}
              className='h-full w-full object-contain transition-transform duration-300 ease-out lg:group-hover:scale-[1.03] motion-reduce:transform-none'
            />
          )
        ) : (
          <div
            role='img'
            aria-label={card.imageAlt || card.name}
            className='flex items-center justify-center transition-transform duration-300 ease-out lg:group-hover:scale-[1.03] motion-reduce:transform-none'
          >
            <Box className='size-12 sm:size-14 text-primary' aria-hidden='true' />
          </div>
        )}

        {/* Optional Label / Badge */}
        {discountPercent ? (
          <BadgePill label={`-${discountPercent}%`} isDiscount />
        ) : badgeLabel ? (
          <BadgePill label={badgeLabel} />
        ) : null}
      </div>

      {/* 2 ── Optional Meta Line (Platform / Region) */}
      {metaText && (
        <div className='text-xs text-muted-foreground truncate pt-2.5 text-start font-normal leading-none'>
          {metaText}
        </div>
      )}

      {/* 3 ── Title (2 lines max, 14/15/16px) */}
      <h2 className='text-sm sm:text-[15px] lg:text-base font-medium line-clamp-2 leading-snug pt-1 text-start'>
        {props.renderLink ? (
          props.renderLink({
            href: productUrl,
            className: cn(
              'text-foreground outline-none',
              'after:absolute after:inset-0 after:z-0 after:content-[""]',
              'focus-visible:underline hover:text-primary transition-colors'
            ),
            children: card.name,
          })
        ) : (
          <Link
            to={productUrl}
            className={cn(
              'text-foreground outline-none',
              'after:absolute after:inset-0 after:z-0 after:content-[""]',
              'focus-visible:underline hover:text-primary transition-colors'
            )}
          >
            {card.name}
          </Link>
        )}
      </h2>

      {/* 4 ── Bottom Stack Pinned to Bottom: Price, Delivery, Pill Button */}
      <div className='mt-auto flex flex-col gap-2.5 pt-3'>
        {/* Price Row: Calm regular-weight "From X" */}
        <div className='flex items-baseline gap-1.5 flex-wrap text-start leading-none'>
          {hasMultiplePrices && (
            <span className='text-xs text-muted-foreground font-normal'>{fromPriceText}</span>
          )}
          <span className='text-[15px] sm:text-base font-normal text-foreground tabular-nums'>
            {formatPrice(card.startingPrice, currentLang)} {currency}
          </span>
          {card.originalPrice && parseFloat(card.originalPrice) > parseFloat(card.startingPrice) && (
            <span className='text-xs text-muted-foreground line-through tabular-nums'>
              {formatPrice(card.originalPrice, currentLang)}
            </span>
          )}
        </div>

        {/* Add to Cart Pill Button (44/44/40 px) */}
        <AddToCartButton
          productName={card.name}
          plans={card.plans}
          locale={currentLang}
          currency={currency}
          label={addToCartLabel}
          addedLabel={addedLabel}
          disabled={!isInStock}
          choosePlanTitle={props.translations?.choosePlan ?? (isRtl ? 'اختر خطة' : 'Choose a plan')}
          choosePlanSubtitle={
            props.translations?.choosePlanSubtitle ??
            (isRtl ? 'حدد المدة الأنسب لاحتياجاتك' : 'Select the duration that best suits your needs')
          }
          activationPersonalInviteLabel={
            props.translations?.activation?.personalInvite ?? (isRtl ? 'دعوة شخصية' : 'Personal Invite')
          }
          activationReadyAccountLabel={
            props.translations?.activation?.readyAccount ?? (isRtl ? 'حساب جاهز' : 'Ready Account')
          }
          onAddToCart={handleAddToCart}
        />
      </div>
    </article>
  );
}
