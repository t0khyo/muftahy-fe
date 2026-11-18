# Stage 6 (Comprehension Test) Report

Target File: `/home/abdelrahman/dev/muftahy/muftahy-fe/docs/designs/storefront-admin-authentication.md`  
Scope: FeatureRange (lines 1..325), DetailedRange (lines 326..576)

---

## Feature Specification Paraphrase

### What this proposes
The feature specification proposes a unified, type-safe client authentication architecture for both the customer-facing Storefront and the operator Admin dashboard using native browser `fetch` without third-party HTTP libraries. It introduces customer registration with automatic background sign-in, credential and Google OAuth popup authentication, email OTP verification, password recovery via Base UI OTP inputs, dual-state account navigation in the site header, and protected customer profile routes that preserve sanitized relative redirect URLs (`returnTo`). To maintain multi-tenant session isolation and resilience on shared origins (`localhost`), it establishes app-scoped local storage key prefixes (`muftahy_storefront_*` and `muftahy_admin_*`), token audience verification (`customer` vs `admin`), and an in-memory single-flight promise latch in the fetch client that prevents thundering-herd token refreshes upon encountering concurrent 401 responses.

### How the existing system works, per this document
Per the document, neither the storefront nor the admin application currently possesses an operational authentication or session management layer. The storefront header contains dead placeholder links to `/account` that trigger 404s or catch-all redirects, and retail customers have no UI to register, verify email OTPs, recover passwords, or inspect profile details. The admin application exists solely as an unrouted placeholder component (`App.tsx`) lacking authentication gates or role checks, exposing the raw shell to anyone visiting the app. Furthermore, `@workspace/api` currently lacks client-side authentication adapters, token storage abstractions, and refresh concurrency controls, which risks token cross-contamination between roles and single-use refresh token destruction during parallel 401 rotations.

---

## Implementation Plan Paraphrase

### What this proposes
The implementation plan details file additions and modifications across five workspace packages (`@workspace/domain`, `@workspace/api`, `packages/ui`, `@workspace/i18n`, `apps/storefront`, and `apps/admin`). It defines Zod request and response schemas in domain, builds a custom `NativeFetchClient`, `TokenStorage`, and HTTP adapters in the API package, adds bilingual translation keys across English and Arabic dictionaries, and creates presentation components and route modules for login, registration, password recovery, and profile display in the storefront. For the admin application, it introduces React Router v7 configuration, guarded dashboard routing requiring admin audience tokens, and an operator login view, validated by unit test suites for schema invariants, token storage isolation, and 401 refresh latching.

### How the existing system works, per this document
The plan describes an existing monorepo structure where domain schemas, API services, i18n dictionaries, and storefront components exist as isolated packages following strict directional boundaries, but lack authentication implementations. `apps/admin` currently has no router configuration, lacks workspace dependencies on `@workspace/api`, `@workspace/domain`, and `@workspace/i18n`, and renders a single static component. The storefront has an active routing tree and header shell, but lacks routes, guards, forms, and hooks for user identity and account management.

---

## Findings & Comprehension Gaps

### Finding 1: Missing UI Implementation and Workflow for Email OTP Verification
* **Severity**: Major
* **Affected Scope**: Lines 35, 59, 147–148, 167, and Section 4 (`apps/storefront` Target Files, lines 417–517).
* **Discrepancy Description & Rationale**:
  Goal 6 explicitly lists implementing "email OTP verification and password recovery flows using the installed Base UI input-otp component," and CUJ 1 specifies that newly registered users are shown a non-blocking "Verify your email" banner on `/:lang/account`. Schemas (`otpRequestSchema`, `otpVerifySchema`) and service methods (`requestOtp`, `verifyOtp`) are defined in domain and API layers. However, while password recovery has dedicated UI components and routes (`ForgotPasswordForm`, `ResetPasswordConfirmForm`, `forgot-password-route.tsx`), there are no components, modals, hooks, or routes specified for email OTP verification anywhere in `features/auth`, `features/account`, or the storefront target file list. A fresh reader cannot determine how a user interacts with the verification banner or where the 6-digit OTP input is rendered to verify an email address.

### Finding 2: Undefined Internal Methodology Jargon ("EGM", "Peanut Contract", "Blueprint")
* **Severity**: Nit
* **Affected Scope**: Lines 342, 347, 399, 402, 513, 516, 560, 562, 576.
* **Discrepancy Description & Rationale**:
  The implementation plan categorizes file scopes and documentation tasks using internal terms: "EGM Peanut Contract", "EGM Blueprint", "EGM Component Package contracts", and "EGM compliance". These terms are neither defined inline nor accompanied by links to project documentation or a team glossary. To a new team member joining the project without prior institutional context, the meaning and requirements of these documentation contracts are unclear.

### Finding 3: Ambiguity Between `useProfile` and `useAuth` Hook Responsibilities
* **Severity**: Nit
* **Affected Scope**: Lines 197, 420, 485.
* **Discrepancy Description & Rationale**:
  In Section 2.E (line 197) and Section 4 (line 485), `ProfilePage` is described as connecting to both `useAuth()` and `useProfile()` to query `GET /api/v1/users/me`. However, in the target file breakdown for `apps/storefront` (lines 418–422), only `use-auth.ts` is listed (which is specified to wrap `getUserService` and expose `user`), while no `use-profile.ts` hook file is scheduled for creation. It is ambiguous whether `useProfile` is planned as a separate hook or if user profile state is meant to be handled entirely by `useAuth()`.

### Finding 4: Unspecified Mechanism for 429 Rate-Limit Countdown Extraction
* **Severity**: Nit
* **Affected Scope**: Lines 318, 376–377.
* **Discrepancy Description & Rationale**:
  Section 3.2 (line 318) states that responses with `429 Too Many Requests` parse the `Retry-After` header and display a localized countdown timer to the user. However, neither the `NativeFetchClient` specification (lines 157–165, lines 374–378) nor `apiErrorResponseSchema` (line 150) explains how the `Retry-After` HTTP header is extracted from the raw response and passed to the UI layer to drive the countdown timer.
