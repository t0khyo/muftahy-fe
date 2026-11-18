# Storefront and Admin Authentication Integration

* **Author:** Abdelrahman Eltokhy
* **Date:** 2026-11-18

## Overview

A unified, zero-dependency authentication and session management architecture across the customer-facing storefront (`apps/storefront`) and operator admin dashboard (`apps/admin`). The system integrates with the backend API documented in `docs/examples/authentication.md` through a native `fetch` client in `@workspace/api`, avoiding external dependencies such as Axios. The scope encompasses customer registration with background auto-login, email/password authentication, Google OAuth popup sign-in with in-app browser detection, email OTP verification, password reset, a dual-state storefront header account dropdown, protected `/account` profile routing with sanitized `returnTo` preservation, and an admin authentication boundary with strict token audience verification.

Visual design follows the principles in `.agents/skills/design-taste-frontend`: purposeful typography, semantic theme tokens, anti-slop copy, quiet micro-interactions, equal edges, and first-class Arabic (RTL) / English (LTR) balance.

## Analysis

### Synthesized Multi-Lens Review

1. **The 401 Thundering Herd and Token Desynchronization (Inventive Catalyst & Implementation Readiness):**
   - The backend issues single-use UUID refresh tokens that rotate on every call to `POST /api/v1/auth/refresh`. If multiple parallel data queries fail with `401 Unauthorized` simultaneously, triggering multiple refresh calls invalidates the session and locks the user out.
   - *Resolution:* Implement a Single-Flight Refresh Promise Latch in the native `fetch` client. When the first 401 occurs, an active refresh promise is cached. All subsequent 401 requests register their resolution callbacks in an in-memory queue awaiting that flight. On success, the queue drains with the new access token; on failure, tokens are purged and unauthenticated callbacks reject together.

2. **Multi-App Localhost Token Collision and Audience Isolation (Codebase Details & Design):**
   - Both Storefront (`aud: "customer"`) and Admin (`aud: "admin"`) share the `localhost` origin during development. Generic storage keys (`access_token`, `refresh_token`) cause token overwrite and cross-contamination.
   - *Resolution:* Encapsulate storage behind a `TokenStorage` abstraction that enforces app-scoped storage prefixes (`muftahy_storefront_` vs `muftahy_admin_`). On application bootstrap, the client optimistically decodes the JWT payload and purges credentials if `aud` does not match the application's required audience.

3. **Registration Friction vs. Verification Status (Comprehension & UX):**
   - `POST /auth/register` creates accounts without issuing JWT tokens.
   - *Resolution:* The frontend executes an immediate background login (`POST /auth/login`) with the submitted credentials, discarding raw password values from memory immediately upon completion. If login succeeds, the user enters an active session with a non-blocking email verification notification. If the API returns `PERMISSION_DENIED` or indicates unverified status, the UI transitions directly to the OTP verification screen (`POST /auth/otp/verify`) with the email address pre-filled, without sending the user back to the login form.

4. **Third-Party OAuth in Constrained Mobile WebViews (UX & Inventive Catalyst):**
   - In-app browsers (Instagram, Facebook, TikTok) frequently block Google OAuth popups and `window.open` calls.
   - *Resolution:* Inspect the `User-Agent` string on the client. If an in-app WebView is detected, suppress or visually flag the Google OAuth button and display a localized prompt instructing the user to sign in with email/password or open the storefront in their system browser. If `VITE_GOOGLE_CLIENT_ID` is unset, hide the button and log a development-only warning.

