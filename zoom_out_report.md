# Stage 5 (Initial Zoom Out Review) - Review Report

**Target:** `/home/abdelrahman/dev/muftahy/muftahy-fe/docs/designs/storefront-admin-authentication.md` (`lines 1..576`)
**Standards:** `/home/abdelrahman/.gemini/config/plugins/egm/resources/document_standards/zoom-out-standard.md`
**Goldfish Context:** `docs/examples/authentication.md`, `docs/examples/customer-account-routes.md`

---

## Reviewer Status

| Reviewer | Status |
| --- | --- |
| `egm-zoom-out` | completed |
| `egm-inventive-catalyst` | completed |

---

## Severity Breakdown
- 🔴 **Blocker**: 2
- 🟡 **Major**: 5
- 🟢 **Nit**: 2

---

## Prioritized Findings (Blockers -> Major -> Nits)

### 1. TokenStorage Premature Cache Purge Breaks 401 Silent Refresh Latch - Severity: Blocker
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 153–165, 220–251 (`TokenStorage` & `Single-Flight Refresh Latch`)
* **Discrepancy Description**: 
  The design specifies in Line 156:
  > *"On inspection, decodes the unverified base64url JWT payload (`JSON.parse(atob(...))`) in a safe `try/catch` to check `aud` and `exp`. If the audience mismatches or token has expired, storage is cleared immediately."*
  However, in the single-flight refresh latch sequence (Lines 230–238), when an access token expires (15 min lifespan) and API calls fail with `401 Unauthorized`, `NativeFetchClient` requests the 30-day UUID refresh token via `TokenStorage.getRefreshToken()`. If `TokenStorage` clears storage immediately upon seeing an expired access token, the valid refresh token is wiped out before the refresh request can be dispatched. This triggers an immediate, spurious session invalidation and logs the user out instead of performing the silent refresh.
* **Rationale & Recommendation**: 
  Decouple access token expiration from refresh token storage. `TokenStorage` should only clear itself if:
  1. The unverified `aud` claim does not match the app scope (`muftahy_storefront` vs `muftahy_admin`).
  2. The refresh token is explicitly missing or invalid.
  3. The backend explicitly returns `401 Unauthorized` during the `POST /api/v1/auth/refresh` rotation call.
  Allow `getRefreshToken()` to return the persisted UUID refresh token even when `getAccessToken()` reports expired.

---

### 2. Missing Dependencies and Query Providers in `apps/admin` - Severity: Blocker
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 95–100, 119–120, 203–214, 520–524 (`apps/admin/package.json` & `App.tsx`)
* **Discrepancy Description**: 
  The technical architecture specifies `UseAdminAuth --> TanStackQuery` (Line 120) and operator login form handling. However, in the implementation plan (Lines 520–524), `apps/admin/package.json` only adds `@workspace/api`, `@workspace/domain`, `@workspace/i18n`, and `react-router`. It omits `@tanstack/react-query`, `@hookform/resolvers`, `react-hook-form`, `zod`, and `react-i18next`. Furthermore, `apps/admin/src/App.tsx` only renders `RouterProvider` without `QueryClientProvider` or `I18nextProvider`.
* **Rationale & Recommendation**: 
  Running `useAdminAuth` or `AdminLoginForm` without `QueryClientProvider` will crash the admin app at runtime with `No QueryClient set, use QueryClientProvider to set one`.
  1. Add `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, and `react-i18next` to `apps/admin/package.json`.
  2. Update `apps/admin/src/App.tsx` to wrap `RouterProvider` with `QueryClientProvider`.
  3. Alternatively, if the admin authentication slice is meant to remain zero-dependency without TanStack Query, explicitly document that `useAdminAuth` manages local React state and decouples from TanStack Query.

---

### 3. Missing Mock Auth Adapters Violates Standalone Frontend Development (`AGENTS.md`) - Severity: Major
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 101–113, 166–172, 384–398 (`packages/api/src/factory.ts` & adapters)
* **Discrepancy Description**: 
  `AGENTS.md` mandates: *"Current scope: frontend UI only. There is no backend. Do not invent one... Mock data is typed and lives behind a thin service layer... Swapping mock services for real API calls later must require changes only inside the service layer."*
  The design specifies only `HttpAuthAdapter` and `HttpUserAdapter` targeting `http://localhost:8000/api/v1`. If a developer runs `pnpm dev` or UI testing without a live Python/Docker backend running locally on port 8000, all registration, login, and profile flows immediately throw uncaught `TypeError: Failed to fetch` network errors.
