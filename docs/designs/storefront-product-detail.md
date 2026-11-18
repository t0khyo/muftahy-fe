# Storefront product detail and cart quantity controls

- **Author:** Abdelrahman Eltokhy
- **Date:** 2026-11-17
- **Status:** Brainstorm reviewed and refined; pending implementation approval
- **Implementation:** Not approved; no application changes made

## Overview

Give customers a product page at `/:lang/products/:slug` where they can understand what they receive, check platform and region restrictions, select a plan, and add that exact plan to their cart. Use the storefront's Apple-store visual language: quiet neutral surfaces, generous space, centered product art, restrained borders, and a clear purchase action. Arabic and English, light and dark themes, and keyboard use have equal priority.

Include a usable cart with quantity controls because the existing cart route only displays an item count. Product pages add a plan once; all subsequent quantity changes happen in the cart.

## Problem and current baseline

- The router has a product listing but no detail route. Unknown paths currently reach the catch-all redirect.
- The shared product schema already has localized title and description, price, optional original price, category, platform, region, cover image, stock, and delivery type. It has no shared plan model.
- The service already provides `getBySlug` and `getById`. Use this seam through TanStack Query.
- The standard product card accepts domain products and a separate display-only card model. Its domain adapter synthesizes one plan, review counts, and other presentation fields. Detail-page recommendations must not introduce fabricated reviews or incompatible cart identities.
- The Zustand cart stores an ID, name, minor-unit price, and quantity, but no currency or plan identity. Its current add action increments existing quantities.
- The existing breadcrumb, product card, header bag, accordion, table, badge, button, skeleton, and carousel can be reused. The old modal plan picker is not the requested inline radio group.
- `RadioGroup` and `Field` are not installed in `packages/ui`. Adding them through the shadcn CLI is a proposed implementation prerequisite, subject to the repo's approval rule.
- The footer uses WhatsApp number `201158172869`; the home support config still has a placeholder number. The detail contact line will use the footer's configured destination.

Baseline references: [architecture](../Architecture.md), [design system](../design-system.md), [hero design](storefront-hero-section.md), [product schema](../../packages/domain/src/schemas/product.ts), [product service](../../packages/api/src/services/product-service.ts), [mock adapter](../../packages/api/src/adapters/mock/product-mock-adapter.ts), [cart store](../../apps/storefront/src/features/cart/stores/cart-store.ts), [product card](../../apps/storefront/src/features/products/components/product-card.tsx), and [router](../../apps/storefront/src/app/router.tsx).

## Goals and non-goals

Goals:

- Show the specified sections in order, with useful bilingual mock content for all eight existing domain products.
- Make plan selection shareable in the URL and consistent across the buy box, mobile bar, and cart.
- Distinguish loading, missing products, failed requests, unavailable plans, and low stock.
- Preserve the standard product card's visual identity in related products.
- Provide cart line quantities, removal, currency-aware line totals, and an updated header bag.

Out of scope: backend, checkout, payments, purchased-code delivery, real inventory reservation, reviews, wishlist, payment logos, new artwork, new global stores, persistence, catalog redesign, and admin changes.

## Decisions confirmed with the author

1. Cart quantity controls are included in this task.
2. Adding a plan already in the cart never increases its quantity.
3. A newly added plan displays “Added” for approximately two seconds, followed by a persistent “In your cart” action. That action navigates to the cart. A “View cart” link appears below it.
4. Cart state follows the selected plan. Different plans are separate cart lines. The sticky mobile action follows exactly the same rules.
5. Announce successful additions through a polite live region; the action's accessible label reflects cart membership.
6. Keep the current hero claims for now: “Instant Delivery,” “Verified Licenses,” and “Activation Support,” using the existing bilingual keys. This is an explicit copy decision for the mock phase; it does not establish delivery or license verification functionality.

## Page structure and visual design

The page order is fixed:

1. Breadcrumb: Home → Category → Product. Home links to the locale home; category links to the existing filtered catalog; the product is the current page.
2. Media and buy box.
3. What you get, with the product description followed by included items.
4. How to activate, as numbered steps.
5. Details, as a specification table.
6. Questions about this product, with three or four accordion items.
7. “Not sure this works for you? Ask us” contact line.
8. You may also like, using the standard product card in a related-products rail.

