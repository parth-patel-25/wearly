---
description: Enforce using logger utility, never console directly
globs: ["**/*.ts", "**/*.tsx"]
---

# Logger Rules (MANDATORY)

## NEVER Use Console Directly
- **NEVER use `console.log()`, `console.info()`, `console.debug()`**
- **ALWAYS use the logger utility** from `@shared/lib/logger`
- After implementation, **REMOVE all direct console statements**

## Logger Usage
```typescript
import { logger, createLogger } from "@shared/lib/logger"

// Global logger
logger.info("User logged in")
logger.error("API call failed", error)

// Feature-specific logger (recommended)
const authLogger = createLogger("Auth")
authLogger.info("Login attempt")
authLogger.error("Login failed", { email })
```

## Log Levels & Behavior
| Level | Development | Production | Use Case |
|-------|-------------|------------|----------|
| `debug` | Enabled | Disabled | Debug info, variable values |
| `info` | Enabled | Disabled | Flow tracking, confirmations |
| `warn` | Enabled | Enabled | Potential issues, deprecations |
| `error` | Enabled | Enabled | Errors, failures, exceptions |

## When to Use Each Level
```typescript
// DEBUG - Detailed debugging info (dev only)
logger.debug("Fetching user data", { userId, endpoint })

// INFO - General flow messages (dev only)
logger.info("Component mounted")

// WARN - Potential issues (always logged)
logger.warn("Using deprecated API endpoint")

// ERROR - Errors and failures (always logged)
logger.error("Failed to fetch user data", error)
```

## Creating Feature Loggers
```typescript
// features/auth/services/auth.service.ts
import { createLogger } from "@shared/lib/logger"

const logger = createLogger("Auth")

export const authService = {
  login: async (credentials: LoginCredentials) => {
    logger.info("Login attempt", { email: credentials.email })
    try {
      const result = await apiClient.post("/auth/login", credentials)
      logger.info("Login successful")
      return result.data
    } catch (error) {
      logger.error("Login failed", error)
      throw error
    }
  },
}
```