* **Rationale & Recommendation**: 
  `packages/api` currently uses `MockProductAdapter` in `factory.ts`. To preserve offline, standalone frontend development and continuous integration without requiring external backend servers:
  1. Provide a `MockAuthAdapter` and `MockUserAdapter` in `packages/api/src/adapters/mock/` implementing the `AuthService` and `UserService` contracts.
  2. Configure `factory.ts` to switch between `MockAuthAdapter` and `HttpAuthAdapter` based on environment configuration (`VITE_USE_MOCK_API === "true"` or when `VITE_API_URL` is empty/mock mode).

---

### 4. Single-Flat Account Route Creates Architectural Dead-End for Nested Account Portal - Severity: Major
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 488–492 (`apps/storefront/src/routes/account-route.tsx`) vs `docs/examples/customer-account-routes.md`
* **Discrepancy Description**: 
  `customer-account-routes.md` establishes that `/account` is a nested portal with 5 distinct sub-routes (`/account/profile`, `/account/orders`, `/account/keys`, etc.), with `/account` defaulting to a redirect to `/profile`.
  The design specifies `account-route.tsx` as a single flat component: *"Combines `AccountGuard`, `AccountLayout`, and `ProfilePage`. Route endpoint for `/:lang/account`."*
* **Rationale & Recommendation**: 
  Flattening `/account` into a single page that embeds `ProfilePage` directly inside `AccountLayout` creates an architectural dead-end. When Orders, Keys, and Tickets are implemented in subsequent milestones, `account-route.tsx` will require destructive restructuring.
  Instead, establish the nested route hierarchy now:
  - Configure `/:lang/account` as a layout route rendering `<AccountGuard><AccountLayout><Outlet /></AccountLayout></AccountGuard>`.
  - Add an index route redirecting `/:lang/account` to `/:lang/account/profile`.
  - Mount `ProfilePage` under `/:lang/account/profile`.
  This allows placeholder/stub navigation for Orders/Keys/Tickets to function cleanly without route re-architecture.

---

### 5. Brittle User-Agent Sniffing & Script Dependency for Google OAuth in In-App WebViews - Severity: Major
* **Reviewer Lens:** `egm-inventive-catalyst`
* **Affected Scope:** Lines 67–70, 267–273, 423–432 (`use-google-auth.ts`, `in-app-browser.ts`)
* **Discrepancy Description**: 
  Google OAuth strictly blocks OAuth requests originating from embedded mobile WebViews (`403 disallowed_useragent`). The design attempts to resolve this technical tension through client-side User-Agent regex sniffing (`isInAppBrowser()`) and a warning message. User-Agent parsing is notoriously fragile, frequently bypassed by modified in-app browsers, and requires dynamically injecting Google's external GSI script (`https://accounts.google.com/gsi/client`) into the client DOM, introducing CSP overhead and potential mobile popup-blocker issues.
* **Rationale & Recommendation**: 
  Resolve the contradiction cleanly:
  1. **Lazy Loading**: Do not load the Google GSI script during initial page mount. Dynamically inject the script only on hover/focus or initial click of the "Continue with Google" button, avoiding unneeded 3rd-party script overhead for email/password users.
  2. **Redirect Flow Fallback**: Rather than purely relying on popup mode and warning text, provide a fallback standard redirect flow (`ux_mode: 'redirect'` or backend OAuth redirect URL) for in-app browser environments that redirects out to the native browser, which Google fully permits.