Use the existing header container width (1024px) and its logical inline padding. Desktop starts at `lg`: a 12-column top grid allocates seven columns to media and five to the buy box, with a 48px gap. Below `lg`, media comes first and the buy box follows in one column. The top section's grid is the boundary for the desktop sticky buy box.

Use `background` for the page, `secondary` or `muted` for the media surface, `foreground` and `muted-foreground` for hierarchy, `input` for unselected radio borders, `primary` and a check icon for selected radios, `success` for delivery status, `warning` for low stock, `discount` for genuine markdowns, and `link` for inline links. Do not introduce raw colors, decorative gradients, or dark-mode color patches. Use the current font stack and radius tokens; the requested purchase pill uses the existing full-radius utility.

Keep lower section content at approximately 640px, aligned to the container's logical start, with the related rail using the full container. Use text and spacing rather than a separate card around each informational section.

| Element | Mobile | Desktop (`lg+`) |
| --- | --- | --- |
| Title | 24px, semibold, up to three lines | 32px, semibold, up to three lines |
| Optional tagline | 15px, muted | 17px, muted |
| Platform and region badges | 12px text, 32px tall | 13px text, 32px tall |
| Plan card | At least 64px tall, 12–16px padding | Same |
| Price | 24px, semibold | 28px, semibold |
| Old price | 14px | 15px |
| Delivery line | 13px | 14px |
| Purchase action | 48px tall, full width | Same |
| Trust items | 13px text, 20px icons | Same |
| Section spacing | 40px | 80px |
| Section headings | 20px | 24px |
| Body | 15px | 16px |

These explicit page sizes take precedence over the older general type scale. Define named app-level page styles for the requested sizes absent from the shared scale; avoid arbitrary Tailwind values and changes to shared theme internals. Preserve the existing Arabic root scaling and comfortable Arabic line heights. No tight tracking or tight leading on Arabic. Titles must fit the supplied mock copy within three lines at supported widths; do not hide essential product qualifiers. Accessibility zoom may increase the line count to preserve readable text.

### Media

One large 4:3 surface contains centered artwork with approximately 12% inset and `object-fit: contain`. Use a token-based coded cover while artwork is unavailable. No cropped covers. Treat the surface as a list of media entries from the outset; show thumbnail controls only with two or more entries. Thumbnails use shadcn buttons with localized names and a visible selected indicator. Image failure falls back to the coded cover without changing geometry. The placeholder is decorative when the adjacent heading already identifies the product.

### Buy box

The order is: platform and region badges; a short restriction note for limited regions; title; optional tagline; plan picker; price and genuine discount; delivery line with a dot; optional low-stock note; purchase action; View cart when applicable; three hero trust claims.

Badges are always visible. Region notes must state actual mock account restrictions: the existing Saudi PlayStation card must say Saudi account, rather than imply that every GCC account qualifies. Keep region notes in localized product content.

The picker is a labeled shadcn/Base UI radio group with card-shaped choices, arrow-key support, visible focus, disabled unavailable choices, and a selected border plus check icon. Each choice displays its localized plan label alongside its formatted plan price and an accessible availability indicator, allowing customers to compare prices without having to click each option. Hide it when there is exactly one plan. Do not reuse the custom modal picker for this page.

The selected plan determines price, original price, stock, delivery information, and the purchase action. Show old price and discount only when the old price has the same currency and is strictly larger than the current price. Calculate markdowns with integer minor units. Out-of-stock selections keep their price visible.

### Selected plan, listing summary, and URL behavior

- Plans have stable, locale-independent slugs. The `plan` query parameter is the selection source of truth on the detail page.
- Without a valid query value, choose the product's default plan when available, otherwise its first available plan, otherwise its default plan for an entirely unavailable product.
- Normalize missing, unknown, or duplicate `plan` parameters to the resolved slug using history replacement. Preserve unrelated parameters and the hash.
- A valid link to an unavailable plan preserves that selection and displays Out of stock. Never silently substitute a different priced plan for a valid deep link.
- User selection updates the query parameter immediately using history replacement, avoiding a history entry for every arrow-key press. Browser navigation to another URL still restores the corresponding plan.
- Switching locale preserves slug, query, and hash. Product navigation resolves the new product independently; stale selection must not leak between products.
- Render price and button state from the resolved plan in the same render. No second mutable selected-plan store.
- **Listing Summary Policy:** Product listing cards, search summaries, and collection rails derive their summary presentation (price, original price, discount, delivery timing, stock status) through a single pure domain helper: `getSummaryPlan(product)`.
  - `getSummaryPlan` selects the product's configured default plan if in stock; if unavailable, the first available plan; if all plans are unavailable, the default plan.
  - Adding to cart directly from a listing card adds this resolved summary plan.
  - Clicking a listing card navigates to `/:lang/products/:slug?plan=<summaryPlan.slug>`.
  - The card copy renders "From [price]" only when multiple available plans exist with differing prices; otherwise it renders the price directly.

