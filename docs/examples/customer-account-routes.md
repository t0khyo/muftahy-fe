# Customer Account Routes & API Examples

This document outlines the recommended storefront route architecture, authentication boundary handling, and corresponding backend API examples for the customer-facing `/account` portal in Souq Muftah.

---

## 1. Scope of Protected Account Routes

To provide a complete self-service customer experience while keeping the storefront modular, the `/account` route tree is partitioned into **5 functional views**:

```
/account
├── /profile          (Default redirect: Personal info, contact details, security)
├── /orders           (Order history & purchase tracking)
│   └── :orderId      (Detailed order summary, receipt upload, cancellation, invoice)
├── /keys             (Digital goods library: license keys and serial codes)
└── /tickets          (Support & defective key complaints)
    └── :ticketId     (Two-way messaging thread, attachments, ticket status)
```

### Route-to-API Mapping Summary

| Storefront Route | View Name | Primary Backend API Endpoints | Purpose |
| :--- | :--- | :--- | :--- |
| `/account/profile` | Profile & Security | `GET /api/v1/users/me`<br>`PATCH /api/v1/users/me`<br>`POST /api/v1/auth/password/reset-request` | View profile, update name/phone, initiate password reset. |
| `/account/orders` | Order History | `GET /api/v1/users/me/orders` | Summary table of past orders, statuses, and totals. |
| `/account/orders/:id` | Order Detail & Payment | `GET /api/v1/orders/{order_id}`<br>`POST /api/v1/orders/{order_id}/receipt`<br>`POST /api/v1/orders/{order_id}/cancel`<br>`GET /api/v1/orders/{order_id}/invoice` | Track review status, upload payment screenshots, cancel order, download invoice. |
| `/account/keys` | Digital Key Library | `GET /api/v1/users/me/keys` | Quick-copy access to all fulfilled activation license keys. |
| `/account/tickets` | Support Tickets | `GET /api/v1/tickets`<br>`POST /api/v1/tickets` | List tickets, report defective keys with screenshot attachments. |
| `/account/tickets/:id`| Ticket Thread | `GET /api/v1/tickets/{ticket_id}`<br>`POST /api/v1/tickets/{ticket_id}/comments`<br>`POST /api/v1/tickets/{ticket_id}/attachments`<br>`POST /api/v1/tickets/{ticket_id}/reopen` | Message support team, inspect replacement key serials, reopen tickets. |

---

## 2. Unauthenticated Boundary & Guard Architecture

### Recommended Pattern: Preserved Redirect Target (`?returnUrl=...`)

When an unauthenticated visitor attempts to access any route under `/account/*`:
1. **Redirect to Login**: The client-side route guard intercepts navigation and redirects to `/login?returnUrl=<encoded_path>` (e.g., `/login?returnUrl=%2Faccount%2Forders%2Fa90184bc`).
2. **Post-Authentication Navigation**: Upon successful credentials verification (`POST /api/v1/auth/login`) or Google OAuth callback (`POST /api/v1/auth/login/google`), the client immediately navigates to `returnUrl`. If no valid `returnUrl` is present, it falls back to `/account/orders`.
3. **Deep-linking & Bookmarking Support**: Users clicking order or ticket notification links in their email or SMS land straight on the intended resource after signing in.
4. **Token Expiry & Silent Refresh**:
   - When an API request returns `401 Unauthorized`, an Axios/Fetch response interceptor attempts a single silent token refresh via `POST /api/v1/auth/refresh`.
   - If the refresh token has expired or is invalid, clear stored tokens and redirect to `/login?returnUrl=<current_path>` with a toast banner: *"Your session has expired. Please sign in again."*

---

## 3. Detailed View Specifications & API Examples

### View 1: Profile & Security (`/account/profile`)

#### 1.1 Fetch Customer Profile
- **Trigger**: Page load on `/account/profile`
- **Method & Path**: `GET /api/v1/users/me`
- **Headers**: `Authorization: Bearer <customer_access_token>`

```bash
curl -X GET "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer <customer_access_token>"
```

**Response (`200 OK`)**:
```json
{
  "id": "18f9103c-829d-47be-a567-2794ebef4023",
  "email": "customer@example.com",
  "full_name": "Ahmed Hassan",
  "phone": "+201012345678",
  "created_at": "2026-11-15T09:20:00Z"
}
```

#### 1.2 Update Profile Information
- **Trigger**: Submitting the "Save Profile" form
- **Method & Path**: `PATCH /api/v1/users/me`
- **Headers**: `Authorization: Bearer <customer_access_token>`, `Content-Type: application/json`

