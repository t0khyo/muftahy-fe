# features/home

## Overview

The home page feature, served at `/:lang` (e.g. `/en`, `/ar`). It renders a configurable sequence of marketing sections — hero, category tiles, platform strip, product rails, trust strip, bundles, how it works, social proof, support, and FAQ — driven entirely by `home.config.ts`. Section ordering, visibility, and content references are all controlled from that single configuration object without touching component code.

## Interface

### Configuration & Symbols
- `DEFAULT_HOME_CONFIG: HomeConfig` — the default section sequence used by `HomeRoute` (Hero & Trust Strip, Best Sellers, Bundles, Categories, Platforms, How It Works, Social Proof, FAQ, Support).
- `DEFAULT_HERO_TRUST_CLAIMS: HeroTrustClaim[]` — standard triad of micro-proof claims framing the hero CTA.
- `HomeConfig` — `{ sections: HomeSection[] }`.
- `HomeSectionType` — `'hero' | 'category-tiles' | 'platform-strip' | 'product-rail' | 'trust-strip' | 'faq' | 'bundles' | 'how-it-works' | 'social-proof' | 'support' | 'browse'`.
- `HomeSection` — union of all section configuration interfaces.
- `HeroSectionConfig`, `BrowseSectionConfig`, `BundlesSectionConfig`, `CategoryTilesSectionConfig`, `PlatformStripSectionConfig`, `ProductRailSectionConfig`, `TrustStripSectionConfig`, `HowItWorksSectionConfig`, `SocialProofSectionConfig`, `SupportSectionConfig`, `FaqSectionConfig`.
- `BaseSectionConfig` — `{ id: string; type: HomeSectionType; enabled: boolean }`.
- `HeroTrustClaim` — `{ id: string; icon: 'zap' | 'shield-check' | 'headphones'; labelKey: string }`.

### Subdirectories
- **components**: [`./components/README.md`](./components/README.md) — Presentational section components (`HomePage`, `HeroSection`, `CategoryTiles`, `PlatformStrip`, `TrustStrip`, `FaqSection`, `HowItWorksSection`, `SocialProofSection`, `SupportSection`, `BundlesSection`, `BrowseSection`).
- **lib**: [`./lib/README.md`](./lib/README.md) — Utility helpers such as `resolveLocaleHref`.

## Developer Guide

### Reordering, Adding, or Disabling Sections

All sections, their order, and visibility are managed in `home.config.ts`. To disable a section set `enabled: false`. Rearrange array entries to reorder. Alternating background bands recalculate automatically from array index.

### Adding a Product Rail

Ensure the collection exists in `ProductCollection` (`packages/domain`), then add:
```ts
{ id: 'my-rail', type: 'product-rail', enabled: true, collection: 'best-sellers', titleKey: 'bestSellers', viewAllHref: '/:lang/products?collection=best-sellers' }
```

### Product Cards

Rails render the full production `ProductCard` from `features/products/components/product-card.tsx`.

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

- `[home.config.ts:DEFAULT_HOME_CONFIG]` Section render order matches `sections` array order exactly.
- `[home.config.ts:DEFAULT_HERO_TRUST_CLAIMS]` Trust claim icons map strictly to `'zap' | 'shield-check' | 'headphones'`.

## Side Effects

- None in config; child components set `<title>` and `<meta name="description">` via React 19 native head metadata.

## Verification

- Run: `pnpm test`