### Cart action behavior

| Selected plan state | Main action | Activation result |
| --- | --- | --- |
| Available, absent from cart | Add to cart | Add exactly one; announce once; show Added |
| Just added, still present | Added for approximately two seconds | Further activation can open the cart; never adds again |
| Present after feedback | In your cart | Open the localized cart route |
| Unavailable, absent from cart | Out of stock, disabled | No mutation |
| Unavailable, already present | In your cart | Open cart; show its unavailable status there |

Show View cart as soon as the selected plan is present. Membership comes from the cart store. Removing that line restores Add to cart when available. The temporary feedback is scoped to product and plan; switching plans clears that feedback rather than showing another plan's success message. Both purchase surfaces share the feedback and one polite live region. Timers are only for UI feedback, never fake API latency.

### Sticky behavior

At `lg+`, enable buy-box stickiness only when its measured height fits within the viewport below the header and a small spacing allowance. Recheck on resizing, content changes, and localization. A tall buy box remains in normal document flow and never gets its own scroll area.

On mobile (below `md`, 768px), show a bottom bar only after the entire buy box has passed above the visible content area. It must not appear while the user is still above the buy box or looking at any part of it. Hide it again when the buy box returns. Tablet (`md` to below `lg`) remains stacked without the mobile bar.

The bar is 72px tall plus bottom safe-area padding, with selected plan, price, and the shared action state. Keep a View cart link in its in-cart presentation. Reserve enough page-bottom space for the bar so it cannot cover the footer or focused controls. Allow height expansion under text zoom or long translations and measure the actual occupied height. If a floating WhatsApp control exists when implemented, offset it by that height while the bar is visible; adding a new floating control is out of scope. Header menus and search overlays take precedence over the bar.

## Cart experience

Use the existing locale cart route and store. Each line shows localized product name, plan label, unit price, quantity, line total, and removal. Product and plan together identify a line (`{ productId, planId, currency, quantity }`). Names are resolved for the current locale rather than stored solely in the language used at addition.

### Stock reconciliation and bounded mutations

Availability and mock stock bounds are reconciled dynamically against service data through TanStack Query:
- **Available lines:** Minimum quantity is 1; disable decrement at 1 and provide an explicit Remove action. Disable increment when the quantity reaches mock stock.
- **Unavailable lines (`stock === 0`):** Retain the cached line in the cart with an explicit localized "Unavailable" badge/warning. Disable increment (`+`). Disable decrement (`-`). The explicit Remove action remains enabled. Out-of-stock lines are excluded from order subtotals and header bag counts, or separated with clear explanatory copy.
- **Over-stock lines (`quantity > stock`):** When previously added quantity exceeds newly resolved stock (e.g. quantity 4, stock 2), retain the current quantity with a localized warning note ("Only 2 available in stock"). Disable increment (`+`). Permit decrement (`-`) toward 1, and always permit Remove.
- **Focus handoff on removal:** When an item is removed, programmatically move keyboard focus to the next line's remove button; if the removed item was the last line, move focus to the previous line's remove button; if the cart is now empty, move focus to the empty-cart browse action.
- **Accessible button labels:** Increment, decrement, and removal buttons specify both the product name and plan name in their accessible labels (e.g., `aria-label="Increase quantity for Windows 11 Pro - 1 PC"`).

### Shared presentation and currency grouping

Keep totals in minor units and group subtotals by currency using `formatMoneyFromMinor`. Never add EGP, USD, and SAR together or invent exchange rates.