```bash
curl -X PATCH "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer <customer_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Ahmed H. Ali",
    "phone": "+201098765432"
  }'
```

**Response (`200 OK`)**:
```json
{
  "id": "18f9103c-829d-47be-a567-2794ebef4023",
  "email": "customer@example.com",
  "full_name": "Ahmed H. Ali",
  "phone": "+201098765432",
  "created_at": "2026-11-15T09:20:00Z"
}
```

---

### View 2: Order History (`/account/orders`)

#### 2.1 List All User Orders
- **Trigger**: Page load on `/account/orders`
- **Method & Path**: `GET /api/v1/users/me/orders`
- **Headers**: `Authorization: Bearer <customer_access_token>`

```bash
curl -X GET "http://localhost:8000/api/v1/users/me/orders" \
  -H "Authorization: Bearer <customer_access_token>"
```

**Response (`200 OK`)**:
```json
[
  {
    "id": "a90184bc-2980-49b8-bc88-91c6e1df2040",
    "reference_code": "SM-20261118-84BC",
    "status": "completed",
    "total_egp": 585.00,
    "created_at": "2026-11-18T13:10:00Z",
    "item_count": 1
  },
  {
    "id": "d41098ca-1234-45aa-bb89-771122334455",
    "reference_code": "SM-20261110-98CA",
    "status": "pending_payment",
    "total_egp": 650.00,
    "created_at": "2026-11-10T10:00:00Z",
    "item_count": 1
  }
]
```

---

### View 3: Order Detail & Payment Upload (`/account/orders/:id`)

#### 3.1 Fetch Order Details
- **Trigger**: Navigating to `/account/orders/:id`
- **Method & Path**: `GET /api/v1/orders/{order_id}`
- **Headers**: `Authorization: Bearer <customer_access_token>`

```bash
curl -X GET "http://localhost:8000/api/v1/orders/a90184bc-2980-49b8-bc88-91c6e1df2040" \
  -H "Authorization: Bearer <customer_access_token>"
```

**Response (`200 OK`)**:
```json
{
  "id": "a90184bc-2980-49b8-bc88-91c6e1df2040",
  "reference_code": "SM-20261118-84BC",
  "status": "pending_payment",
  "subtotal_egp": 650.00,
  "discount_total_egp": 65.00,
  "total_egp": 585.00,
  "payment_method": null,
  "payment_instructions": {
    "vodafone_cash_number": "01012345678",
    "instapay_ipa": "souqmuftah@instapay",
    "reference_code": "SM-20261118-84BC"
  },
  "payment_deadline": "2026-11-18T13:40:00Z",
  "review_deadline": null,
  "wrong_amount_attempts": 0,
  "rejection_reason": null,
  "items": [
    {
      "id": "c1f19f2a-7bf1-424a-b53f-da9bf80db18c",
      "product_id": "e3b8a8b1-4f11-4a81-9b19-e58f0d8fa001",
      "product_name": "Windows 11 Professional Retail",
      "is_preorder": false,
      "unit_price_egp": 650.00,
      "discount_amount_egp": 65.00,
      "final_price_egp": 585.00,
      "key_serial": null,
      "exchange_rate_at_sale": null,
      "is_refunded": false,
      "replacement_entitlement_used": false
    }
  ],
  "payment_attempts": [],
  "created_at": "2026-11-18T13:10:00Z"
}
```

#### 3.2 Upload Payment Receipt Screenshot
- **Trigger**: Clicking "Upload Receipt" when order is in `pending_payment` or retry state
- **Method & Path**: `POST /api/v1/orders/{order_id}/receipt`
- **Headers**: `Authorization: Bearer <customer_access_token>`
- **Content-Type**: `multipart/form-data`

```bash
curl -X POST "http://localhost:8000/api/v1/orders/a90184bc-2980-49b8-bc88-91c6e1df2040/receipt" \
  -H "Authorization: Bearer <customer_access_token>" \
  -F "receipt=@/path/to/screenshot.jpg" \
  -F "payment_method=instapay" \
  -F "amount_claimed=585.00"
```

