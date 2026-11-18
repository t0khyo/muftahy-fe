# API Services

## Overview

Defines the core service TypeScript interfaces — the primary architectural seam between UI surfaces and backend data transport. All hooks and components depend on these interfaces, never on concrete adapters directly. The factory selects the active implementation at runtime.

## Interface

### ProductService (`product-service.ts`)
- `[product-service.ts:ProductService]` `interface ProductService`
  - `[product-service.ts:ProductService.list]` `list(filter?: ProductListFilter): Promise<ProductListResult>` — returns paginated product result matching criteria
  - `[product-service.ts:ProductService.listByCollection]` `listByCollection(collection: ProductCollection): Promise<Product[]>` — returns products for a named collection ('best-sellers', 'deals', 'new')
  - `[product-service.ts:ProductService.getFilterCounts]` `getFilterCounts(filter?: ProductListFilter): Promise<ProductFilterCounts>` — returns aggregated facet counts for filters
  - `[product-service.ts:ProductService.getBySlug]` `getBySlug(slug: string): Promise<Product | null>` — lookup by URL slug; returns `null` when not found
  - `[product-service.ts:ProductService.getById]` `getById(id: string): Promise<Product | null>` — lookup by ID; returns `null` when not found
  - `[product-service.ts:ProductService.getSampleLicenseKey]` `getSampleLicenseKey(productId: string): Promise<string>` — returns an obfuscated mock key string

### AuthService (`auth-service.ts`)
- `[auth-service.ts:AuthService]` `interface AuthService`
  - `login(credentials: LoginRequest): Promise<TokenResponse>` — authenticates customer credentials
  - `register(payload: RegisterRequest): Promise<RegisterSuccessResponse>` — creates new customer account
  - `loginWithGoogle(payload: GoogleLoginRequest): Promise<TokenResponse>` — exchanges Google OAuth authorization code
  - `refreshToken(refreshToken: string): Promise<TokenResponse>` — rotates refresh token and obtains fresh access token
  - `logout(refreshToken?: string): Promise<LogoutResponse>` — terminates session and revokes refresh token
  - `requestPasswordReset(payload: PasswordResetRequest): Promise<PasswordResetRequestResponse>` — requests 6-digit recovery OTP
  - `confirmPasswordReset(payload: PasswordResetConfirm): Promise<PasswordResetConfirmResponse>` — verifies OTP and updates password
  - `requestOtp(payload: OTPRequest): Promise<OTPRequestResponse>` — requests generic email verification OTP
  - `verifyOtp(payload: OTPVerify): Promise<OTPVerifyResponse>` — validates email verification OTP
  - `adminLogin(credentials: LoginRequest): Promise<TokenResponse>` — authenticates administrative staff

### UserService (`user-service.ts`)
- `[user-service.ts:UserService]` `interface UserService`
  - `getProfile(): Promise<UserProfile>` — queries authenticated customer profile
  - `updateProfile(payload: UpdateProfileRequest): Promise<UserProfile>` — updates mutable customer details

## Invariants

- All methods return Promises; asynchronous execution is guaranteed across all implementations.
- `getBySlug` and `getById` return `null` (never throw) when the requested entity is absent.
- `getSampleLicenseKey` returns a simulated key for reveal/copy interaction tests without exposing actual licenses.

## Side Effects

- Interface definitions only. Concrete side effects are delegated to adapter implementations.

## Verification

- Run: `pnpm test`
