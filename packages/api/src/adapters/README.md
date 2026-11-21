# Adapters

## Overview

Service adapter implementations for `@workspace/api`. Each adapter fulfils the domain service interfaces (`ProductService`, `AuthService`, `UserService`, `OrderService`, `TicketService`, `CartService`) connecting to backend endpoints via `NativeFetchClient`.

## Subdirectories & Boundaries

- http: Production HTTP adapters and transport infrastructure (`NativeFetchClient`, `TokenStorage`, `HttpAuthAdapter`, `HttpUserAdapter`, `HttpProductAdapter`, `HttpOrderAdapter`, `HttpTicketAdapter`, `HttpCartAdapter`).
