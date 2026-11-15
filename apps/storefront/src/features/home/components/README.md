# home/components

## Overview

Presentational section components that compose the home page (`/:lang`). Each component maps to one `HomeSectionType` variant from `home.config.ts`. `HomePage` renders all enabled sections in config order with alternating background bands.

## Interface

- `HomePage(props: HomePageProps)` — root home page component; iterates `HomeConfig.sections`, filters to enabled, renders each by type. Accepts `config` (defaults to `DEFAULT_HOME_CONFIG`) and `renderProductRail` render prop for injecting `ProductRail` without creating a cross-feature import.
- `HomePageProps` — `{ config?: HomeConfig; renderProductRail?: (props: ProductRailSectionConfig & { className? }) => ReactNode }`.
- `HeroSection(props: { config: HeroSectionConfig; className? })` — full-width hero banner with primary CTA button, secondary text link, optional announcement badge, inline trust claims row, and responsive visual placeholder.
- `ZapIcon`, `ShieldCheckIcon`, `HeadphonesIcon`, `ChevronEndIcon` (from `./hero-icons`) — inline SVG icons for hero trust claims and navigational chevrons.
- `CategoryTiles(props: { config: CategoryTilesSectionConfig; className? })` — icon-driven category quick-links grid.
- `PlatformStrip(props: { config: PlatformStripSectionConfig; className? })` — horizontal pill row of platform links (PlayStation, Xbox, Steam, etc.).
- `TrustStrip(props: { config: TrustStripSectionConfig; className? })` — four-column trust-signal grid (instant delivery, secure payment, support, region clarity).
- `FaqSection(props: { config: FaqSectionConfig; className? })` — accordion FAQ driven by i18n keys.

## Invariants

- Sections render in the **exact order** they appear in `HomeConfig.sections`; alternating band background is computed from the array index.
- Sections with `enabled: false` are completely omitted from the render tree.
- `renderProductRail` is required for `'product-rail'` sections to render; if not provided, those sections are silently skipped.
- All copy is sourced from the `'home'` i18n namespace — no hardcoded English or Arabic strings in component markup.
- CTA `href` values in `DEFAULT_HOME_CONFIG` use the `/:lang/` placeholder which is replaced at runtime by the route segment.

## Side Effects

- Sets `<title>` and `<meta name="description">` via React 19 native head metadata on render.
- No network calls, no store mutations.

## Verification

- Run: `pnpm test`
