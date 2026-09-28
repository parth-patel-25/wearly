---
description: Always use centralized API routes, add new endpoints here first
globs: ["**/*.ts", "**/*.tsx"]
---

# API Routes Rules (MANDATORY)

## Centralized API Routes

### Location
All API routes MUST be defined in:
```
src/shared/api/index.ts
```

### Why Centralized Routes?
- Single source of truth for all endpoints
- Easy to update base URLs or route patterns
- Type-safe route definitions
- Better maintainability and refactoring
- Prevents duplicate or inconsistent route strings

## Rules

### 1. Add New Endpoints First
```typescript
// src/shared/constants/api-routes.ts

export const API_ROUTES = {
  // ... existing routes ...

  // Add new endpoint here FIRST
  PRODUCTS: {
    BASE: "/products",
    BY_ID: (id: string) => `/products/${id}`,
    VARIANTS: (id: string) => `/products/${id}/variants`,
    IMAGES: (id: string) => `/products/${id}/images`,
  },
} as const
```

### 2. Use Routes in Services
```typescript
// features/products/services/product.service.ts
import { API_ROUTES } from "@shared/constants/api-routes"

export const productService = {
  getList: () => apiClient.get(API_ROUTES.PRODUCTS.BASE),
  getById: (id: string) => apiClient.get(API_ROUTES.PRODUCTS.BY_ID(id)),
  create: (data) => apiClient.post(API_ROUTES.PRODUCTS.BASE, data),
  update: (id, data) => apiClient.put(API_ROUTES.PRODUCTS.BY_ID(id), data),
  delete: (id) => apiClient.delete(API_ROUTES.PRODUCTS.BY_ID(id)),
}
```

### 3. NEVER Hardcode Routes
```typescript
// ❌ BAD - Hardcoded route
apiClient.get("/products")

// ✅ GOOD - Using centralized route
apiClient.get(API_ROUTES.PRODUCTS.BASE)
```

## Route Structure Convention

```typescript
export const API_ROUTES = {
  // Resource name (UPPER_SNAKE_CASE)
  RESOURCE_NAME: {
    // Base endpoint
    BASE: "/resource-name",
    
    // Dynamic route with ID
    BY_ID: (id: string) => `/resource-name/${id}`,
    
    // Nested resources
    NESTED_RESOURCE: (id: string) => `/resource-name/${id}/nested`,
    
    // Actions
    ACTION: (id: string) => `/resource-name/${id}/action`,
  },
} as const
```

## Type Safety

### Export Types
```typescript
export type ApiRouteKey = keyof typeof API_ROUTES
export type ApiRoute = typeof API_ROUTES
```

### Use Types in Services
```typescript
import type { ApiRoute } from "@shared/constants/api-routes"

function makeRequest<K extends keyof ApiRoute>(
  route: K,
  // ... params
) {
  // Type-safe route access
}
```

## Adding New Endpoints Checklist

- [ ] Add endpoint to `api-routes.ts`
- [ ] Follow naming convention (UPPER_SNAKE_CASE)
- [ ] Include BY_ID for resources with CRUD
- [ ] Add nested resources if needed
- [ ] Export types if needed
- [ ] Update documentation
- [ ] Use route in service file

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-07-27 | Initial centralized API routes |