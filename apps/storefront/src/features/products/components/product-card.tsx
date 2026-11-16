import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { cn } from '@workspace/ui/lib/utils';
import type { Product } from '@workspace/domain/schemas/product';
import { useCartStore } from '../../cart/stores/cart-store';
import { AddToCartButton } from './add-to-cart-button';
import {
  IconBox,
  IconCircleCheck,
  IconRefresh,
  IconShield,
  IconSparkles,
  IconTag,
  IconUserCheck,
} from './icons';
import { formatPrice } from './utils';
import type {
  Platform,
  ProductBadge,
  ProductCardData,
  ProductCardPlan,
  ProductCardTranslations,
  ProductType,
} from './types';

// ─── Sub-components ───────────────────────────────────────────────────────────

interface BadgePillProps {
  badge: ProductBadge;
  label: string;
}

function BadgePill({ badge, label }: BadgePillProps) {
  const iconClass = 'h-3 w-3 shrink-0';
  const Icon = badge === 'warranty' ? IconShield : badge === 'offer' ? IconTag : IconSparkles;

  return (
    <span
      aria-label={label}
      className={cn(
        'absolute start-2 top-2 z-10',
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
        'bg-offer-badge-bg text-offer-badge-foreground',
        'text-[10px] font-semibold leading-none ring-1 ring-offer-badge/30'
      )}
    >
      <Icon className={iconClass} />
      {label}
    </span>
  );
}

interface TypeChipProps {
  label: string;
  productType: ProductType;
}

function TypeChip({ label, productType }: TypeChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5',
        'text-[11px] font-medium text-muted-foreground'
      )}
    >
      {productType === 'subscription' ? (
        <IconRefresh className='h-3 w-3 shrink-0' />
      ) : (
        <IconSparkles className='h-3 w-3 shrink-0' />
      )}
      {label}
    </span>
  );
}

interface ActivationChipProps {
  label: string;
}

