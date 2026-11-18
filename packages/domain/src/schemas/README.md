# Domain Schemas

## Overview

Zod schemas and TypeScript types for all core domain objects. This is the single source of truth for the shape of product, customer, authentication, and platform data across the entire monorepo. Both runtime validation and static TypeScript types are derived from these schemas via `z.infer`.

## Interface

### Product & Catalog Schemas (`product.ts`)
- `[product.ts:supportedCurrencySchema]` / `[product.ts:MoneyValue]` — enum of supported ISO 4217 currency codes; `[product.ts:moneySchema]` validates `amountMinor` (non-negative integer) and `currency`
- `[product.ts:productCategorySchema]` / `[product.ts:ProductCategory]` — `'games' | 'software' | 'subscriptions' | 'gift-cards'`
- `[product.ts:productPlatformSchema]` / `[product.ts:ProductPlatform]` — `'steam' | 'playstation' | 'xbox' | 'nintendo' | 'pc' | 'microsoft'`
- `[product.ts:productRegionSchema]` / `[product.ts:ProductRegion]` — `'global' | 'gcc' | 'eg' | 'mena' | 'us' | 'eu'`
- `[product.ts:localizedStringSchema]` / `[product.ts:LocalizedString]` — `{ en: string; ar: string }` where both are non-empty strings
- `[product.ts:productPlanSchema]` / `[product.ts:ProductPlan]` — product edition/tier schema (`id`, `slug`, `title`, `price`, `stock`, `deliveryType`)
- `[product.ts:productSpecsSchema]` / `[product.ts:ProductSpecs]` — technical specifications (developer, publisher, releaseDate, languages, requirements)
- `[product.ts:productFaqItemSchema]` / `[product.ts:ProductFaqItem]` — FAQ item with bilingual question and answer
- `[product.ts:productMediaItemSchema]` / `[product.ts:ProductMediaItem]` — media assets (type 'image' | 'video', url, optional alt/thumbnail)
- `[product.ts:productSchema]` / `[product.ts:Product]` — full product entity schema including bilingual fields, plans, specs, FAQs, and tags
- `[product.ts:getSummaryPlan]` `(product: Product): ProductPlan` — helper resolving the primary active or default plan for display
- `[product.ts:productCollectionSchema]` / `[product.ts:ProductCollection]` — `'best-sellers' | 'deals' | 'new'`
- `[product.ts:productSortOptionSchema]` / `[product.ts:ProductSortOption]` — `'featured' | 'best-selling' | 'price-asc' | 'price-desc' | 'newest'`
- `[product.ts:productListFilterSchema]` / `[product.ts:ProductListFilter]` — filter bag for catalog filtering and pagination
- `[product.ts:ProductListResult]` — paginated response envelope (`items`, `total`, `page`, `pageSize`, `hasMore`)
- `[product.ts:FilterOptionCount]` / `[product.ts:ProductFilterCounts]` — faceted search filter count interfaces

### Authentication & Profile Schemas (`auth.ts`)
- `[auth.ts:loginRequestSchema]` / `[auth.ts:LoginRequest]` — `{ email, password }` credential submission schema
- `[auth.ts:registerRequestSchema]` / `[auth.ts:RegisterRequest]` — `{ email, password, full_name, phone? }` customer registration schema
- `[auth.ts:updateProfileRequestSchema]` / `[auth.ts:UpdateProfileRequest]` — `{ full_name?, phone? }` customer profile update schema
- `[auth.ts:googleLoginRequestSchema]` / `[auth.ts:GoogleLoginRequest]` — `{ code }` Google OAuth authorization code exchange schema
- `[auth.ts:refreshTokenRequestSchema]` / `[auth.ts:RefreshTokenRequest]` — `{ refresh_token }` token rotation schema
- `[auth.ts:passwordResetRequestSchema]` / `[auth.ts:PasswordResetRequest]` — `{ email }` password reset initiation schema
- `[auth.ts:passwordResetConfirmSchema]` / `[auth.ts:PasswordResetConfirm]` — `{ email, code, new_password }` password reset completion schema
- `[auth.ts:otpRequestSchema]` / `[auth.ts:OTPRequest]` — `{ email, purpose? }` OTP request schema
- `[auth.ts:otpVerifySchema]` / `[auth.ts:OTPVerify]` — `{ email, code, purpose? }` OTP verification schema
- `[auth.ts:tokenResponseSchema]` / `[auth.ts:TokenResponse]` — `{ access_token, refresh_token, token_type: 'bearer', expires_in }` JWT token response
- `[auth.ts:userProfileSchema]` / `[auth.ts:UserProfile]` — `{ id, email, full_name, phone, is_active, created_at }` authenticated customer entity schema
- `[auth.ts:apiErrorResponseSchema]` / `[auth.ts:ApiErrorResponse]` — `{ error_code, message, details, retry_after? }` backend error payload schema

## Invariants

- `[product.ts:moneySchema]` `amountMinor` must be a non-negative integer — floating-point money values are rejected at schema validation.
- `[product.ts:localizedStringSchema]` Both `en` and `ar` must be non-empty strings (`min(1)`); partial translations are disallowed.
- `[product.ts:productSchema]` `deliveryType` defaults to `'instant'`; `featured` defaults to `false`.
- `[product.ts:productSchema]` `coverImage` requires an absolute URL or path starting with `/`.
- `[product.ts:getSummaryPlan]` Prioritizes in-stock default plan, first in-stock plan, or first defined plan; generates fallback default plan if none exists.
- `[product.ts:productListFilterSchema]` `page` and `pageSize` must be positive integers if specified.
- `[auth.ts:passwordSchema]` Password must be at least 8 characters long across registration and password reset confirmation.
- `[auth.ts:otpCodeSchema]` Verification code must be exactly 6 numeric digits (`/^\d{6}$/`).
- `[auth.ts:emailSchema]` Email strings are automatically trimmed and normalized to lowercase during schema parsing.
- `[auth.ts:apiErrorResponseSchema]` `details` defaults to an empty object `{}` when omitted by the server response; `retry_after` captures numeric rate limit delays.

## Side Effects

- None. Schema validation and plan derivation are pure and synchronous.

## Verification

- Run: `pnpm test`
