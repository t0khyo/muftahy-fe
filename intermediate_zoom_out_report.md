# Stage 8 (Intermediate Zoom Out Review) Report: Storefront & Admin Authentication Integration

**Target:** `/home/abdelrahman/dev/muftahy/muftahy-fe/docs/designs/storefront-admin-authentication.md` (Full file, lines 1–576)  
**Standard Enforced:** `/home/abdelrahman/.gemini/config/plugins/egm/resources/document_standards/zoom-out-standard.md`  
**Reviewer Lens:** `egm-zoom-out`  
**Context Considered:** `docs/examples/authentication.md`, `docs/examples/customer-account-routes.md`, `zoom_out_report.md` (Stage 5), `critic_report.md` (Stage 7)

---

## Reviewer Status

| Reviewer | Status |
| --- | --- |
| `egm-zoom-out` | completed |

---

## Severity Breakdown

- 🔴 **Blocker**: 4
- 🟡 **Major**: 5
- 🟢 **Nit**: 3
- **Total Findings**: 12

---

## Executive Architectural Assessment

### 1. High-Level Architecture Simplicity & YAGNI
The design correctly identifies the need for zero external HTTP dependencies by avoiding Axios and lockfile churn, and introduces isolated namespaces (`muftahy_storefront_*` vs `muftahy_admin_*`). However, it suffers from two abstraction imbalances:
- **Premature detail in architecture**: Sections 3.2 and 3.3 embed 15 lines of raw helper implementations (`sanitizeReturnTo` and `isInAppBrowser`), violating altitude control without addressing higher-order system boundaries.
- **Factory ambivalence**: `getAuthService(app?: 'storefront' | 'admin')` leaves the coupling between `NativeFetchClient` and `TokenStorage` ambiguous. `NativeFetchClient` must have explicit dependency injection for its storage adapter and base URL to avoid state leakage between applications on `localhost`.

### 2. Cross-Cutting Implications of Stage 5 and Stage 7
- **Token Eviction vs. 401 Latch**: Stage 5 noted that `TokenStorage` clears storage on expired access tokens. Cross-cutting this with the session lifecycle reveals an even larger flaw: on initial page loads after token expiration, `AccountGuard` immediately redirects to `/login` because there is no bootstrap re-authentication sequence to exchange the 30-day refresh token.
- **Multi-Tab Token Invalidation**: The backend uses single-use UUID refresh tokens with token-reuse detection. Stage 5 highlighted multi-tab isolation; when multiple tabs encounter 401s simultaneously, in-memory latches fail across processes, causing concurrent refresh requests that trigger backend security lockouts.
- **Violation of Standalone Frontend Mandate**: `AGENTS.md` strictly dictates that the repo has no backend and requires mock service adapters. Providing only HTTP adapters hardcoded to `http://localhost:8000` breaks offline development, CI, and component test suites.

### 3. System-Level Coherence
Data flows hold together conceptually, but component boundaries have structural gaps:
- The route boundary for `/account` is flattened into a single route, creating an architectural dead-end contrary to `docs/examples/customer-account-routes.md`.
- TanStack Query caches are never explicitly purged upon session expiration or logout, leaving sensitive user data in memory.
- `apps/admin` lacks required query providers and locale routing (`/:lang`), preventing it from running or adhering to the monorepo's first-class bilingual mandate.

### 4. Remaining Unmitigated Risks
- Missing mandatory top-level `## Risks & Mitigations` section.
- Registration auto-login failure modes (dual-call race conditions).
- In-app mobile WebView Google OAuth blocks.

---

## Prioritized Findings (Blockers -> Major -> Nits)

