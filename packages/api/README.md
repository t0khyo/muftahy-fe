# @workspace/api

## Overview

Service layer package for the Muftahy frontend. Exposes a `ProductService` interface and a `ServiceRegistry` factory that returns the active implementation. Currently ships only a mock in-memory adapter; swapping in a real HTTP adapter requires changing only `factory.ts`. Consumer code (hooks, components) must import from the `@workspace/api/factory` or `@workspace/api/services/*` export paths — never from adapter internals.

## Interface

- `@workspace/api/factory`
  - `services: ServiceRegistry` — singleton registry
  - `getProductService(): ProductService` — returns the lazily-initialised product service implementation
  - `ApiServices` — interface type `{ products: ProductService }`
- `@workspace/api/services/product-service`
  - `ProductService` — interface (see `src/services/README.md`)
- `@workspace/api/adapters/mock/product-mock-adapter`
  - `MockProductAdapter` — concrete in-memory implementation
  - `MOCK_PRODUCTS` — static test fixture array

## Invariants

- The active implementation is determined solely by `factory.ts`; no consumer may directly instantiate an adapter.
- `ProductService` is the only public contract; adapters are implementation details.
- Swapping from mock to HTTP must require changes only inside `factory.ts` and the new adapter file.

## Side Effects

- In mock mode: purely in-memory, no I/O.
- In future HTTP mode: network requests to a backend API.

## Verification

- Run: `pnpm test`
