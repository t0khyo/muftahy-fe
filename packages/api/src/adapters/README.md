# Adapters

## Overview

Service adapter implementations for `@workspace/api`. Each adapter fulfils the domain service interfaces (`ProductService`, `AuthService`, `UserService`) for a specific backend strategy.

## Subdirectories & Boundaries

- http: HTTP adapters and transport infrastructure (`NativeFetchClient`, `TokenStorage`, `HttpAuthAdapter`, `HttpUserAdapter`)
- mock: [./mock/README.md](./mock/README.md) - In-memory mock adapters (`MockProductAdapter`, `MockAuthAdapter`, `MockUserAdapter`) used in offline development and testing