### 1. Token Lifecycle & Session Bootstrap Gap (Premature Cache Purge & Missing Silent Hydration) - Severity: 🔴 Blocker
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 153–165, 185, 195, 220–251 (`TokenStorage`, `useAuth`, `AccountGuard`, `Single-Flight Refresh Latch`)
* **Discrepancy Description**: 
  The design specifies in Line 156:
  > *"On inspection, decodes the unverified base64url JWT payload (`JSON.parse(atob(...))`) in a safe `try/catch` to check `aud` and `exp`. If the audience mismatches or token has expired, storage is cleared immediately."*
  
  This creates two compounding systemic failures:
  1. **Destruction of 401 Latch**: When an access token expires (15 min lifespan) and an API call returns `401 Unauthorized`, `TokenStorage` has already cleared storage upon inspecting the expired token. The valid 30-day UUID refresh token is deleted before `NativeFetchClient` can dispatch `POST /api/v1/auth/refresh`.
  2. **Broken Session Rehydration on App Mount**: In `useAuth` and `AccountGuard`, authentication is checked synchronously. If a user revisits the site after 20 minutes (access token expired, but 30-day refresh token valid), `TokenStorage` clears the tokens and reports `isAuthenticated = false`. `AccountGuard` instantly redirects the user to `/login`. The 30-day refresh token is completely ignored on initial page loads, defeating its entire architectural purpose.
* **Rationale & Recommendation**: 
  Decouple access token expiration from refresh token storage:
  1. `TokenStorage` must only clear storage if: (a) `aud` claim does not match, (b) the refresh token is missing/invalid, or (c) `POST /auth/refresh` explicitly fails.
  2. Introduce an initial hydration phase in `useAuth` (`isInitializing: true`). On app mount, if a refresh token is present, suspend route guard redirection and issue a background silent refresh/session verification query before resolving `isAuthenticated`.

---

### 2. Cross-Tab Refresh Token Race Condition Triggers Backend Token-Reuse Lockout - Severity: 🔴 Blocker
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 217–251, 316 (`Single-Flight Refresh Latch` & Concurrency)
* **Discrepancy Description**: 
  Per `docs/examples/authentication.md` (lines 22–23), refresh tokens are single-use UUIDs rotated on every `POST /auth/refresh`. Reusing an old refresh token invalidates all sessions and triggers a security lock (`AUTHENTICATION_FAILED`).
  The design implements an in-memory promise latch (`isRefreshing = true`, `failedQueue`) inside `NativeFetchClient`. However, in-memory state is strictly scoped to a single browser tab. If a user has two tabs open when their access token expires, both tabs will concurrently execute `POST /auth/refresh` with the identical old refresh token. The second tab's request will be flagged by the backend as token reuse, immediately revoking all user sessions and locking the user out.
* **Rationale & Recommendation**: 
  Elevate concurrency synchronization from an in-memory latch to a cross-tab lock:
  1. Coordinate token rotation across tabs using the Web Locks API:
     ```typescript
     await navigator.locks.request('muftahy_auth_refresh', async () => {
       // Check if storage was already updated by another tab before dispatching
       if (tokenStorage.hasFreshAccessToken()) return;
       await performTokenRefresh();
     });
     ```
  2. Listen for native browser `window.addEventListener('storage', ...)` events so all tabs immediately synchronize the newly rotated access and refresh tokens.

---

### 3. Missing Mock Service Adapters Violates Monorepo Standalone Mandate (`AGENTS.md`) - Severity: 🔴 Blocker
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 101–113, 166–172, 384–398 (`packages/api/src/factory.ts` & adapters)
* **Discrepancy Description**: 
  `AGENTS.md` explicitly mandates:
  > *"Current scope: frontend UI only. There is no backend. Do not invent one... Mock data is typed and lives behind a thin service layer... Swapping mock services for real API calls later must require changes only inside the service layer."*
  
  The design specifies only `HttpAuthAdapter` and `HttpUserAdapter` hardcoded to `http://localhost:8000/api/v1`. If a developer runs `pnpm dev`, UI tests, or Playwright without a live backend container running on port 8000, all authentication operations fail with unhandled network errors.
