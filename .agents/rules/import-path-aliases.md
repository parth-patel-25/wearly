---
description: Enforce consistent import paths and order
globs: ["**/*.ts", "**/*.tsx"]
---

# Import Rules (MANDATORY)

## Path Aliases
- Use `@shared/` for imports from `src/shared/`
- Use `@features/` for imports from `src/features/`
- Use `@core/` for imports from `src/core/`
- Use `@/` as fallback for any `src/` import
- **NEVER use relative paths** for shared imports

## Import Examples
```typescript
// Shared imports
import { Button } from "@shared/components/ui/button"
import { useAuth } from "@shared/hooks/use-auth"
import { logger } from "@shared/lib/logger"

// Feature imports
import { UserCard } from "@features/user/components/user-card"
import { useUser } from "@features/user/hooks/use-user"

// Core imports
import { Providers } from "@core/providers"
import { router } from "@core/routing"
```

## Import Order
```tsx
// 1. External libraries
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

// 2. Shared modules
import { Button } from "@shared/components/ui/button"
import { useAuth } from "@shared/hooks/use-auth"

// 3. Feature modules (only cross-feature imports)
import { UserCard } from "@features/user/components/user-card"

// 4. Local imports
import { MyComponent } from "./my-component"
```

## Rules
- Group imports by category (external, shared, feature, local)
- Add blank line between groups
- Sort imports alphabetically within each group
- Never use `@/` when `@shared/`, `@features/`, or `@core/` applies