Share the cart presentation selector/hook across all three shopping cart surfaces: the cart route, the desktop header bag preview, and the mobile header bag sheet (`apps/storefront/src/components/site-header/cart-button.tsx`). All three display currency-grouped subtotals, current-locale line labels, and an atomic count. Replace the hardcoded USD formatting and "Checkout" button in the site header previews with localized currency grouping and a "View cart" navigation link.

Remove the standalone `setCount` mutation from `cart-store.ts`. Cart count is always strictly computed as `items.reduce((sum, item) => sum + item.quantity, 0)`.

Showcase product cards in `apps/storefront/src/features/design/design-page.tsx` must be strictly demo-only (configured with a toast or no-op callback) to ensure sample display cards never inject malformed items without currency or domain identity into the production cart store.

## Data and content

Extend the existing shared Zod model rather than introducing a parallel detail model. Retain `description`, which already exists, and add `tagline?`, `includes[]`, `activationSteps[]`, `specs` (`licenseType`, `edition`, `language`, `deliveryTime`), `faq[]`, and `relatedSlugs[]`. Add the plan and media fields required by the requested interactions, a default plan slug, and a localized optional region note.

### Localized content contract

- In `domain` schemas and `api` mock adapter fixtures, `title` and `description` remain explicit bilingual string objects (`LocalizedString: { en: string; ar: string }`). This ensures that `product-mock-adapter.ts` continues to perform direct substring search on `title.en` and `title.ar`, and existing product card and search consumers continue to function without architectural violations.
- `domain` and `api` remain pure leaf packages and must never import from `i18n` or apps.
- Rich detail content (`includes`, `activationSteps`, `specs`, `faq`) uses structured localized fields or dictionary keys resolved in the storefront feature layer through `react-i18next`.

Plans carry stable ID/slug, localized label, price, optional original price, and nonnegative integer mock stock quantity. Use stock zero for unavailable plans and a documented low-stock threshold of five. These numbers simulate availability; cart changes do not mutate inventory. Each plan also declares delivery type and localized delivery timing. Product-level price and stock used by listing filters are derived consistently using `getSummaryPlan(product)`. Existing product identity and routes remain stable.

For the initial fixtures, retain one plan for products whose identity fixes an edition or denomination. Give Windows 11 Pro two clearly labeled device-count plans to exercise multi-plan behavior, including a low-stock plan. Keep the original single-plan product price as its default; new plan prices are explicit fake fixture amounts. Preserve the unavailable Saudi PlayStation card. Test fixtures additionally cover mixed availability and manual delivery. Product-level specs and activation steps apply to every plan in that product; variants requiring different editions or activation processes are outside this initial fixture set.

All eight existing products receive specific bilingual descriptions, included items, activation steps, four spec values, three or four FAQs, and valid related slugs. Do not insert real-looking license keys; any example code is `XXXXX-XXXXX-XXXXX`.

Related products preserve configured order, exclude the current product, remove duplicates, and skip missing or failing slugs gracefully without failing the entire related rail. Use the existing service seam (`ProductService.getBySlug`), not direct imports of mock data or a separate recommendation backend. Omit the unused review-suppression flag, as product cards do not render review UI; remove fabricated rating properties from the adapter without adding dead presentation props.

Query cache keys follow a deterministic convention: `['product', slug]` for primary detail and `['products', 'related', slug]` for related products. Provide test-local service stubs with deferred promises for loading, error, retry, and recovery states.

## States and accessibility

- Loading: shadcn skeletons reserve the breadcrumb, media ratio, buy box, and informational section structure. Keep purchase actions unavailable until product data resolves. Respect reduced motion on skeletons.
- Not found: an explicit localized missing-product page with Browse products; no silent redirect.
- Request error: a separate error message and Retry action, never misreported as not found.
- Low stock: short warning text based on the selected plan's fixture stock. No countdowns or invented scarcity counters.
- Keyboard: radio navigation, accordion operation, cart quantity controls, thumbnails, related navigation, and links retain visible focus. No focus movement when a plan changes or a product is added.
- Semantics: one main product heading; ordered activation steps; labeled table rows; clear button names; decorative icons hidden from assistive technology. Set current page semantics in the breadcrumb.
- Locale: route supplies language and direction; logical CSS everywhere; directional icons flip in RTL; mixed text uses isolation; all numbers and prices use shared formatters and Western digits.
- Motion: CSS-only opacity/transform transitions, disabled under reduced motion. Hover treatments apply only to desktop devices with hover and a fine pointer.