* **Rationale & Recommendation**: 
  Preserve the standalone frontend architecture:
  1. Define `MockAuthAdapter` and `MockUserAdapter` in `packages/api/src/adapters/mock/` implementing `AuthService` and `UserService` using in-memory state.
  2. In `packages/api/src/factory.ts`, conditionally instantiate `MockAuthAdapter` or `HttpAuthAdapter` based on environment (`VITE_USE_MOCK_API === "true"` or when `VITE_API_URL` is unset).

---

### 4. Missing Dependencies, Providers, and Locale Layout in `apps/admin` - Severity: 🔴 Blocker
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 95–100, 119–120, 203–214, 520–524 (`apps/admin/package.json`, `App.tsx`, `router.tsx`)
* **Discrepancy Description**: 
  The architecture diagram states `UseAdminAuth --> TanStackQuery` (Line 120), and `AdminLoginForm` requires form validation. However, `apps/admin/package.json` omits `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, and `react-i18next`. Furthermore, `apps/admin/src/App.tsx` mounts `RouterProvider` without `QueryClientProvider` or `I18nextProvider`, triggering immediate runtime exceptions. Finally, `apps/admin/src/app/router.tsx` mounts unlocalized paths (`/login`, `/`) without `/:lang` route prefixes or layout handling, violating the monorepo's first-class bilingual requirement.
* **Rationale & Recommendation**: 
  1. Add `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, and `react-i18next` to `apps/admin/package.json`.
  2. In `apps/admin/src/App.tsx`, wrap the router tree in `QueryClientProvider` and `I18nextProvider`.
  3. Mirror the storefront localized routing pattern (`/:lang/login`, `/:lang/` with root layout managing `lang` and `dir`), or explicitly document a justified ADR exception.

---

### 5. Flattened Route Architecture Creates Architectural Dead-End for Nested Account Portal - Severity: 🟡 Major
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 488–492 (`apps/storefront/src/routes/account-route.tsx`) vs `docs/examples/customer-account-routes.md`
* **Discrepancy Description**: 
  `docs/examples/customer-account-routes.md` specifies that `/account` is a nested layout container with 5 dedicated sub-routes (`/account/profile`, `/account/orders`, `/account/keys`, etc.). The design specifies a single flat `account-route.tsx` that tightly embeds `ProfilePage` inside `AccountLayout`. This creates an architectural dead-end that will require destructive refactoring when Orders, Keys, and Support are integrated in subsequent sprints.
* **Rationale & Recommendation**: 
  Establish the nested route structure immediately:
  - Configure `/:lang/account` as a layout route rendering `<AccountGuard><AccountLayout><Outlet /></AccountLayout></AccountGuard>`.
  - Add an index route redirecting `/:lang/account` to `/:lang/account/profile`.
  - Mount `ProfilePage` under `/:lang/account/profile`.
  This allows placeholder navigation for other account tabs without refactoring route boundaries later.

---

### 6. TanStack Query Cache Not Purged on Session Termination - Severity: 🟡 Major
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 165, 185, 420 (Token invalidation & `useAuth.logout`)
* **Discrepancy Description**: 
  When a user logs out or when a 401 refresh latch fails, the design describes clearing tokens in `TokenStorage` and redirecting to `/login`. However, it fails to specify resetting or clearing the TanStack Query cache (`queryClient.clear()`). In-memory profile data (`/users/me`), order histories, and license keys remain active in the client memory cache. If a different user signs in on the same browser session, stale cached data can be rendered before fresh queries resolve.
* **Rationale & Recommendation**: 
  Explicitly mandate calling `queryClient.clear()` or `queryClient.resetQueries()` inside both the `logout()` action and the terminal 401 latch failure handler.

---

