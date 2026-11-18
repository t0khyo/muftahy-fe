# products/components/detail

## Overview

Presentational and interactive UI components specific to the product detail view. Covers the visual media gallery, purchase buy box with plan picker, accordion specification and FAQ sections, related products rail, loading skeletons, error/not-found states, and the mobile sticky action bar.

## Interface

- `DetailBreadcrumb(props: DetailBreadcrumbProps)` — renders catalog hierarchy breadcrumbs (`Home > Products > Category > Product Title`).
- `DetailBuyBox(props: DetailBuyBoxProps)` — sticky purchase box rendering title, ratings, badges, plan selection, pricing, warranty guarantees, and primary CTA button.
- `DetailMedia(props: DetailMediaProps)` — gallery viewer displaying product cover image, screenshots, and badge overlays with thumbnails.
- `DetailInfoSections(props: DetailInfoSectionsProps)` — accordion sections detailing included features, activation steps, technical specs, and product FAQs.
- `DetailRelatedRail(props: DetailRelatedRailProps)` — horizontally scrolling recommendation rail rendering related products via `useRelatedProducts`.
- `DetailStickyMobileBar(props: DetailStickyMobileBarProps)` — fixed bottom bar for mobile screens displaying active plan, price, and add-to-cart CTA when the buy box scrolls out of view.
- `DetailSkeleton()` — loading skeleton layout mirroring the 12-column detail page layout.
- `DetailNotFound(props: DetailNotFoundProps)` — empty state message when a product slug cannot be found.
- `DetailError(props: DetailErrorProps)` — error state with a retry action button.

## Invariants

- `[detail-buy-box.tsx:stock]` Disables the add-to-cart CTA when `selectedPlan.stock === 0` and renders out-of-stock indicators.
- `[detail-sticky-mobile-bar.tsx:isVisible]` Controls display transitions; bar is translated off-screen unless `isVisible` is true.
- `[detail-info-sections.tsx:lang]` Formats localized text and accordions honoring active language (`ar` or `en`).

## Side Effects

- `[detail-related-rail.tsx:useRelatedProducts]` Triggers TanStack Query network/mock data fetch for related products.
- `[detail-buy-box.tsx:onAddToCart]` Invokes parent callback to trigger cart mutations.
- `[detail-error.tsx:onRetry]` Invokes retry callback to refetch product data.

## Verification

- Run: `pnpm test`