function ActivationChip({ label }: ActivationChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5',
        'text-[11px] font-medium text-muted-foreground'
      )}
    >
      <IconUserCheck className='h-3 w-3 shrink-0' />
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
      const title = p.title[isRtl ? 'ar' : 'en'] ?? p.title.en;
      const desc = p.description[isRtl ? 'ar' : 'en'] ?? p.description.en;
      const priceNum = (p.price.amountMinor / 100).toFixed(2);

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
        ratingAverage: 4.9,
        ratingCount: 128,
        platforms: platformsMap,
        startingPrice: priceNum,
        startingPlanDuration: p.deliveryType === 'instant' ? (isRtl ? 'تسليم فوري' : 'Instant') : (isRtl ? 'شهر' : 'month'),
        startingPlanDurationEn: p.deliveryType === 'instant' ? 'Instant' : 'month',
        trustNote: desc || (isRtl ? 'ضمان التسليم الفوري' : 'Instant Delivery Guaranteed'),
        plans: [
          {
            id: p.id,
            label: title,
            duration: p.deliveryType === 'instant' ? (isRtl ? 'ترخيص فوري' : 'Instant License') : (isRtl ? 'اشتراك' : 'Subscription'),
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

  // Badge label
  const badgeLabels = {
    warranty: props.translations?.badge?.warranty ?? (isRtl ? 'ضمان' : 'Warranty'),
    offer: props.translations?.badge?.offer ?? (isRtl ? 'عرض خاص' : 'Special Offer'),
    new: props.translations?.badge?.new ?? (isRtl ? 'جديد' : 'New'),
  };
  const badgeLabel = card.badge ? badgeLabels[card.badge] : null;

  // Product type label
  const productType = card.productType ?? 'subscription';
  const productTypeLabel =
    productType === 'subscription'
      ? (props.translations?.type?.subscription ?? (isRtl ? 'اشتراك' : 'Subscription'))
      : (props.translations?.type?.service ?? (isRtl ? 'خدمة' : 'Service'));

  // Activation type label
  const activationType = card.activationType ?? card.plans[0]?.activationType ?? 'personal_invite';
  const activationLabel =
    activationType === 'personal_invite'
      ? (props.translations?.activation?.personalInvite ?? (isRtl ? 'دعوة شخصية' : 'Personal Invite'))
      : (props.translations?.activation?.readyAccount ?? (isRtl ? 'حساب جاهز' : 'Ready Account'));

  const duration = isRtl
    ? card.startingPlanDuration || card.plans[0]?.duration || 'شهر'
    : card.startingPlanDurationEn ||
      card.startingPlanDuration ||
      card.plans[0]?.duration ||
      'month';

  const defaultCurrency = domainProduct
    ? (domainProduct.price.currency === 'USD' ? '$' : (isRtl ? 'ج.م' : domainProduct.price.currency))
    : (isRtl ? 'ج.م' : '$');
  const currency = props.translations?.currency ?? defaultCurrency;
  const startingFrom = props.translations?.startingFrom ?? (isRtl ? 'يبدأ من' : 'Starting from');
  const addToCartLabel = !isInStock
    ? t('outOfStock', { ns: 'products' })
    : (props.translations?.addToCart ?? t('addToCart', { ns: 'products' }));
  const addedLabel = props.translations?.addedToCart ?? (isRtl ? 'تمت الإضافة' : 'Added!');
  const termWarranty =
    props.translations?.termWarranty ?? card.trustNote ?? (isRtl ? 'ضمان المدة' : 'Term Warranty');

  const productUrl = `/${currentLang}/products/${card.slug}`;

  const handleAddToCart = (plan: ProductCardPlan) => {
    if ('product' in props && props.product) {
      if (props.onAddToCart) {
        props.onAddToCart(props.product);
      } else {
        useCartStore.getState().addItem({
          id: props.product.id,
          name: props.product.title[isRtl ? 'ar' : 'en'] ?? props.product.title.en,
          priceMinor: props.product.price.amountMinor,
        });
      }
    } else if ('card' in props && props.card) {
      if (props.onAddToCart) {
        props.onAddToCart(plan);
      } else {
        useCartStore.getState().addItem({
          id: plan.id,
          name: card.name,
          priceMinor: Math.round(parseFloat(plan.price) * 100),
        });
      }
    }
  };

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-3xl',
        'border border-border bg-card p-0 text-card-foreground',
        'shadow-xs transition-[box-shadow,transform] duration-200',
        'hover:-translate-y-0.5 hover:shadow-md',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        props.className
      )}
    >
      {/* 1 ── Image area */}
      <div className='relative flex h-40 items-center justify-center bg-muted rounded-t-3xl overflow-hidden'>
        {card.imageUrl ? (
          props.renderImage ? (
            props.renderImage({
              src: card.imageUrl,
              alt: card.imageAlt || card.name,
              width: 88,
              height: 88,
              className: 'rounded-2xl object-cover',
              priority: props.priority,
            })
          ) : (
            <img
              src={card.imageUrl}
              alt={card.imageAlt || card.name}
              width={88}
              height={88}
              loading={props.priority ? 'eager' : 'lazy'}
              className='h-[88px] w-[88px] rounded-2xl object-cover'
            />
          )
        ) : (
          <IconBox className='h-14 w-14 text-muted-foreground/30' />
        )}

        {/* Badge pill */}
        {card.badge && badgeLabel && <BadgePill badge={card.badge} label={badgeLabel} />}
      </div>

      {/* 2 ── Card body */}
      <div className='flex flex-1 flex-col gap-3 p-4'>
        {/* Chips row */}
        <div className='flex flex-wrap items-center gap-1.5'>
          <TypeChip label={productTypeLabel} productType={productType} />
          <ActivationChip label={activationLabel} />
        </div>

        {/* Product name — stretched link anchor */}
        <h2 className='text-[18px] font-semibold leading-snug min-h-[2.75rem] line-clamp-2 text-start'>
          {props.renderLink ? (
            props.renderLink({
              href: productUrl,
              className: cn(
                'text-foreground outline-none',
                'after:absolute after:inset-0 after:z-0 after:content-[""]',
                'focus-visible:underline hover:text-primary'
              ),
              children: card.name,
            })
          ) : (
            <Link
              to={productUrl}
              className={cn(
                'text-foreground outline-none',
                'after:absolute after:inset-0 after:z-0 after:content-[""]',
                'focus-visible:underline hover:text-primary'
              )}
            >
              {card.name}
            </Link>
          )}
        </h2>

        {/* Spacer to push price + button to bottom */}
        <div className='mt-auto flex flex-col gap-3 pt-1'>
          {/* Price row */}
          <div className='flex flex-wrap items-baseline gap-1 text-start'>
            <span className='text-xs text-muted-foreground'>{startingFrom}</span>
            <span className='text-2xl font-bold tabular-nums text-primary leading-none'>
              {formatPrice(card.startingPrice, currentLang)}
            </span>
            <span className='text-sm text-muted-foreground'>{currency}</span>
            <span className='text-xs text-muted-foreground'>/ {duration}</span>
          </div>

          {/* Add to Cart CTA button */}
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

          {/* Trust note */}
          {termWarranty && (
            <p className='flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground'>
              <span>{termWarranty}</span>
              <IconCircleCheck className='h-3 w-3 shrink-0 text-primary' />
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
