# products/components

## Overview

UI components, display types, and static sample data for the product catalog. The primary entry point is `ProductCard`, which renders individual product listings in both a full-featured variant (accepting a domain `Product` object) and a template variant (accepting a `ProductCardData` object). Supporting components handle the add-to-cart flow, plan selection, platform display, loading skeletons, and the scrollable rail layout used on the home page.

## Interface

- `ProductCard(props: ProductCardProps)` — renders an accessible product card article supporting both domain `Product` and template `ProductCardData` input modes. Accepts `renderLink` and `renderImage` render props for framework-specific overrides.
- `ProductCardProps` — union of `BaseProductCardProps & { card: ProductCardData }` and `BaseProductCardProps & { product: Product }`.
- `ProductCardData` — template-format card data shape (slug, name, plans, badge, platforms, pricing, etc.).
- `ProductCardTranslations` — optional override strings for all localizable labels in `ProductCard`.
- `ProductCardPlan` — `{ id, label, duration, price, activationType }` — a single purchasable plan.
- `ProductBadge` — `'warranty' | 'offer' | 'new'`
- `ProductType` — `'subscription' | 'service'`
- `ActivationType` — `'personal_invite' | 'ready_account'`
- `Platform` — `'windows' | 'mac' | 'android' | 'ios' | 'web'`
- `AddToCartButton(props: AddToCartButtonProps)` — primary CTA button; fires `onAddToCart` directly for single-plan products, opens `PlanPicker` for multi-plan products. Shows a 1.5-second "Added!" confirmation state.
- `PlanPicker(props: PlanPickerProps)` — modal bottom-sheet for selecting among multiple plans before adding to cart. Closes on Escape or backdrop click.
- `PlatformsRow(props: PlatformsRowProps)` — normalizes `Platform[]` to `DisplayPlatform[]` and renders icon pills with CSS tooltips.
- `ProductGrid(props: ProductGridProps)` — responsive grid (1–4 columns) that fetches products via `useProducts` and renders a `ProductCard` per product.
- `ProductRail(props: ProductRailProps)` — horizontally scrollable snap rail for a named `ProductCollection`. Shows `ProductRailSkeleton` while loading and `ProductCardPlaceholder` for each loaded product.
- `ProductCardSkeleton` — full-card loading skeleton mirroring `ProductCard` layout.
- `ProductCardPlaceholder(props: ProductCardPlaceholderProps)` — minimal shimmer card used inside rails; intended to be replaced by `ProductCard` when the full card design is complete.
- `ProductRailSkeleton(props: ProductRailSkeletonProps)` — row of `ProductCardPlaceholder` skeletons shown while a rail loads.
- `formatPrice(raw, locale): string` — formats a numeric price string using `Intl.NumberFormat` with Western digits for both Arabic and English locales.
- `SAMPLE_PRODUCTS: ProductCardData[]` — static sample data (Canva Pro, Google AI Pro, Microsoft 365) used by `DesignPage` for component showcasing. Contains obviously placeholder keys only.

## Invariants

- `ProductCard` accepts either `card` or `product` prop — never both simultaneously (enforced by TypeScript discriminated union).
- `formatPrice` always uses `ar-u-nu-latn` for Arabic locale to ensure Western digits (0-9) are rendered.
- `PlatformsRow` normalizes `'mac'` and `'ios'` to the unified `'apple'` display platform.
- `ProductCardPlaceholder` is a temporary component; `ProductRail` currently renders it instead of `ProductCard`. To upgrade, replace `<ProductCardPlaceholder product={product} />` with `<ProductCard product={product} />` in `product-rail.tsx`.
- All mock/sample product keys and codes are obviously fake (no real license keys appear in source).

## Side Effects

- `ProductGrid` and `ProductRail` trigger TanStack Query fetches on mount via their respective hooks.
- `AddToCartButton` calls `onAddToCart` callback (which callers wire to `useCartStore`) — no direct store writes.

## Verification

- Run: `pnpm test`
