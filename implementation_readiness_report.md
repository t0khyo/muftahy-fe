# Stage 9 Review Report: Implementation Readiness Audit

**Target:** `docs/designs/storefront-admin-authentication.md` (Lines 326–576)  
**Standard:** `implementation-readiness-standard.md`  
**Date:** 2026-11-18  

## Reviewer Status

| Reviewer | Status |
| --- | --- |
| `egm-implementation-readiness` | completed |
| `egm-codebase-details` | completed |
| `egm-style` | completed |

## Severity Breakdown

- 🔴 **Blocker**: 3
- 🟡 **Major**: 5
- 🟢 **Nit**: 3
- **Total Findings**: 11

## Prioritized Findings (Blockers -> Major -> Nits)

### 1. Absence of Phasing and Incremental Verification Checkpoints - Severity: Blocker
* **Reviewer Lens:** `egm-implementation-readiness`
* **Affected Scope:** Lines 326–576 (Section 3: Detailed Implementation Plan)
* **Discrepancy Description:** The Implementation Readiness Standard mandates:
  > *"The plan must partition the work into logical, incremental phases. Each phase must leave the codebase in a stable, buildable, and testable state."*
  
  The current implementation plan groups files purely by repository package (`@workspace/domain`, `@workspace/api`, `@workspace/i18n`, `apps/storefront`, `apps/admin`). It provides zero phase partitioning, execution sequencing, or intermediate build/test checkpoints.
