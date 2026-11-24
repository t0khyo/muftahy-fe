# Domain Schemas

## Overview

Zod schemas and TypeScript types for all core domain objects. This is the single source of truth for the shape of product, customer, authentication, and platform data across the entire monorepo. Both runtime validation and static TypeScript types are derived from these schemas via `z.infer`.

## Interface

### Product & Catalog Schemas (`product.ts`)
- `[product.ts:categoryResponseSchema]` / `[product.ts:CategoryResponse]` / `[product.ts:Category]` — relational category entity (`id`, `name`, `code`, `slug`, `description`, `display_order`, `is_active`, `product_count`)
- `[product.ts:categoryCreateSchema]` / `[product.ts:CategoryCreateInput]` — category creation payload (`name`, `code`, `slug?`, `description?`, `display_order?`, `is_active?`)
- `[product.ts:categoryUpdateSchema]` / `[product.ts:CategoryUpdateInput]` — category partial update payload
- `[product.ts:categoryDetailResponseSchema]` / `[product.ts:CategoryDetailResponse]` — category response extended with `products: ProductResponse[]`
- `[product.ts:productImageResponseSchema]` / `[product.ts:ProductImageResponse]` / `[product.ts:ProductImage]` — product image entity (`id`, `file_path`, `alt_text`, `is_primary`, `display_order`, `file_size`, `mime_type`, `width`, `height`, `url`)
- `[product.ts:imageReorderRequestSchema]` / `[product.ts:ImageReorderRequest]` — batch image display order update payload (`items: [{ image_id, display_order }]`)
- `[product.ts:productResponseSchema]` / `[product.ts:ProductResponse]` / `[product.ts:Product]` — product entity (`id`, `name`, `category: CategoryResponse`, `sku`, `slug`, `variant`, `base_price`, `sale_price`, `effective_price`, `discount_percentage`, `stock_status`, `available_count`, `preorder_enabled`, `description`, `is_active`, `primary_image_url`, `images`)
- `[product.ts:productCreateSchema]` / `[product.ts:ProductCreateInput]` — admin product creation payload (`name`, `category_id`, `sku`, `slug?`, `variant?`, `base_price`, `sale_price?`, `preorder_enabled?`, `is_active?`, `description?`)
- `[product.ts:productUpdateSchema]` / `[product.ts:ProductUpdateInput]` — admin product update payload
- `[product.ts:isUuid]` `(value: string): boolean` — checks if string is a valid UUID
- `[product.ts:slugify]` `(text: string, maxLength?: number): string` — derives URL-safe ASCII slug (empty string if no ASCII alphanumerics)
- `[product.ts:validateSkuForCategory]` `(sku: string, categoryCode: string): boolean` — verifies 4-segment uppercase SKU format and category code prefix match

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
