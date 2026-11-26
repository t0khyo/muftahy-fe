# products/components

## Overview

UI components, filter bars, icons, display types, and static sample data for the product catalog. The primary entry point is `ProductCard`, which renders individual product listings in both a full-featured variant (accepting a domain `Product` object) and a template variant (accepting a `ProductCardData` object). Supporting components handle catalog filtering, category selection, add-to-cart flows, plan selection modal sheets, platform icons, loading skeletons, and scrollable recommendation rails.

## Interface

### Components
- `ProductCard(props: ProductCardProps)` — renders an accessible product card article supporting both domain `Product` and template `ProductCardData` input modes. Accepts `renderLink` and `renderImage` render props.
- `ProductCardSkeleton(props: { className?: string })` — loading skeleton mirroring the `ProductCard` structure.
- `ProductGrid(props: ProductGridProps)` — responsive grid (1–4 columns) rendering products via `ProductCard`.
- `ProductRail(props: ProductRailProps)` — horizontally scrollable snap rail for a named `ProductCollection`. Shows `ProductRailSkeleton` while loading.
- `ProductRailSkeleton(props: ProductRailSkeletonProps)` — skeleton placeholder row for loading rails.
- `AddToCartButton(props: AddToCartButtonProps)` — primary CTA button; adds single-plan items directly or triggers `PlanPicker` for multi-plan products. Shows transient confirmation state.
- `CategoryRow(props: CategoryRowProps)` — horizontally scrolling pill list of catalog categories with active selection highlight.
- `FeatureTile(props: FeatureTileProps)` — featured highlight tile for promotions and key catalog features.
- `FilterGroup(props: FilterGroupProps)` — collapsible accordion group for filter facets (checkboxes, radios, range sliders).
- `FilterSheet(props: FilterSheetProps)` — mobile slide-over drawer containing the full filter controls.
- `FilterSidebar(props: FilterSidebarProps)` — desktop sidebar containing category and variant filter groups.
- `ListingToolbar(props: ListingToolbarProps)` — sorting dropdown, result counts, and mobile filter toggle button bar.
- `PlanPicker(props: PlanPickerProps)` — modal bottom-sheet for selecting among multiple plans before adding to cart.
- `PlatformsRow(props: PlatformsRowProps)` — normalizes `Platform[]` to `DisplayPlatform[]` and renders icon pills with CSS tooltips.
- `IconBox`, `IconShield`, `IconTag`, `IconSparkles`, `IconRefresh`, `IconUserCheck`, `IconStarFilled`, `IconStarOutline`, `IconCircleCheck`, `IconShoppingCartPlus`, `IconShoppingBag`, `IconGlobe`, `IconPlatformWindows`, `IconPlatformMac`, `IconPlatformAndroid`, `IconClose`, `IconCheck`, `IconPlatformSteam`, `IconPlatformPlaystation`, `IconPlatformXbox`, `IconPlatformNintendo`, `IconPlatformPc` (from `./icons`) — SVG catalog icons.
- `formatPrice(raw: string | number, locale?: string): string` — formats monetary amounts with Western digits (`ar-u-nu-latn`).
- `SAMPLE_PRODUCTS: ProductCardData[]` — static sample products with obviously fake license keys for testing and showcases.

### Subdirectories
- **detail**: [`./detail/README.md`](./detail/README.md) — Product detail page components (media gallery, sticky buy box, info accordions, related rail, mobile sticky bar).

## Invariants

- `[product-card.tsx]` Accepts either `card` or `product` prop — never both simultaneously (enforced by TypeScript discriminated union).
- `[utils.ts:formatPrice]` Uses `ar-u-nu-latn` for Arabic locale to enforce Western digits (0-9).
- `[platforms-row.tsx]` Normalizes `'mac'` and `'ios'` to unified `'apple'` display platform.
- `[sample-data.ts]` Mock/sample keys are obviously fake (`XXXXX-XXXXX-XXXXX`).

## Side Effects

- `[product-grid.tsx]` and `[product-rail.tsx]` trigger TanStack Query data fetching via hooks on mount.
- `[add-to-cart-button.tsx]` invokes `onAddToCart` callback to delegate store mutations to caller.

## Verification

- Run: `pnpm test`
