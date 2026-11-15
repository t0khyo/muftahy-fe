# features/home

## Overview

The home page feature, served at `/:lang` (e.g. `/en`, `/ar`). It renders a configurable sequence of marketing sections — hero, category tiles, platform strip, product rails, trust strip, and FAQ — driven entirely by `home.config.ts`. Section ordering, visibility, and content references are all controlled from that single config object without touching component code.

## Subdirectories & Boundaries

- **components**: [`./components/README.md`](./components/README.md) — `HomePage`, `HeroSection`, `CategoryTiles`, `PlatformStrip`, `TrustStrip`, `FaqSection`, `HeroIcons`.
- **lib**: Utility helpers such as `resolve-locale-href.ts`.

## Interface

- `DEFAULT_HOME_CONFIG: HomeConfig` — the default section sequence used by `HomeRoute` (Hero & Trust Strip, Best Sellers, Bundles, Categories, Platforms, How It Works, Social Proof, FAQ, Support).
- `DEFAULT_HERO_TRUST_CLAIMS: HeroTrustClaim[]` — the standard triad of micro-proof claims framing the hero CTA.
- `HomeConfig` — `{ sections: HomeSection[] }`.
- `HomeSectionType` — `'hero' | 'category-tiles' | 'platform-strip' | 'product-rail' | 'trust-strip' | 'faq' | 'bundles' | 'how-it-works' | 'social-proof' | 'support'`.
- `HeroSectionConfig` — `{ id: string; type: 'hero'; enabled: boolean; primaryCtaHref: string; secondaryCtaHref: string; badgeKey?: string; badgeHref?: string; trustClaims?: HeroTrustClaim[] }`.
- `HeroTrustClaim` — `{ id: string; icon: 'zap' | 'shield-check' | 'headphones'; labelKey: string }`.
- `CategoryTilesSectionConfig`, `PlatformStripSectionConfig`, `ProductRailSectionConfig`, `TrustStripSectionConfig`, `FaqSectionConfig` — per-type config shapes.
- `BaseSectionConfig` — `{ id: string; type: HomeSectionType; enabled: boolean }`.

## Developer Guide

### Reordering, Adding, or Disabling Sections

All sections, their order, and visibility are managed in `home.config.ts`. To disable a section set `enabled: false`. Rearrange array entries to reorder. Alternating background bands recalculate automatically from array index.

### Adding a Product Rail

Ensure the collection exists in `ProductCollection` (`packages/domain`), then add:
```ts
{ id: 'my-rail', type: 'product-rail', enabled: true, collection: 'best-sellers', titleKey: 'bestSellers', viewAllHref: '/:lang/products?collection=best-sellers' }
```

### Swapping the Card Placeholder

Rails currently render `ProductCardPlaceholder`. To use the full `ProductCard`, replace `<ProductCardPlaceholder product={product} />` in `features/products/components/product-rail.tsx`.

### Copy Keys

All user-facing copy lives in the `home` namespace: `packages/i18n/src/locales/en.json` and `ar.json`.

### Unimplemented Routes

The following routes linked from the home page do not yet have route handlers:

| Route | Linked From |
|:------|:------------|
| `/:lang/how-it-works` | Hero secondary CTA |
| `/:lang/categories/*` | Category tiles |
| `/:lang/platforms/*` | Platform strip |
| `/:lang/products?collection=*` | Rail "View all" links |

## Invariants

- Section render order matches `sections` array order exactly.
- Product rail sections require the `renderProductRail` render prop from `HomeRoute` to actually render.

## Side Effects

- `HomePage` sets page `<title>` and `<meta description>` via React 19 head metadata.

## Verification

- Run: `pnpm test`
