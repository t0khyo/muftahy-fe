# home/components

## Overview

Presentational section components that compose the storefront home page (`/:lang`). Each component maps to a corresponding `HomeSectionType` variant declared in `home.config.ts`. `HomePage` renders all enabled sections in configuration order with alternating background bands.

## Interface

- `HomePage(props: HomePageProps)` — root home page component; iterates `HomeConfig.sections`, filters enabled sections, and renders each by type. Accepts optional `config` and `renderProductRail` render prop.
- `HeroSection(props: { config: HeroSectionConfig; className?: string })` — hero banner with primary CTA button, secondary link, announcement badge, micro-proof trust claims, and responsive illustration slot.
- `BrowseSection(props: BrowseSectionProps)` — product browsing catalog section showcasing featured collections.
- `BundlesSection(props: BundlesSectionProps)` — promotional product bundle showcase section.
- `CategoryTiles(props: { config: CategoryTilesSectionConfig; className?: string })` — category navigation tile grid.
- `PlatformStrip(props: { config: PlatformStripSectionConfig; className?: string })` — platform pill row (PlayStation, Xbox, Steam, etc.).
- `TrustStrip(props: { config: TrustStripSectionConfig; className?: string })` — four-column trust signals grid (instant delivery, secure payments, 24/7 support, regional guarantees).
- `HowItWorksSection(props: HowItWorksSectionProps)` — step-by-step explanatory section outlining the purchase-to-delivery lifecycle.
- `SocialProofSection(props: SocialProofSectionProps)` — testimonials, user ratings, and trust metrics banner.
- `FaqSection(props: { config: FaqSectionConfig; className?: string })` — accordion FAQ driven by i18n keys.
- `SupportSection(props: SupportSectionProps)` — customer support CTA card with contact channels.
- `ZapIcon`, `ShieldCheckIcon`, `HeadphonesIcon`, `ChevronEndIcon` (from `./hero-icons`) — SVG micro-icons for hero trust claims and navigation.

## Invariants

- `[home-page.tsx:sections]` Sections render in the exact sequence specified in `HomeConfig.sections`. Alternating background bands are computed from array index.
- `[home-page.tsx:enabled]` Sections with `enabled: false` are excluded from the render tree.
- `[home-page.tsx:renderProductRail]` Product rails require injection through `renderProductRail` prop to avoid tight cross-feature module coupling.
- `[home-page.tsx:i18n]` All user-facing strings are looked up via the `'home'` i18n namespace.

## Side Effects

- `[home-page.tsx:title]` Updates document `<title>` and `<meta name="description">` using React 19 native document metadata.
- None (no direct network calls or store mutations).

## Verification

- Run: `pnpm test`