---

### 6. Missing Cross-Tab Session Synchronization via Storage Events - Severity: Major
* **Reviewer Lens:** `egm-inventive-catalyst`
* **Affected Scope:** Lines 153–156, 308–313 (`TokenStorage` & Multi-Tab Isolation)
* **Discrepancy Description**: 
  Because tokens are stored in browser `localStorage`, they are shared across browser tabs on the same origin. However, in-memory state (`useAuth` query cache and `NativeFetchClient` latch) is isolated to a single tab. If a user logs out in Tab A, Tab B remains visually logged in until a query triggers a 401. If Tab A rotates the single-use refresh token via `POST /auth/refresh`, Tab B's in-memory state remains unaware, and if Tab B attempts to use the previously held refresh token, the backend triggers an immediate token-reuse security lock (`AUTHENTICATION_FAILED`).
* **Rationale & Recommendation**: 
  Utilize the native browser `window.addEventListener('storage', ...)` event inside `TokenStorage`:
  - When tokens are modified or cleared in one tab, the storage event notifies all other open tabs on that origin.
  - On storage event for the active prefix (`muftahy_storefront_*` or `muftahy_admin_*`), notify `useAuth` to invalidate query caches and reset authentication state synchronously across all open tabs.

---

### 7. Fragile Dual-Call Registration State Machine Leaves User Stranded on Login Failure - Severity: Major
* **Reviewer Lens:** `egm-inventive-catalyst`
* **Affected Scope:** Lines 58–60, 443–446 (CUJ 1 & `RegisterForm`)
* **Discrepancy Description**: 
  To eliminate redundant credential re-entry, CUJ 1 specifies that when `POST /api/v1/auth/register` returns `201 Created`, the client automatically and transparently issues `POST /api/v1/auth/login`. However, if `POST /register` succeeds on the backend but the follow-up `POST /login` fails (e.g., transient network glitch, rate limiter `429`, or server-side email verification requirement), the user account has already been registered in the database, but the user is stranded on the registration form. If the user clicks "Submit" again, the backend rejects it with `400 EMAIL_ALREADY_EXISTS`, creating extreme user frustration.
* **Rationale & Recommendation**: 
  Incorporate a resilient fallback state in `RegisterForm`:
  - If `POST /register` succeeds but the background `POST /login` fails, do NOT show a generic registration error.
  - Immediately transition the UI to the Login form with the submitted email pre-filled and an informational alert: *"Account created successfully! Please enter your password to sign in."*

---

### 8. Query Parameter Mismatch Between Specs (`returnTo` vs `returnUrl`) - Severity: Nit
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Line 64, Line 255 (`sanitizeReturnTo`) vs `docs/examples/customer-account-routes.md` (Lines 38–42)
* **Discrepancy Description**: 
  `docs/examples/customer-account-routes.md` repeatedly defines and uses `?returnUrl=<encoded_path>`. The design document switches nomenclature to `?returnTo=<encoded_path>`.
* **Rationale & Recommendation**: 
  To prevent subtle navigation bugs and preserve compatibility with external links or notifications, support both parameter names in `sanitizeReturnTo`:
  ```typescript
  const rawParam = searchParams.get('returnTo') || searchParams.get('returnUrl');
  ```

---

### 9. Static Rate-Limit Toast Misses Active Countdown UI Opportunity - Severity: Nit
* **Reviewer Lens:** `egm-inventive-catalyst`
* **Affected Scope:** Lines 317–318 (`Rate-Limit Visibility`)
* **Discrepancy Description**: 
  The backend authentication rate limiter returns `Retry-After: <seconds>` on `429 Too Many Requests`. The design mentions parsing this header, but does not specify converting it into an active UX governor.
* **Rationale & Recommendation**: 
  When a `429` error is caught, bind the `Retry-After` seconds to a countdown timer that temporarily disables the submit button and displays `Try again in 0:XXs`. This prevents users from spamming the submit button and hitting extended IP bans.
