# API Services

## Overview

Defines the core service TypeScript interfaces — the primary architectural seam between UI surfaces and backend data transport. All hooks and components depend on these interfaces, never on concrete adapters directly. The factory selects the active implementation at runtime.

## Interface

### ProductService (`product-service.ts`)
- `[product-service.ts:ProductService]` `interface ProductService`
  - `getProducts(params?: ProductFilterParams): Promise<ProductResponse[]>` — queries catalog products optionally filtered by category slug and `only_active`
  - `getPublicCategories(): Promise<CategoryResponse[]>` — queries active public categories sorted by display order
  - `getCategoryBySlug(slug: string): Promise<CategoryDetailResponse>` — queries category details and active products by URL slug
  - `getProductBySlug(slug: string): Promise<ProductResponse>` — queries a single product by SEO slug
  - `getAdminCategories(): Promise<CategoryResponse[]>` — admin listing of all categories including inactive ones
  - `createCategory(data: CategoryCreateInput): Promise<CategoryResponse>` — creates a new catalog category
  - `updateCategory(id: string, data: CategoryUpdateInput): Promise<CategoryResponse>` — updates category fields
  - `deleteCategory(id: string): Promise<{ message: string }>` — deletes an empty category
  - `getProductById(id: string): Promise<ProductResponse>` — queries product by UUID
  - `createProduct(data: ProductCreateInput): Promise<ProductResponse>` — creates a new product
  - `updateProduct(id: string, data: ProductUpdateInput): Promise<ProductResponse>` — updates product details
  - `deleteProduct(id: string): Promise<{ message: string }>` — deletes a product
  - `uploadProductImage(productId: string, input: ProductImageUploadInput): Promise<ProductImageResponse>` — uploads a product media image
  - `deleteProductImage(productId: string, imageId: string): Promise<{ message: string }>` — deletes an uploaded image
  - `setPrimaryProductImage(productId: string, imageId: string): Promise<ProductImageResponse>` — sets an image as primary
  - `reorderProductImages(productId: string, data: ImageReorderRequest): Promise<ProductImageResponse[]>` — reorders product images
  - `getSampleLicenseKey(productId: string): Promise<string>` — returns an obfuscated mock key string

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
