# api/src

## Overview

Source root for the `@workspace/api` package. Contains the service factory registry, interface contracts, and adapter implementations.

## Interface

- `[factory.ts:ApiServices]` `interface ApiServices` — interface mapping available service domains
- `[factory.ts:services]` `const services: ServiceRegistry` — singleton service registry instance
- `[factory.ts:getProductService]` `(): ProductService` — accessor returning the active `ProductService` singleton
- adapters: [./adapters/README.md](./adapters/README.md) - Concrete service implementations (mock and future HTTP)
- services: [./services/README.md](./services/README.md) - `ProductService` interface definition

## Invariants

- `[factory.ts:ServiceRegistry.getProductService]` Lazily instantiates `MockProductAdapter` as a singleton on first access.
- Applications access services via `getProductService()` or `services`, never constructing adapters directly.

## Side Effects

- None. In-memory instantiation only.

## Verification

- Run: `pnpm test`
