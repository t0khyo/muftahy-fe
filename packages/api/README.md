# @workspace/api

## Overview

Service layer package for the Muftahy frontend. Exposes the `ProductService` interface and a `ServiceRegistry` factory that returns the active implementation. Currently ships only an in-memory mock adapter; swapping in a real HTTP adapter requires changing only `factory.ts`. Consumer code (hooks, components) must import from `@workspace/api/factory` or `@workspace/api/services/*` — never directly from adapter internals.

## Interface

- src: [./src/README.md](./src/README.md) - API source tree containing factory, services, and adapter implementations
- `@workspace/api/factory` — `services`, `getProductService`, `ApiServices`
- `@workspace/api/services/product-service` — `ProductService` interface
- `@workspace/api/adapters/mock/product-mock-adapter` — `MockProductAdapter`, `MOCK_PRODUCTS`

## Invariants

- The active implementation is determined solely by `factory.ts`; consumer code must not directly instantiate an adapter.
- `ProductService` is the primary public contract; adapters are implementation details.
- Transitioning from mock data to real HTTP endpoints requires modifying only `factory.ts` and adding the new adapter.

## Side Effects

- In mock mode: purely in-memory with zero I/O side effects.
- In HTTP mode: will execute network calls to backend services.

## Verification

- Run: `pnpm test`