* **Rationale & Recommendation:** An engineer or AI agent executing this sequentially package-by-package will leave cross-package imports unlinked, broken, and untestable between steps.
  - Partition the work into explicit, numbered chronological phases:
    1. **Phase 1 (Domain Contracts):** Zod schemas and validation tests in `@workspace/domain`. Checkpoint: `pnpm --filter @workspace/domain test`.
    2. **Phase 2 (API Transport & State):** `TokenStorage`, `NativeFetchClient` with 401 promise latch, adapters, and unit tests in `@workspace/api`. Checkpoint: `pnpm --filter @workspace/api test && pnpm --filter @workspace/api typecheck`.
    3. **Phase 3 (Bilingual Assets):** Translation catalogs in `@workspace/i18n`. Checkpoint: `pnpm --filter @workspace/i18n typecheck`.
    4. **Phase 4 (Storefront Feature & Auth Shell):** `useAuth`, forms, OTP confirmation, routes, and tests in `apps/storefront`. Checkpoint: `pnpm --filter storefront typecheck && pnpm --filter storefront test`.
    5. **Phase 5 (Protected Account Layout & Site Header Integration):** `AccountGuard`, `AccountLayout`, `AccountDropdown` in header. Checkpoint: `pnpm --filter storefront build`.
    6. **Phase 6 (Admin Setup & Dashboard Gate):** `apps/admin` routing, guard, and login form. Checkpoint: `pnpm --filter admin typecheck && pnpm --filter admin build`.
    7. **Phase 7 (Full Monorepo Verification):** Definition of Done execution. Checkpoint: root `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.

---

### 2. Omission of Provider Mount Point from File Boundaries (`providers.tsx`) - Severity: Blocker
* **Reviewer Lens:** `egm-implementation-readiness`
* **Affected Scope:** Lines 418–422, 508–512, 555–558
* **Discrepancy Description:** Line 419 specifies that `use-auth.ts` is a "React hook & context. Expose reactive state (`user`, `isAuthenticated`, `isLoading`)...". However, `apps/storefront/src/app/providers.tsx` (the central provider mount point) and any `auth-provider.tsx` component are completely omitted from "Target Files to Create/Modify".
* **Rationale & Recommendation:** The Zero-Decision Rule is violated. In a fresh AI session, the implementer will discover that React Context requires wrapping the component tree, but will be barred by strict file write allowlists or forced to guess whether to edit `providers.tsx`, `App.tsx`, or `router.tsx`.
  - Add `apps/storefront/src/features/auth/context/auth-context.tsx` (or `auth-provider.tsx`) to Target Files to Create.
  - Add `apps/storefront/src/app/providers.tsx` to Target Files to Modify with explicit instructions to nest `<AuthProvider>` inside `<QueryProvider>`.
  - Specify the corresponding provider structure for `apps/admin/src/App.tsx`.

---

### 3. Admin App Dependency Additions Conflict with Lockfile Policy - Severity: Blocker
* **Reviewer Lens:** `egm-codebase-details`
* **Affected Scope:** Lines 520–523 (`apps/admin/package.json`)
* **Discrepancy Description:** The plan specifies modifying `apps/admin/package.json` to add `@workspace/api`, `@workspace/domain`, `@workspace/i18n`, and `react-router`. However:
  1. `AGENTS.md` explicitly instructs: *"Stop and ask the user first before doing any of these: Touching lockfiles (`pnpm-lock.yaml`)"*. Running `pnpm install` mutates `pnpm-lock.yaml`.
  2. The plan does not specify exact package version strings or protocols (e.g., `"workspace:*"` vs `"^7.2.0"`).
  3. `apps/admin` currently only contains React, Vite, Tailwind, and ESLint. If `admin-login-form.tsx` uses shadcn components, Lucide icons, React Hook Form, or TanStack Query, those packages are also missing from `apps/admin/package.json`.
* **Rationale & Recommendation:** The plan must explicitly resolve this procedural conflict:
  - Document the exact dependencies to add with versions:
    ```json
    "dependencies": {
      "@workspace/api": "workspace:*",
      "@workspace/domain": "workspace:*",
      "@workspace/i18n": "workspace:*",
      "react-router": "^7.2.0"
    }
    ```
  - State the rule compliance procedure: instruct the implementer to pause and prompt the user for permission before updating `pnpm-lock.yaml` via `pnpm install`, or pre-coordinate this step.
  - Clarify whether `apps/admin` will use `react-hook-form` and `@tanstack/react-query` or lightweight native form state.

---

### 4. Underspecified Service and Adapter Interface Signatures - Severity: Major
* **Reviewer Lens:** `egm-implementation-readiness`
* **Affected Scope:** Lines 354–363, 384–392 (`auth-service.ts`, `user-service.ts`, HTTP adapters)
* **Discrepancy Description:** The plan lists method names for `AuthService` (`login`, `register`, `loginWithGoogle`, `refreshToken`, `logout`, `requestPasswordReset`, `confirmPasswordReset`, `requestOtp`, `verifyOtp`, `adminLogin`) and `UserService` (`getProfile`, `updateProfile`), but does not define TypeScript function signatures, input parameter types, or return types.
* **Rationale & Recommendation:** Leaving interface design to the implementer violates the Zero-Decision Rule. For example, does `login()` return `TokenResponse` or an authenticated session model? Does `logout()` accept a refresh token to revoke on the backend or merely clear local storage?
  - Pre-determine and document the exact interface contracts in the plan:
    ```typescript
    export interface AuthService {
      login(credentials: LoginRequest): Promise<TokenResponse>;
      register(payload: RegisterRequest): Promise<{ status: string; message: string; user_id: string }>;
      loginWithGoogle(code: GoogleLoginRequest): Promise<TokenResponse>;
      refreshToken(refreshToken: string): Promise<TokenResponse>;
      logout(): Promise<void>;
      requestPasswordReset(payload: PasswordResetRequest): Promise<{ message: string }>;
      confirmPasswordReset(payload: PasswordResetConfirm): Promise<{ message: string }>;
      requestOtp(payload: OTPRequest): Promise<{ message: string }>;
      verifyOtp(payload: OTPVerify): Promise<{ message: string }>;
      adminLogin(credentials: LoginRequest): Promise<TokenResponse>;
    }

    export interface UserService {
      getProfile(): Promise<UserProfile>;
      updateProfile(payload: UpdateProfileRequest): Promise<UserProfile>;
    }
    ```

---

### 5. Missing `updateProfileRequestSchema` in Domain Schema Package - Severity: Major
* **Reviewer Lens:** `egm-codebase-details`
* **Affected Scope:** Lines 332–335 (`packages/domain/src/schemas/auth.ts`)
* **Discrepancy Description:** Line 361 introduces `updateProfile` in `UserService` (mapping to backend `PATCH /api/v1/users/me` from `docs/examples/customer-account-routes.md` line 82), but line 334 omits `updateProfileRequestSchema` from the proposed domain schemas.
* **Rationale & Recommendation:** Add `updateProfileRequestSchema` & `UpdateProfileRequest` to `packages/domain/src/schemas/auth.ts`:
  ```typescript
  export const updateProfileRequestSchema = z.object({
    full_name: z.string().min(2).max(255).optional(),
    phone: z.string().max(20).nullable().optional(),
  });
  export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;
  ```

---

### 6. Subpath Export Resolution Breakdown for Nested HTTP Adapters - Severity: Major
* **Reviewer Lens:** `egm-codebase-details`
* **Affected Scope:** Lines 364–377, 394–398, 420
* **Discrepancy Description:** The plan places `TokenStorage` at `packages/api/src/adapters/http/token-storage.ts` and imports it into `apps/storefront/src/features/auth/hooks/use-auth.ts`. However, `packages/api/package.json` specifies:
  ```json
  "exports": {
    "./services/*": "./src/services/*.ts",
    "./adapters/*": "./src/adapters/*.ts",
    "./factory": "./src/factory.ts"
  }
  ```
  Nested files in `./src/adapters/http/*.ts` cannot be resolved through `./adapters/*` under Node / TypeScript subpath wildcard resolution. Furthermore, `packages/api/package.json` is not listed in Target Files to modify.
* **Rationale & Recommendation:** Either:
  1. Add `packages/api/package.json` to Target Files to Modify and add `"./adapters/http/*": "./src/adapters/http/*.ts"`, or
  2. Export `TokenStorage` directly from `./src/factory.ts` or a top-level `@workspace/api/token-storage` entry point.

---

### 7. Vague Verification Plan Lacking Concrete Test Cases and Storefront Test Files - Severity: Major
* **Reviewer Lens:** `egm-implementation-readiness`
* **Affected Scope:** Lines 565–573 (Verification Plan) and lines 418–492
* **Discrepancy Description:** The standard states: *"Test Plan: Specific test cases (happy path and edge cases) that must be implemented."* The verification section merely repeats standard commands (`pnpm test`) without specifying concrete test cases for critical business logic (e.g. 401 concurrent deduplication queueing in `NativeFetchClient`, JWT expiration / audience mismatch purge in `TokenStorage`, open-redirect validation edge cases in `sanitizeReturnTo`, background auto-login on registration failure). Moreover, there are zero test files listed under `apps/storefront` (such as `use-auth.test.ts`, `login-form.test.tsx`, `account-guard.test.tsx`) despite `AGENTS.md` requiring Vitest tests for all new logic.
* **Rationale & Recommendation:**
  - Add explicit test files to the storefront target files list:
    - `apps/storefront/src/features/auth/hooks/use-auth.test.ts`
    - `apps/storefront/src/features/auth/lib/sanitize-return-to.test.ts`
    - `apps/storefront/src/features/account/components/account-guard.test.tsx`
  - Explicitly detail the test cases to implement:
    1. **Token Storage**: isolation between `muftahy_storefront_` and `muftahy_admin_`, clearing on expired JWT payload, clearing on audience mismatch.
    2. **Fetch Client**: 401 triggering single refresh call while 3 concurrent requests wait; queue drainage on refresh success; queue rejection and token clearing on refresh failure (`401`).
    3. **Sanitize ReturnTo**: relative paths (`/account/orders`) allowed; protocol-relative (`//malicious.com`), external (`https://evil.com`), and backslash paths (`/\evil.com`) rejected and fallen back to default.
    4. **Register Form**: submission triggers `register`, then immediately calls `login` without prompting for re-entry.

---

### 8. Missing Environment Configuration (`.env.example`) for Google OAuth Client ID - Severity: Major
* **Reviewer Lens:** `egm-codebase-details`
* **Affected Scope:** Lines 423–427 (`use-google-auth.ts`)
* **Discrepancy Description:** Line 425 references initializing Google Identity Services with `VITE_GOOGLE_CLIENT_ID`, but neither `apps/storefront/.env.example` nor Vite client environment declarations (`vite-env.d.ts` / `ImportMetaEnv`) are included in the file changes. In strict TypeScript mode, `import.meta.env.VITE_GOOGLE_CLIENT_ID` will fail typechecking unless declared.
* **Rationale & Recommendation:**
  - Add `apps/storefront/.env.example` to Target Files to Create/Modify with `VITE_GOOGLE_CLIENT_ID=` and `VITE_API_URL=http://localhost:8000/api/v1`.
  - Add or update `apps/storefront/src/vite-env.d.ts` to type `ImportMetaEnv`.

---

### 9. Query Parameter Inconsistency Between `returnTo` and `returnUrl` - Severity: Nit
* **Reviewer Lens:** `egm-codebase-details` / `egm-style`
* **Affected Scope:** Lines 433–436, 460, 475 vs Reference Doc
* **Discrepancy Description:** The design uses `returnTo` (e.g. `sanitize-return-to.ts`), whereas the reference specification `customer-account-routes.md` (lines 36–40) and CUJ 2 refer to `returnUrl`.
* **Rationale & Recommendation:** Standardize on one consistent parameter name throughout all files and routes (preferably `returnUrl` to align with the reference API document, or note explicitly why `returnTo` was selected).

---

### 10. File List Formatting Lacks Standard Markdown Linkage - Severity: Nit
* **Reviewer Lens:** `egm-style`
* **Affected Scope:** Lines 330–563
* **Discrepancy Description:** File paths under "Target Files to Create/Modify" use bold inline code tags (`* **`path`** (`Action`):`) instead of consistent Markdown links or standard EGM tabular manifests.
* **Rationale & Recommendation:** Format file paths as clickable file links or provide a clean summary table listing all files, target package, action (`Create` / `Modify`), and description at the top of the section.

---

### 11. Unimplemented Secondary Account Tabs Lack Defined Fallback State - Severity: Nit
* **Reviewer Lens:** `egm-style`
* **Affected Scope:** Lines 480–492 (`account-layout.tsx`)
* **Discrepancy Description:** `AccountLayout` specifies sidebar navigation tabs for Profile, Orders, Keys, Support, and Logout. Since full order history, keys, and support tickets are explicitly defined as Non-Goals (line 43), the plan does not define what renders when a customer clicks Orders or Keys.
* **Rationale & Recommendation:** Explicitly specify in `AccountLayout` that secondary navigation items render a clean placeholder card ("Feature coming soon" / disabled state) so clicking them does not trigger an unexpected 404 / catch-all redirect.
