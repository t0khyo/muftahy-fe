# apps

## Overview

Applications layer in the Muftahy monorepo. Contains the customer-facing storefront and the operator admin dashboard. Applications import from workspace packages (`packages/*`), but never from each other.

## Subdirectories & Boundaries

- **admin**: [`./admin/README.md`](./admin/README.md) — Admin dashboard application (scaffold) for product, order, inventory, and user management.
- **storefront**: [`./storefront/README.md`](./storefront/README.md) — Customer-facing storefront application for digital keys, software licenses, and game codes.