**Response (`200 OK`)**:
```json
{
  "id": "a90184bc-2980-49b8-bc88-91c6e1df2040",
  "reference_code": "SM-20261118-84BC",
  "status": "payment_uploaded",
  "subtotal_egp": 650.00,
  "discount_total_egp": 65.00,
  "total_egp": 585.00,
  "payment_method": "instapay",
  "payment_instructions": {
    "vodafone_cash_number": "01012345678",
    "instapay_ipa": "souqmuftah@instapay",
    "reference_code": "SM-20261118-84BC"
  },
  "payment_deadline": null,
  "review_deadline": "2026-11-18T15:15:00Z",
  "wrong_amount_attempts": 0,
  "rejection_reason": null,
  "items": [
    {
      "id": "c1f19f2a-7bf1-424a-b53f-da9bf80db18c",
      "product_id": "e3b8a8b1-4f11-4a81-9b19-e58f0d8fa001",
      "product_name": "Windows 11 Professional Retail",
      "is_preorder": false,
      "unit_price_egp": 650.00,
      "discount_amount_egp": 65.00,
      "final_price_egp": 585.00,
      "key_serial": null,
      "exchange_rate_at_sale": null,
      "is_refunded": false,
      "replacement_entitlement_used": false
    }
  ],
  "payment_attempts": [
    {
      "id": "8489de1a-381a-4d43-bb9a-d760be85a9f2",
      "order_id": "a90184bc-2980-49b8-bc88-91c6e1df2040",
      "receipt_image_path": "storage/receipts/a90184bc-2980-49b8-bc88-91c6e1df2040_attempt_1.jpg",
      "payment_method": "instapay",
      "amount_claimed_egp": 585.00,
      "status": "pending_review",
      "rejection_reason": null,
      "created_at": "2026-11-18T13:15:00Z"
    }
  ],
  "created_at": "2026-11-18T13:10:00Z"
}
```

#### 3.3 Cancel Pending Order
- **Trigger**: Clicking "Cancel Order" button (available only during `pending_payment`)
- **Method & Path**: `POST /api/v1/orders/{order_id}/cancel`
- **Headers**: `Authorization: Bearer <customer_access_token>`

```bash
curl -X POST "http://localhost:8000/api/v1/orders/a90184bc-2980-49b8-bc88-91c6e1df2040/cancel" \
  -H "Authorization: Bearer <customer_access_token>"
```

**Response (`200 OK`)**:
```json
{
  "id": "a90184bc-2980-49b8-bc88-91c6e1df2040",
  "reference_code": "SM-20261118-84BC",
  "status": "cancelled",
  "subtotal_egp": 650.00,
  "discount_total_egp": 65.00,
  "total_egp": 585.00,
  "payment_method": null,
  "payment_instructions": {
    "vodafone_cash_number": "01012345678",
    "instapay_ipa": "souqmuftah@instapay",
    "reference_code": "SM-20261118-84BC"
  },
  "payment_deadline": null,
  "review_deadline": null,
  "wrong_amount_attempts": 0,
  "rejection_reason": null,
  "items": [],
  "payment_attempts": [],
  "created_at": "2026-11-18T13:10:00Z"
}
```

#### 3.4 Download / View Order Invoice
- **Trigger**: Clicking "Download Invoice"
- **Method & Path**: `GET /api/v1/orders/{order_id}/invoice`
- **Headers**: `Authorization: Bearer <customer_access_token>`

```bash
curl -X GET "http://localhost:8000/api/v1/orders/a90184bc-2980-49b8-bc88-91c6e1df2040/invoice" \
  -H "Authorization: Bearer <customer_access_token>"
```

**Response (`200 OK`)**:
```json
{
  "invoice_number": "INV-20261118-84BC",
  "order_id": "a90184bc-2980-49b8-bc88-91c6e1df2040",
  "reference_code": "SM-20261118-84BC",
  "order_date": "2026-11-18T13:10:00Z",
  "seller_info": {
    "store_name": "Souq Muftah",
    "support_email": "support@souqmuftah.com",
    "country": "Egypt"
  },
  "customer_name": "Ahmed Hassan",
  "customer_email": "customer@example.com",
  "items": [
    {
      "name": "Windows 11 Professional Retail",
      "quantity": 1,
      "unit_price_egp": 650.00,
      "discount_amount_egp": 65.00,
      "total_egp": 585.00
    }
  ],
  "subtotal_egp": 650.00,
  "discount_total_egp": 65.00,
  "total_egp": 585.00,
  "payment_status": "completed",
  "payment_method": "instapay"
}
```

---

### View 4: Digital Key Library (`/account/keys`)

#### 4.1 Fetch All Fulfilled Digital Keys
- **Trigger**: Page load on `/account/keys`
- **Method & Path**: `GET /api/v1/users/me/keys`
- **Headers**: `Authorization: Bearer <customer_access_token>`

```bash
curl -X GET "http://localhost:8000/api/v1/users/me/keys" \
  -H "Authorization: Bearer <customer_access_token>"
```