## Required bilingual strings

Preserve the supplied wording exactly. Add these under a detail-page namespace or consistently named keys within the existing products namespace.

| English | Arabic |
| --- | --- |
| Choose a plan | اختر الخطة |
| Platform | المنصة |
| Region | المنطقة |
| Instant delivery | تسليم فوري |
| Add to cart | أضف إلى السلة |
| Added | تمت الإضافة |
| View cart | عرض السلة |
| Out of stock | غير متوفر |
| Low stock | كمية محدودة |
| What you get | ما ستحصل عليه |
| How to activate | طريقة التفعيل |
| Details | التفاصيل |
| License type | نوع الترخيص |
| Edition | الإصدار |
| Language | اللغة |
| Delivery | التسليم |
| Questions about this product | أسئلة عن هذا المنتج |
| Not sure this works for you? Ask us | لست متأكدًا أنه مناسب لك؟ اسألنا |
| You may also like | قد يعجبك أيضًا |
| We couldn't find this product | لم نتمكن من العثور على هذا المنتج |
| Browse products | تصفح المنتجات |

Additional proposed copy: “In your cart” / “في سلتك”; “Added to your cart” / “تمت الإضافة إلى سلتك”. Add localized cart quantity, removal, subtotal, retry, manual-delivery, image navigation, and accessibility labels. The contact message includes the localized product name through an encoded WhatsApp `text` parameter. Reuse the footer destination, not the placeholder home number.

## Alternatives considered

- Keep the cart as a count-only placeholder: rejected by the author, who included quantity controls.
- Increment on repeated Add to cart: rejected by the author; persistent membership should lead to the cart.
- Leave an unchanged Add to cart action after addition: rejected by the author because it appears clickable without a useful result.
- Replace hero claims with neutral mock-phase copy: rejected by the author for now; retain the hero claims and record their mock-phase status.
- Reuse the modal plan picker: does not meet the specified inline radio behavior.
- Add a backend, inventory reservation, checkout, or artwork pipeline: outside the frontend task.

## Detailed Implementation Plan

### 1. Confirm prerequisites at implementation approval

Inspect shadcn CLI output for the Base UI `radio-group` and `field` additions before applying them. Present any dependency or lockfile changes for approval under AGENTS.md. Keep `components.json`, the preset, and existing shared UI internals unchanged. Do not handwrite missing shadcn components. Confirm named app-level typography and geometry styles for the author-supplied dimensions; no shared color changes are needed.

### 2. Extend the data seam

Update `packages/domain/src/schemas/product.ts`, the mock adapter, and their behavioral tests:
- Retain `title` and `description` as explicit `LocalizedString` (`{ en: string; ar: string }`) fields in domain models and mock fixtures. Keep mock service search operating directly on `title.en` and `title.ar` without importing `i18n`.
- Extend product schema with `tagline?`, `includes[]`, `activationSteps[]`, `specs`, `faq[]`, `relatedSlugs[]`, `plans[]`, and `defaultPlanSlug`.
- Validate plan slug uniqueness, a valid default, integer stock and money, consistent currency within a product, and bounded FAQ content.
- Implement a pure `getSummaryPlan(product)` domain helper that derives summary pricing, delivery, stock, and quick-add plan ID consistently for listings, search, and catalog cards.
- Gracefully resolve related products through `ProductService.getBySlug`, omitting missing or failed items without aborting the rail. Cleanly omit review metrics without adding dead flags.

### 3. Make cart identity and quantities consistent

- Extend cart items with `{ productId, planId, currency, quantity }`. Add an idempotent plan insertion action and bounded quantity increment/decrement/remove actions.
- Remove the standalone `setCount` mutation from `cart-store.ts`; compute count strictly as the sum of item quantities.
- Wire service-backed stock reconciliation: handle available, out-of-stock (`stock === 0`), and over-stock (`quantity > stock`) lines with appropriate warnings and disabled increment controls.
- Implement programmatic focus handoff after cart line removal (next item, previous item, or empty-cart action).
- Provide localized accessible labels for increment, decrement, and removal buttons combining product name and plan name.
- Share the cart presentation selector across the cart route, desktop header bag dropdown, and mobile header bag drawer (`cart-button.tsx`). Group subtotals by currency via `formatMoneyFromMinor` and point header CTAs to the cart route.
- Configure showcase cards in `apps/storefront/src/features/design/design-page.tsx` with a demo toast/no-op callback so display cards never inject malformed lines into the production cart store.

