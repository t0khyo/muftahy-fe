# api/src

## Overview

Source root for the `@workspace/api` package. Contains the service factory registry, interface contracts, and HTTP adapter implementations.

## Interface

- `[factory.ts:ApiServices]` `interface ApiServices` — interface mapping available service domains
- `[factory.ts:services]` `const services: ServiceRegistry` — singleton service registry instance
- `[factory.ts:getProductService]` `(): ProductService` — accessor returning the active `ProductService`
- `[factory.ts:getCartService]` `(): CartService` — accessor returning the active `CartService`
- adapters: [./adapters/README.md](./adapters/README.md) - Concrete HTTP service implementations
- services: [./services/README.md](./services/README.md) - Service interface definitions

## Invariants

- `[factory.ts:ServiceRegistry]` Lazily instantiates and caches HTTP adapters using `NativeFetchClient`.
- Applications access services via factory accessors, never constructing adapters directly.

## Side Effects

- Executes network requests to backend services.

## Verification

- Run: `pnpm test`