**Response (`200 OK`)**:
```json
[
  {
    "key_id": "84fe71b2-109c-48be-88e2-04e8d89e5a19",
    "product_name": "Windows 11 Professional Retail",
    "serial": "VK7JG-NPHTM-C97JM-9MPGT-3V66T",
    "sold_at": "2026-11-18T13:20:00Z"
  },
  {
    "key_id": "90aa1811-019b-4e89-8cb1-209bf1840028",
    "product_name": "Office 2021 Professional Plus",
    "serial": "FBFPP-2XNVH-69632-4WP28-HTBF6",
    "sold_at": "2026-11-10T11:00:00Z"
  }
]
```

---

### View 5: Customer Support Tickets (`/account/tickets`)

#### 5.1 Open Support Ticket for Defective Key
- **Trigger**: Submitting the "Report Defective Key" form from order item or tickets page
- **Method & Path**: `POST /api/v1/tickets`
- **Headers**: `Authorization: Bearer <customer_access_token>`
- **Content-Type**: `multipart/form-data`

```bash
curl -X POST "http://localhost:8000/api/v1/tickets" \
  -H "Authorization: Bearer <customer_access_token>" \
  -F "order_item_id=c1f19f2a-7bf1-424a-b53f-da9bf80db18c" \
  -F "initial_comment=The license key returned error 0xC004C003 during Windows activation." \
  -F "attachments=@/path/to/activation_error.png"
```

**Response (`200 OK`)**:
```json
{
  "id": "f5127d14-874b-4819-bf90-341e3d938f32",
  "user_id": "18f9103c-829d-47be-a567-2794ebef4023",
  "order_item_id": "c1f19f2a-7bf1-424a-b53f-da9bf80db18c",
  "key_serial": "VK7JG-NPHTM-C97JM-9MPGT-3V66T",
  "status": "open",
  "outcome": null,
  "is_locked": false,
  "admin_override": false,
  "replacement_key_serial": null,
  "comments": [
    {
      "id": "e43b1712-401d-4573-a8df-6bf961c02e11",
      "author_type": "customer",
      "author_name": "Ahmed Hassan",
      "content": "The license key returned error 0xC004C003 during Windows activation.",
      "created_at": "2026-11-18T13:30:00Z"
    }
  ],
  "attachments": [
    {
      "id": "d059b814-e53b-478f-a36c-9407ec9b5314",
      "file_name": "activation_error.png",
      "file_size_bytes": 104250,
      "created_at": "2026-11-18T13:30:00Z"
    }
  ],
  "created_at": "2026-11-18T13:30:00Z",
  "resolved_at": null
}
```

#### 5.2 List User Tickets
- **Trigger**: Page load on `/account/tickets`
- **Method & Path**: `GET /api/v1/tickets`
- **Headers**: `Authorization: Bearer <customer_access_token>`

```bash
curl -X GET "http://localhost:8000/api/v1/tickets" \
  -H "Authorization: Bearer <customer_access_token>"
```

#### 5.3 Post Comment to Ticket Thread (`/account/tickets/:id`)
- **Trigger**: Submitting reply message in ticket chat view
- **Method & Path**: `POST /api/v1/tickets/{ticket_id}/comments`
- **Headers**: `Authorization: Bearer <customer_access_token>`, `Content-Type: application/json`

```bash
curl -X POST "http://localhost:8000/api/v1/tickets/f5127d14-874b-4819-bf90-341e3d938f32/comments" \
  -H "Authorization: Bearer <customer_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I tried telephone activation as suggested, but Microsoft automated system says the key has exceeded its limit."
  }'
```

**Response (`200 OK`)**:
```json
{
  "id": "89b71940-27a9-4673-9a3d-49520ec91bf3",
  "author_type": "customer",
  "author_name": "Ahmed Hassan",
  "content": "I tried telephone activation as suggested, but Microsoft automated system says the key has exceeded its limit.",
  "created_at": "2026-11-18T13:34:00Z"
}
```

#### 5.4 Reopen Ticket
- **Trigger**: Customer clicks "Reopen Ticket" if an issue recurs
- **Method & Path**: `POST /api/v1/tickets/{ticket_id}/reopen`
- **Headers**: `Authorization: Bearer <customer_access_token>`

```bash
curl -X POST "http://localhost:8000/api/v1/tickets/f5127d14-874b-4819-bf90-341e3d938f32/reopen" \
  -H "Authorization: Bearer <customer_access_token>"
```

---

## 4. Frontend Router Implementation Recommendations

```tsx
// Example React Router v6 Guard Configuration
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth-context";

export function ProtectedAccountRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AccountLoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Preserve target path in query parameter for post-login redirect
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return (
    <AccountLayout>
      <Outlet />
    </AccountLayout>
  );
}
```