### 4. Build the route and detail feature

Add a thin product detail route under the existing locale layout. Keep its components, hooks, and tests within `features/products`. Query by slug using `['product', slug]`, resolve plan from search parameters, and compose the existing breadcrumb with media, radio plans (with prices displayed on choices), buy box, informational sections, contact link, and related rail (`['products', 'related', slug]`). Use existing components with Base UI `render` composition.

Keep one purchase controller for membership, transient feedback, navigation, and the live announcement. Derive both buttons from it. Separate failed requests from null product results. Related data has an independent query and cannot reset the main purchase state.

Factor a reusable rail presentation from the existing collection rail if needed; keep collection fetching and related-product fetching separate. Standard product cards use `getSummaryPlan` to display truthful prices and navigate to `?plan=<summaryPlan.slug>`.

### 5. Add responsive behavior

Use `ResizeObserver` for buy-box fit and occupied bottom-bar height, and `IntersectionObserver` with position checks to distinguish above from below the buy box. Clean up observers on unmount. If observation is unavailable, retain the functional inline buy box without a sticky enhancement. Do not introduce an animation or measurement dependency.

Use named app-local styles for the specified geometry, the header offset, safe-area inset, desktop-only hover, and reduced motion. Verify page-bottom padding, overlay stacking, and focus visibility with the sticky bar active.

### 6. Verify behavior and presentation

Automated coverage:

- Product and plan schema validation, consistent listing summary (`getSummaryPlan`), mock content, and related order/filtering.
- Valid/missing/unknown/unavailable plan URLs, unrelated query preservation, locale switching, product changes, and browser navigation.
- One-plan picker suppression; multi-plan keyboard selection with visible prices; unavailable choices; current price and stock updates.
- Add once, repeated activation, two-second feedback, independent plan lines, membership after removal, one live announcement, and identical mobile state.
- Cart quantity bounds, stock drop reconciliation, line removal focus handoff, header count, line totals, multiple currencies, and current-locale labels.
- Loading, not found, retry, related failures, image fallback, and sticky visibility/fit decisions.
- Test-local service stubs with deferred promises for loading, error, retry, and recovery states.

Visual and keyboard checks cover Arabic and English in light and dark themes at mobile, tablet, and desktop widths; long titles; text zoom; 320px narrow layouts; safe-area padding; menus over the mobile bar; and reduced motion. Use available browser tooling without adding a dependency. Unit observation tests do not replace real layout inspection.

Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` for affected packages, and report actual outcomes and any existing failures. No implementation checks have been run for this document-only draft.

## Review and approval record

- **Interview decisions:** recorded above.
- **Brainstorm readiness:** confirmed and completed.
- **Goldfish brainstorm reviews:** 6 parallel audit lenses completed:
  - Codebase Details (`docs/designs/reviews/storefront-product-detail/brainstorm-codebase.md`)
  - Comprehension (`docs/designs/reviews/storefront-product-detail/brainstorm-comprehension.md`)
  - Design Critic (`docs/designs/reviews/storefront-product-detail/brainstorm-design.md`)
  - Implementation Readiness (`docs/designs/reviews/storefront-product-detail/brainstorm-implementation-readiness.md`)
  - Structural Layout (`docs/designs/reviews/storefront-product-detail/brainstorm-structural.md`)
  - Skeptical Architect / Zoom-Out (`docs/designs/reviews/storefront-product-detail/brainstorm-zoom-out.md`)
- **Synthesis and resolution:** All 23 raw findings (0 Blockers, 5 Majors, 7 Nits) synthesized into [`docs/designs/reviews/storefront-product-detail/goldfish-brainstorm-report.md`](docs/designs/reviews/storefront-product-detail/goldfish-brainstorm-report.md). All proposed fixes auto-accepted and incorporated into this specification.
- **Implementation approval:** Pending explicit user approval. Dependency additions (`radio-group` and `field` from Base UI via shadcn CLI), lockfile changes, and shared UI component additions require explicit approval under AGENTS.md before any code is modified.
