---
description: Enforce 200 lines max per file and feature-based architecture
globs: ["**/*.tsx", "**/*.ts"]
---

# File Size & Architecture Rules

## MAX 200 Lines Per File
- Every file MUST stay under 200 lines of code
- If a file exceeds 200 lines, split it into smaller files

### How to Split
- Components: Extract sub-components or custom hooks
- Services: Split by domain or operation type
- Types: Move to separate type files
- Utils: Split by functionality

### Exceptions
- Generated files (types from API schemas)
- Configuration files (vite.config.ts, tsconfig.json)

## Feature-Based Architecture
```
src/
├── shared/          # Globally shared across all features
├── core/            # Core app configuration
└── features/        # Feature-based modules
    └── [feature]/
        ├── components/
        ├── hooks/
        ├── services/
        ├── validations/  # Zod validation schemas (MANDATORY)
        ├── types/
        └── index.tsx
```

### Rules
- Keep features independent and self-contained
- Only import from shared/ and core/ in features
- Cross-feature imports should go through shared/