### 7. Fragile Dual-Call Registration State Machine Leaves User Stranded on Login Failure - Severity: 🟡 Major
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 58–60, 443–446 (CUJ 1 & `RegisterForm`)
* **Discrepancy Description**: 
  CUJ 1 chains `POST /api/v1/auth/register` (201 Created) directly into `POST /api/v1/auth/login`. If registration succeeds on the backend but the automatic follow-up login fails (transient network failure, 429 rate limit, or backend email-verification gate), the user remains stranded on the registration form. If they re-submit, the backend returns `400 EMAIL_ALREADY_EXISTS`.
* **Rationale & Recommendation**: 
  Implement an explicit fallback recovery state in `RegisterForm`: if `POST /register` succeeds but `POST /login` fails, immediately navigate to the Login view with the email prefilled and an informational alert: *"Account created successfully! Please enter your password to sign in."*

---

### 8. Missing Mandatory "Risks & Mitigations" Section - Severity: 🟡 Major
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Document structure (between Lines 304 and 326)
* **Discrepancy Description**: 
  The specification omits the mandatory top-level `## Risks & Mitigations` section required by `feature-spec-standard.md` and `zoom-out-standard.md`. While security details are scattered across Section 3 and Section Non-Functional Requirements, failure modes and operational constraints are not consolidated into a dedicated section.
* **Rationale & Recommendation**: 
  Add a top-level `## Risks & Mitigations` section explicitly detailing failure modes (token-reuse race conditions, in-app mobile WebView Google OAuth blocks, dual-call registration failures, and rate-limit lockouts) with their architectural mitigations.

---

### 9. Brittle User-Agent Regex Sniffing for Google OAuth in In-App WebViews - Severity: 🟡 Major
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 67–70, 267–273, 423–432 (`use-google-auth.ts`, `in-app-browser.ts`)
* **Discrepancy Description**: 
  Google OAuth strictly blocks OAuth requests originating from embedded mobile WebViews (`403 disallowed_useragent`). Detecting this via client-side User-Agent regex parsing (`isInAppBrowser()`) is brittle and prone to breaking as apps update their UA strings. Furthermore, unconditionally loading the external Google GSI client script on mount introduces unnecessary CSP overhead for users signing in with email/password.
* **Rationale & Recommendation**: 
  1. Lazy-load the Google Identity Services script only on hover/focus or initial click of the "Continue with Google" button.
  2. Provide a standard redirect flow fallback (`ux_mode: 'redirect'` or backend OAuth redirect URL) for in-app browser environments that routes out to the system browser.

---

### 10. Premature Detail / Altitude Violation in Architecture Section - Severity: 🟢 Nit
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 254–263 (`sanitizeReturnTo`) and Lines 268–273 (`isInAppBrowser`)
* **Discrepancy Description**: 
  Dumping 15 lines of raw helper utility code in the high-level architecture section violates altitude control (Section 3 of `zoom-out-standard.md`).
* **Rationale & Recommendation**: 
  Replace inline code blocks in Section 3 with contract specifications and behavioral descriptions. Move concrete code implementations to the implementation plan or feature source files.

---

### 11. Query Parameter Inconsistency (`returnTo` vs `returnUrl`) - Severity: 🟢 Nit
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Line 64, Line 255 vs `docs/examples/customer-account-routes.md` (Lines 38–42)
* **Discrepancy Description**: 
  `customer-account-routes.md` uses `?returnUrl=...` while the design document switches to `?returnTo=...`.
* **Rationale & Recommendation**: 
  Support both parameter keys in `sanitizeReturnTo` (`searchParams.get('returnTo') || searchParams.get('returnUrl')`) to preserve backward compatibility with existing links.

---

### 12. Meta-Justification in Open Questions - Severity: 🟢 Nit
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Line 52
* **Discrepancy Description**: 
  `None. (All architectural boundaries, storage isolation rules, and scope limits were resolved during the brainstorm phase).` contains meta-narrative about the design process.
* **Rationale & Recommendation**: 
  Simplify line 52 to `* None.` or list legitimate future considerations.
