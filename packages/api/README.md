# @workspace/api

## Overview

Service layer package for the Muftahy frontend. Exposes service interfaces (`ProductService`, `AuthService`, `UserService`, `OrderService`, `TicketService`, `CartService`) and a `ServiceRegistry` factory that returns the active implementation. Integrates directly with the backend via `NativeFetchClient` and HTTP adapters. Consumer code (hooks, components) must import from `@workspace/api/factory` or `@workspace/api/services/*` — never directly from adapter internals.

## Interface

- src: [./src/README.md](./src/README.md) - API source tree containing factory, services, and adapter implementations
- `@workspace/api/factory` — `services`, `getProductService`, `getAuthService`, `getUserService`, `getOrderService`, `getTicketService`, `getCartService`, `ApiServices`
- `@workspace/api/services/*` — Service interface contracts
- `@workspace/api/adapters/http/*` — Production HTTP adapters

## Invariants

- The active implementation is determined solely by `factory.ts`; consumer code must not directly instantiate an adapter.
- Services are the primary public contracts; adapters are implementation details.
- All network communication goes through `NativeFetchClient` with standard bearer authentication and token lifecycle management.

## Side Effects

- Executes network calls via `fetch` to backend REST endpoints.

## Verification

- Run: `pnpm test`
