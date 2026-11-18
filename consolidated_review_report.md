# EGM Consolidated Review Report: Storefront & Admin Authentication Technical Design

**Target Document:** [`docs/designs/storefront-admin-authentication.md`](file:///home/abdelrahman/dev/muftahy/muftahy-fe/docs/designs/storefront-admin-authentication.md)  
**Standard Enforced:** Feature Technical Specification Standards & Implementation Readiness Standards  
**Review Type:** Full EGM Review Pipeline (Preset 1 - Uninterrupted Multi-Stage Consensus)  
**Date:** 2026-11-18  

---

## Executive Summary

The Technical Design for Storefront and Admin Authentication Integration has completed a comprehensive, 5-stage automated EGM review across 7 independent reviewer personas (`egm-zoom-out`, `egm-inventive-catalyst`, `egm-comprehension`, `egm-design`, `egm-structural`, `egm-style`, and `egm-implementation-readiness`).

The core architectural direction—utilizing native `fetch` with no heavy HTTP dependencies, establishing strict storage namespace isolation between customer and admin sessions (`muftahy_storefront_*` vs `muftahy_admin_*`), enforcing Base UI and semantic design tokens, and adhering to first-class bilingual routing—was validated as sound. However, the review surfaced critical failure modes in token lifecycle handling, cross-tab concurrency, standalone mock portability, provider mounting, and implementation phasing.

---

## Review Stage Audits & Report Manifest

| Review Stage | Subagent Persona(s) | Generated Report Artifact | Status | Findings (B / M / N) |
| :--- | :--- | :--- | :--- | :--- |
| **Stage 5: Initial Zoom Out** | `egm-zoom-out`, `egm-inventive-catalyst` | [`zoom_out_report.md`](file:///home/abdelrahman/dev/muftahy/muftahy-fe/zoom_out_report.md) | Completed | 2 / 5 / 2 |
| **Stage 6: Comprehension Test** | `egm-comprehension` | [`comprehension_report.md`](file:///home/abdelrahman/dev/muftahy/muftahy-fe/comprehension_report.md) | Completed | 0 / 1 / 3 |
| **Stage 7: Critic Review** | `egm-design`, `egm-structural`, `egm-style` | [`critic_report.md`](file:///home/abdelrahman/dev/muftahy/muftahy-fe/critic_report.md) | Completed | 3 / 5 / 3 |
| **Stage 8: Intermediate Zoom Out** | `egm-zoom-out` | [`intermediate_zoom_out_report.md`](file:///home/abdelrahman/dev/muftahy/muftahy-fe/intermediate_zoom_out_report.md) | Completed | 4 / 5 / 3 |
| **Stage 9: Implementation Readiness**| `egm-implementation-readiness`, `egm-codebase-details`, `egm-style` | [`implementation_readiness_report.md`](file:///home/abdelrahman/dev/muftahy/muftahy-fe/implementation_readiness_report.md) | Completed | 3 / 5 / 3 |

**Consolidated Total Deduplicated Findings:**
- 🔴 **Blockers**: 7
- 🟡 **Majors**: 13
- 🟢 **Nits**: 8

---

## 🔴 Blocker Findings (Must Be Resolved Before Execution)

### B1. Token Lifecycle & Session Bootstrap Gap (Premature Cache Purge & Missing Silent Hydration)
* **Sources:** Stage 5 (#1), Stage 7 (#2), Stage 8 (#1)
* **Affected Scope:** Lines 153–165, 185, 195, 220–251
* **Discrepancy:**
  The design specifies that `TokenStorage` decodes the JWT access token and immediately purges storage if the token is expired. This destroys the valid 30-day UUID refresh token before `NativeFetchClient` can dispatch `POST /api/v1/auth/refresh`. Furthermore, on initial page loads, `AccountGuard` synchronously evaluates `isAuthenticated` and immediately bounces returning users to `/login`, bypassing the 30-day refresh token completely.
* **Resolution:**
  1. Decouple access token expiration from refresh token storage: `TokenStorage` must only clear tokens if the `aud` claim mismatches, if the refresh token is missing/invalid, or if `POST /auth/refresh` explicitly returns `401`.
  2. Implement an initial session hydration state in `useAuth` (`isInitializing: true`). If a refresh token exists on app mount, hold route guards until a background silent refresh/session verification query resolves.

---

### B2. Cross-Tab Refresh Token Race Condition Triggers Backend Token-Reuse Lockout
* **Sources:** Stage 5 (#6), Stage 7 (#2), Stage 8 (#2)
* **Affected Scope:** Lines 217–251, 316
* **Discrepancy:**
  The backend issues single-use UUID refresh tokens with token-reuse detection. In-memory latches (`isRefreshing`) are scoped to a single tab. If two tabs experience 401s simultaneously, both tabs dispatch `POST /auth/refresh` with the identical old refresh token. The backend flags the second request as token reuse, immediately revoking all user sessions.
* **Resolution:**
  1. Coordinate token rotation across tabs using the Web Locks API:
     ```typescript
     await navigator.locks.request('muftahy_auth_refresh', async () => {
       if (tokenStorage.hasFreshAccessToken()) return;
       await performTokenRefresh();
     });
     ```
  2. Synchronize rotated tokens across open tabs via `window.addEventListener('storage', ...)`.

---

### B3. Missing Mock Service Adapters Violates Standalone Monorepo Mandate
* **Sources:** Stage 5 (#3), Stage 8 (#3)
* **Affected Scope:** Lines 101–113, 166–172, 384–398
* **Discrepancy:**
  [`AGENTS.md`](file:///home/abdelrahman/dev/muftahy/muftahy-fe/AGENTS.md) mandates: *"Current scope: frontend UI only. There is no backend. Do not invent one... Mock data is typed and lives behind a thin service layer"*. Specifying only HTTP adapters targeting `http://localhost:8000` breaks offline UI development, tests, and CI whenever a backend container is not running.
* **Resolution:**
  1. Implement `MockAuthAdapter` and `MockUserAdapter` in `packages/api/src/adapters/mock/` with stateful in-memory mock storage.
  2. Update `packages/api/src/factory.ts` to conditionally return mock vs HTTP adapters based on `VITE_USE_MOCK_API === "true"` or absence of `VITE_API_URL`.

---

### B4. Missing Dependencies, Providers, and Locale Layout in `apps/admin`
* **Sources:** Stage 5 (#2), Stage 8 (#4), Stage 9 (#2, #3)
* **Affected Scope:** Lines 95–100, 119–120, 203–214, 520–524
* **Discrepancy:**
  `apps/admin/package.json` omits `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, and `react-i18next`. Furthermore, `App.tsx` lacks `QueryClientProvider` and `I18nextProvider`, triggering immediate runtime crashes. Additionally, `apps/admin` routes omit the mandatory `/:lang` prefix, and modifying dependencies touches `pnpm-lock.yaml`, requiring prior user approval per [`AGENTS.md`](file:///home/abdelrahman/dev/muftahy/muftahy-fe/AGENTS.md).
* **Resolution:**
  1. Specify the exact dependencies and versions to add to `apps/admin/package.json`.
  2. Wrap `apps/admin/src/App.tsx` with `QueryClientProvider` and `I18nextProvider`.
  3. Align admin route structure to include `/:lang/login` and localized shell layouts.
  4. Note the explicit requirement to prompt the user before updating `pnpm-lock.yaml`.

---

### B5. Absence of Phasing and Incremental Verification Checkpoints in Implementation Plan
* **Sources:** Stage 9 (#1)
* **Affected Scope:** Lines 326–576
* **Discrepancy:**
  Section 3 groups file changes strictly by repository package without chronological phasing or intermediate verification gates, violating the Implementation Readiness Standard.
* **Resolution:**
  Partition Section 3 into 7 chronological execution phases:
  - **Phase 1:** Domain Schemas & Contracts (`@workspace/domain`)
  - **Phase 2:** Transport, Storage & Adapters (`@workspace/api`)
  - **Phase 3:** Bilingual Catalogs (`@workspace/i18n`)
  - **Phase 4:** Storefront Authentication Feature & Forms (`apps/storefront`)
  - **Phase 5:** Protected Account Layout & Site Header (`apps/storefront`)
  - **Phase 6:** Admin Routing, Providers & Login Gate (`apps/admin`)
  - **Phase 7:** End-to-End Monorepo Verification & Definition of Done

---

### B6. Omission of Provider Mount Point from File Boundaries (`providers.tsx`)
* **Sources:** Stage 9 (#2)
* **Affected Scope:** Lines 418–422, 508–512, 555–558
* **Discrepancy:**
  The plan specifies `use-auth.ts` as a React context & hook, but completely omits `apps/storefront/src/app/providers.tsx` and `auth-provider.tsx` from the file manifest, leaving the implementer without an authorized mount point.
* **Resolution:**
  Add `apps/storefront/src/features/auth/context/auth-context.tsx` to Target Files to Create, and add `apps/storefront/src/app/providers.tsx` to Target Files to Modify with explicit provider nesting instructions (`<QueryProvider>` -> `<AuthProvider>`).

---

### B7. Missing Mandatory Top-Level "Risks & Mitigations" Section
* **Sources:** Stage 7 (#1), Stage 8 (#8)
* **Affected Scope:** Top-level document structure (between Line 304 and Line 326)
* **Discrepancy:**
  The technical specification standard mandates a dedicated `## Risks & Mitigations` section. While individual security aspects are mentioned in narrative text, system failure modes and mitigations are not systematically documented.
* **Resolution:**
  Insert a dedicated `## Risks & Mitigations` section covering token race conditions, WebView OAuth limitations, dual-call registration failures, and rate-limit lockouts.

---

## 🟡 Major Findings (Significant Quality & Operational Issues)

1. **Storefront `returnTo` / `returnUrl` Sanitization Strips Mandatory Locale Prefix:** `sanitizeReturnTo` must ensure the sanitized path retains or prepends the active `/:lang/` prefix (Stage 7 #3).
2. **Flattened `/account` Route Architecture Creates Dead-End for Nested Portal:** Configure `/:lang/account` as a layout route rendering `<AccountGuard><AccountLayout><Outlet /></AccountLayout></AccountGuard>` with an index redirect to `/account/profile` (Stage 5 #4, Stage 8 #5).
3. **Fragile Dual-Call Registration State Machine Leaves User Stranded on Login Failure:** If `POST /register` succeeds but background `POST /login` fails, transition immediately to `/login` with email prefilled and an informational alert (Stage 5 #7, Stage 7 #5, Stage 8 #7).
4. **TanStack Query Cache Not Purged on Session Termination:** Mandate `queryClient.clear()` on `logout` and terminal 401 latch failure to prevent data leakage between user sessions (Stage 8 #6).
5. **Base64URL Decoding Failure with Standard `atob()`:** Add a base64url-to-base64 normalizer (`replace(/-/g, '+').replace(/_/g, '/')` + padding) before `atob()` (Stage 7 #4).
6. **Underspecified Service & Adapter Interface Signatures:** Provide explicit TypeScript function signatures, parameter types, and return types for `AuthService` and `UserService` in the design (Stage 9 #4).
7. **Missing `updateProfileRequestSchema` in Domain Schema Package:** Add `updateProfileRequestSchema` and `UpdateProfileRequest` to `packages/domain/src/schemas/auth.ts` (Stage 9 #5).
8. **Subpath Export Resolution Breakdown for Nested HTTP Adapters:** Update `packages/api/package.json` exports or re-export `TokenStorage` from top-level entries (Stage 9 #6).
9. **Vague Verification Plan Lacking Concrete Storefront Test Files:** Add concrete test files (`use-auth.test.ts`, `sanitize-return-to.test.ts`, `account-guard.test.tsx`) with specified edge case scenarios (Stage 9 #7).
10. **Missing Environment Configuration (`.env.example` & `vite-env.d.ts`):** Add `.env.example` and environment type definitions for `VITE_GOOGLE_CLIENT_ID` and `VITE_API_URL` (Stage 9 #8).
11. **Google OAuth Button in In-App Mobile WebViews:** Lazy-load the GSI script on demand and disable the Google button with an external browser hint in WebViews (Stage 5 #5, Stage 7 #6, Stage 8 #9).
12. **Domain `apiErrorResponseSchema` Missing `retry_after` Field:** Add `retry_after?: number` to `apiErrorResponseSchema` for 429 rate-limiting responses (Stage 6 #4, Stage 7 #7).
13. **Customer Email OTP Verification Missing Explicit UI Specifications:** Add `verify-otp-dialog.tsx` or an account banner component to target files (Stage 6 #1).

---

## 🟢 Nit Findings (Polish & Consistency)

1. **Remove EGM Jargon:** Eliminate "EGM Peanut Contract" and "EGM Blueprint" terms (Stage 6 #2).
2. **Clarify `useProfile` vs `useAuth` Responsibilities:** Explicitly note that `useAuth` manages authentication/session tokens, while `useProfile` manages user entity query cache (Stage 6 #3).
3. **Standardize Query Parameter (`returnTo` vs `returnUrl`):** Support both parameters in `sanitizeReturnTo` (`searchParams.get('returnTo') || searchParams.get('returnUrl')`) (Stage 8 #11, Stage 9 #9).
4. **Active Countdown UI on 429 Errors:** Bind `Retry-After` seconds to a disabled button countdown timer (Stage 5 #9).
5. **Altitude Control in Architecture Section:** Move raw helper implementation code blocks from Section 3 into the implementation plan (Stage 8 #10).
6. **Clean Up Meta-Narrative in Open Questions:** Remove retrospective phrasing from Line 52 (Stage 8 #12).
7. **Format Target Files as Markdown Links / Summary Table:** Replace raw paths with clean tables or markdown links (Stage 9 #10).
8. **Placeholder UI for Unimplemented Account Tabs:** Define clear disabled/coming-soon placeholder cards for Orders, Keys, and Support tabs (Stage 9 #11).

---

## Traceability Matrix

| Consolidated Finding ID | Category | Stage 5 (Zoom Out) | Stage 6 (Comprehension) | Stage 7 (Critic) | Stage 8 (Intermediate Zoom Out) | Stage 9 (Readiness) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **B1: Token Lifecycle & Silent Hydration** | 🔴 Blocker | Finding 1 | — | Finding 2 | Finding 1 | — |
| **B2: Cross-Tab Refresh Token Race** | 🔴 Blocker | Finding 6 | — | Finding 2 | Finding 2 | — |
| **B3: Standalone Mock Adapters** | 🔴 Blocker | Finding 3 | — | — | Finding 3 | — |
| **B4: Admin Dependencies & Providers** | 🔴 Blocker | Finding 2 | — | — | Finding 4 | Findings 2, 3 |
| **B5: Phased Implementation Plan** | 🔴 Blocker | — | — | — | — | Finding 1 |
| **B6: Provider Mount Points** | 🔴 Blocker | — | — | — | — | Finding 2 |
| **B7: Missing Risks & Mitigations** | 🔴 Blocker | — | — | Finding 1 | Finding 8 | — |
| **M1: `returnTo` Locale Prefix Preservation**| 🟡 Major | — | — | Finding 3 | — | — |
| **M2: Nested Account Route Portal** | 🟡 Major | Finding 4 | — | — | Finding 5 | — |
| **M3: Dual-Call Register Recovery State** | 🟡 Major | Finding 7 | — | Finding 5 | Finding 7 | — |
| **M4: Query Cache Purge on Session End** | 🟡 Major | — | — | — | Finding 6 | — |
| **M5: Base64URL Decoding Normalization** | 🟡 Major | — | — | Finding 4 | — | — |
| **M6: Concrete Interface Signatures** | 🟡 Major | — | — | — | — | Finding 4 |
| **M7: Add `updateProfileRequestSchema`** | 🟡 Major | — | — | — | — | Finding 5 |
| **M8: Subpath Export Resolution** | 🟡 Major | — | — | — | — | Finding 6 |
| **M9: Concrete Storefront Test Plan** | 🟡 Major | — | — | — | — | Finding 7 |
| **M10: Environment Configuration Typing** | 🟡 Major | — | — | — | — | Finding 8 |
| **M11: Google OAuth In-App WebView Guard**| 🟡 Major | Finding 5 | — | Finding 6 | Finding 9 | — |
| **M12: `retry_after` in Domain Schema** | 🟡 Major | — | Finding 4 | Finding 7 | — | — |
| **M13: Customer Email OTP UI Spec** | 🟡 Major | — | Finding 1 | — | — | — |
| **N1: Remove EGM Jargon** | 🟢 Nit | — | Finding 2 | — | — | — |
| **N2: Clarify `useProfile` Scope** | 🟢 Nit | — | Finding 3 | — | — | — |
| **N3: Support `returnUrl` & `returnTo`** | 🟢 Nit | Finding 8 | — | — | Finding 11 | Finding 9 |
| **N4: Active 429 Countdown UI** | 🟢 Nit | Finding 9 | — | — | — | — |
| **N5: Altitude Control in Architecture** | 🟢 Nit | — | — | — | Finding 10 | — |
| **N6: Clean Up Open Questions Meta-Text**| 🟢 Nit | — | — | — | Finding 12 | — |
| **N7: Link Target Files in Table** | 🟢 Nit | — | — | — | — | Finding 10 |
| **N8: Secondary Account Tabs Fallback** | 🟢 Nit | — | — | — | — | Finding 11 |

---

## Recommended Next Steps

1. **Update [`docs/designs/storefront-admin-authentication.md`](file:///home/abdelrahman/dev/muftahy/muftahy-fe/docs/designs/storefront-admin-authentication.md)**:
   Apply the consolidated resolutions for all 7 Blockers and 13 Majors directly to the design specification.
2. **Proceed to Execution Planning (`/egm:egm-plan`)**:
   Once the technical design document is updated and approved, proceed to partition the 7 verified phases into executable implementation tasks.