5. **Open Redirect Defense via `returnTo` (Comprehension & Security):**
   - Unauthenticated visitors hitting protected account routes are redirected to `/:lang/login?returnTo=<path>`.
   - *Resolution:* Strict whitelist validation ensures `returnTo` begins with a single `/` and does not begin with `//` or `/\`, nor contain URI schemes (`http:`, `javascript:`, `data:`). Invalid values fall back to `/:lang/account`.

6. **Base UI Composition and Monorepo Constraints (Codebase Details & Structural):**
   - Per project directives, `@radix-ui/*` and `asChild` are forbidden; all UI primitives adhere to Base UI patterns using the `render` prop and semantic theme tokens.
   - `packages/ui` now exports an accessible `input-otp` component built on `input-otp` and semantic tokens with full RTL support.
   - `apps/admin` will be configured with React Router v7, connecting `@workspace/api`, `@workspace/domain`, and `@workspace/i18n` using workspace package links.

## Goals vs. Non-Goals

* **In-Scope Goals:**
  - `AuthService` interface and native `fetch` HTTP client in `@workspace/api` implementing all endpoints from `authentication.md`.
  - Single-flight refresh token rotation latch with concurrent 401 request queueing.
  - App-prefixed `TokenStorage` abstraction with client-side audience claim validation.
  - Storefront customer login (`login-03`), signup (`signup-03`), and password reset flows.
  - Base UI `input-otp` component (installed in `packages/ui`) for OTP verification and password reset confirm.
  - Google OAuth popup authorization-code flow with in-app browser detection and missing-key degradation.
  - Dual-state storefront header account dropdown (unauthenticated: Sign In/Register; authenticated: User pill, Profile link, Logout).
  - Protected storefront `/account` route layout and guard with sanitized `returnTo` parameter preservation.
  - Storefront `/account` profile view connected to `GET /api/v1/users/me`.
  - Admin app React Router v7 setup, `/login` route, `aud === "admin"` guard, and minimal dashboard placeholder (`dashboard-01`).
  - Full bilingual Arabic (RTL) and English (LTR) support with semantic design tokens and Western digits.

* **Out-of-Scope Non-Goals:**
  - Full Order History, Key Library, and Ticket management implementations (explicitly deferred to subsequent feature milestones).
  - Adding external HTTP dependencies (`axios`) or modifying `pnpm-lock.yaml`.
  - SMS OTP verification (API contract is email-only).
  - Admin self-registration or customer password changes (backend API lacks authenticated customer password change endpoint; only unauthenticated reset flow exists).
  - Auth modal dialogs (dedicated URL route pages used instead for bookmarkability and deep-linking).

## Alternatives Weighed

- *Axios Interceptor vs. Native Fetch Wrapper:*
  The `authentication.md` document proposed an Axios interceptor. Rejected by author to adhere to monorepo rules against lockfile modification and unvetted third-party libraries. A native `fetch` wrapper provides identical queueing and header management with zero bundle overhead.
- *Full Account Views vs. Focused Profile View:*
  Implementing orders, payment receipt uploads, digital key reveals, and ticket threads was evaluated. Rejected by author to prevent scope inflation and maintain focus on authentication and session integrity.
- *Auth Modal Sheets vs. Dedicated Route Pages:*
  Presenting login/signup inside slide-over sheets was considered. Rejected by author to ensure bookmarkability, predictable back-button behavior, and deep-linking with `returnTo`.
- *Generic Storage Keys vs. App-Prefixed Keys:*
  Generic `access_token` storage was rejected due to token audience collisions (`aud: customer` vs `aud: admin`) when running both applications on `localhost`.

## Key Decisions & Staging for Next Steps

1. **API Client & Token Storage:** Implement `@workspace/api/src/adapters/http/fetch-client.ts` and `token-storage.ts`.
2. **Domain Schemas:** Define Zod schemas and TypeScript types in `@workspace/domain/src/schemas/auth.ts`.
3. **UI Components:** Utilize `packages/ui/src/components/input-otp.tsx` and adapt `login-03` / `signup-03` with anti-slop frontend taste.
4. **Storefront Auth & Header:** Build login, register, OTP/reset routes, and update `site-header` with dual-state account menu.
5. **Protected Account Shell:** Scaffold `/:lang/account` layout and connected profile view.
6. **Admin Routing & Login:** Set up React Router v7 in `apps/admin` with `/login` and guarded dashboard shell.
