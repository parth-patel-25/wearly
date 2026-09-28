# Coding Rules for AI Agents

## Project Structure

```
src/
├── shared/          # Globally shared across all features
│   ├── components/  # Reusable UI components (ui/, layout/, common/)
│   ├── hooks/       # Shared custom hooks
│   ├── lib/         # Utility functions and helpers
│   ├── stores/      # Global Zustand stores
│   ├── types/       # Shared TypeScript types
│   └── constants/   # App-wide constants
├── core/            # Core app configuration
│   ├── providers/   # Context providers (Query, Theme, Auth)
│   ├── routing/     # Route definitions
│   ├── config/      # App configuration
│   └── middleware/   # API interceptors, guards
└── features/        # Feature-based modules
    └── [feature]/
        ├── components/   # Feature-specific components
        ├── hooks/        # Feature-specific hooks
        ├── services/     # API calls and business logic
        ├── validations/  # Zod validation schemas (MANDATORY)
        ├── types/        # Feature-specific types
        └── index.tsx     # Feature entry point
```

## File Size Rules

### MAX 200 Lines Per File
- **Every file must stay under 200 lines of code**
- If a file exceeds 200 lines, split it into smaller files
- Components: Extract sub-components or custom hooks
- Services: Split by domain or operation type
- Types: Move to separate type files

### Exceptions
- Generated files (types from API schemas)
- Configuration files (vite.config.ts, tsconfig.json)

## Component Rules

### File Naming
- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Hooks: `kebab-case.ts` (e.g., `use-auth.ts`)
- Utils: `kebab-case.ts` (e.g., `format-date.ts`)
- Types: `index.ts` in types folder
- Constants: `index.ts` in constants folder

### Component Structure
```tsx
// 1. Imports
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"

// 2. Types
interface ComponentProps {
  title: string
  onSubmit: () => void
}

// 3. Component
export function Component({ title, onSubmit }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState(false)

  // 5. Handlers
  const handleClick = () => {
    setState(!state)
    onSubmit()
  }

  // 6. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Toggle</Button>
    </div>
  )
}
```

## Component Architecture Rules (MANDATORY)

### Purpose

Keep features easy to understand, change, test, and extend. The goal is **not** to make every file small. The goal is to create clear ownership boundaries so each component owns only the state, data, and behavior it is actually responsible for.

---

### Rule 1 — Pass Narrow Props, Not the Entire Feature

**Avoid** passing large feature objects, complete permission models, unrelated state, or many callbacks through component layers when the child only needs a small part of them.

```tsx
// ❌ AVOID
<UsersTable
  user={user}
  permissions={permissions}
  filters={filters}
  selectedUser={selectedUser}
  loading={loading}
  deleteUser={deleteUser}
  updateUser={updateUser}
  setModalOpen={setModalOpen}
  notifications={notifications}
/>
```

```tsx
// ✅ PREFER
<UsersTable
  rows={users}
  onRowSelected={handleUserSelected}
/>
```

A child should understand its own responsibility, not the entire page. If a component needs 10–15 unrelated props, stop and check whether its contract is too broad.

---

### Rule 2 — Avoid Unnecessary New Objects, Arrays, and Functions During Render

React creates new object and array references when they are declared during render.

```tsx
// ❌ AVOID — static config recreated on every render
<ResultsTable
  columns={[
    { key: "name", label: "Name" },
    { key: "status", label: "Status" },
  ]}
  options={{ selectable: true }}
/>
```

```tsx
// ✅ PREFER — static config outside the component
const columns = [
  { key: "name", label: "Name" },
  { key: "status", label: "Status" },
]

const options = {
  selectable: true,
}

function UsersPage() {
  return <ResultsTable columns={columns} options={options} />
}
```

**Do NOT blindly add `useMemo` and `useCallback` everywhere.** First ask:

1. Is this value actually expensive to create?
2. Does reference identity affect a memoized child?
3. Does it affect an effect or subscription?
4. Can the value simply live outside the component?
5. Can the child receive primitive values instead?

Use memoization when it solves a real problem, not as a default rule.

---

### Rule 3 — Avoid One Giant Query for the Entire Screen

Do not create one page-sized API/query response containing everything the screen might ever need.

```tsx
// ❌ AVOID
const { data } = useQuery({
  queryKey: ["dashboard"],
  queryFn: getEverything, // returns { stats, users, history, permissions, filters, modalData }
})
```

This makes unrelated parts of the UI dependent on the same request.

```tsx
// ✅ PREFER — meaningful data boundaries
function Dashboard() {
  return (
    <>
      <Stats />
      <UsersTable />
      <History />
    </>
  )
}

function Stats() {
  const { data } = useQuery({ queryKey: ["stats"], queryFn: getStats })
  return <StatsView data={data} />
}

function UsersTable() {
  const { data } = useQuery({ queryKey: ["users"], queryFn: getUsers })
  return <Table data={data} />
}
```

**Do NOT make a network request for every tiny component.** Use boundaries based on meaningful feature lifecycles:

- Primary content
- Secondary panel
- History
- Details
- Expensive/optional data

The goal is to avoid unnecessary coupling, not to maximize the number of API requests.

---

### Rule 4 — Avoid Generic Components With Dozens of Boolean Flags

Do not create one "universal" component that supports many unrelated workflows through boolean props. When flags interact, the number of possible states grows rapidly.

```tsx
// ❌ AVOID
<DataTable
  searchable
  selectable
  showToolbar
  allowExport={canExport}
  inlineEdit={mode === "admin"}
  compact={isInsideModal}
  hidePagination={rows.length < 20}
  stickyHeader={!isMobile}
/>
```

```tsx
// ✅ PREFER — composition
<Table>
  <Toolbar />
  <TableBody />
  <Pagination />
</Table>
```

Or create a specific feature when the workflow is genuinely different:

```tsx
// ✅ PREFER
<EditableUsersTable />
```

Reuse genuine structure. Do not force different workflows into one component just because their UI looks similar. Some duplication is acceptable when it prevents a complicated conditional component from becoming a second application.

---

### Rule 5 — Let Substantial Modals Own Their Internal State

The page decides **which record/action is being opened**. The modal/dialog owns its internal form and workflow state.

```tsx
// ❌ AVOID — page owns table, modal, form, validation, saving, and errors
function UsersPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  // ...
}
```

```tsx
// ✅ PREFER — page owns selection only
function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  return (
    <>
      <UsersTable onEdit={setSelectedUser} />

      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  )
}
```

```tsx
// ✅ PREFER — dialog owns its workflow
function EditUserDialog({ user, onClose }: EditUserDialogProps) {
  const [name, setName] = useState(user.name)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {
    setSaving(true)
    try {
      await updateUser(user.id, { name })
      onClose()
    } catch {
      setError("Failed to save user")
    } finally {
      setSaving(false)
    }
  }

  return <Dialog>{/* dialog form */}</Dialog>
}
```

**Ownership rule**

Parent owns:
- Which record is selected
- Whether the feature should be opened
- What should happen after success

Modal owns:
- Form fields
- Validation
- Submission state
- Internal steps
- Local errors
- Dialog-specific async behavior

---

### Rule 6 — Move Permission Decisions Out of Scattered JSX

Avoid repeating raw business rules throughout JSX.

```tsx
// ❌ AVOID
{user.role === "admin" && record.status !== "archived" && <DeleteButton />}
{user.role === "admin" && <EditButton />}
```

This makes business policy difficult to find and easy to make inconsistent.

```tsx
// ✅ PREFER — explicit capabilities
const capabilities = getRecordCapabilities({ user, record, organization })
// => { canEdit: true, canDelete: false, canExport: true }
```

```tsx
// ✅ PREFER — JSX becomes simple
{capabilities.canEdit && <EditButton />}
{capabilities.canDelete && <DeleteButton />}
{capabilities.canExport && <ExportButton />}
```

**Important security rule:** Frontend permission checks are for UI behavior. They are **NOT** the real security boundary. The backend must still enforce authorization:

```ts
if (!userCanDelete) {
  return res.status(403).json({ message: "Forbidden" })
}
```

Keep authorization policy centralized and testable whenever practical.

---

### Rule 7 — Avoid Page-Wide `isLoading` and `error` for Unrelated Operations

Do not use one loading/error state for several independent workflows. If the page can load, refresh, save, delete, and export, then one `isLoading` cannot accurately describe all operations.

```tsx
// ❌ AVOID
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState(null)
```

```tsx
// ✅ PREFER — operation-specific status
const [isSaving, setIsSaving] = useState(false)
const [isDeleting, setIsDeleting] = useState(false)
const [isExporting, setIsExporting] = useState(false)
```

```tsx
// ✅ PREFER
<button disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</button>
<button disabled={isDeleting}>{isDeleting ? "Deleting..." : "Delete"}</button>
<button disabled={isExporting}>{isExporting ? "Exporting..." : "Export"}</button>
```

**Error ownership:** Prefer errors to stay close to the workflow that caused them.

- Table request failure → table retry UI
- Save failure → form/dialog error
- Export failure → export action error
- Optional history failure → history retry UI

Do not make the entire page unusable because an optional section failed.

---

### Component Ownership Checklist

Before creating or modifying a large component, ask:

**Props**
- Does this child receive only what it needs?
- Am I passing the entire feature object unnecessarily?
- Are there too many unrelated props?

**Render values**
- Am I creating static objects/arrays/functions on every render?
- Does reference identity actually matter?
- Can static configuration move outside the component?
- Am I using `useMemo`/`useCallback` without a real reason?

**Data**
- Is one query loading unrelated data?
- Does each meaningful feature have an appropriate data boundary?
- Am I creating too many tiny requests?

**Reuse**
- Is this component becoming a collection of boolean flags?
- Are the flags interacting in many combinations?
- Would composition or a focused component be clearer?

**Modals**
- Does the page own form state that belongs to the modal?
- Can the modal own its draft, validation, saving, and errors?

**Permissions**
- Are raw permission/business rules scattered through JSX?
- Can I expose named capabilities instead?
- Is backend authorization still enforcing the actual security?

**Loading/Error**
- Does one `isLoading` represent multiple operations?
- Does one `error` represent multiple unrelated failures?
- Can status and errors belong to the operation that owns them?

---

### What NOT To Do

Do not apply these rules mechanically. Avoid:

- Adding `useMemo`/`useCallback` everywhere.
- Creating an API request for every component.
- Removing all duplication at any cost.
- Creating abstractions only because two screens look visually similar.
- Moving every piece of state into another file without clear ownership.
- Treating frontend permission checks as security.
- Making the parent coordinate every child workflow.

---

### Primary Principle

When deciding where code belongs, ask:

> **"Who is responsible for this decision?"**

- If the answer is the table, keep it with the table.
- If the answer is the modal, keep it with the modal.
- If the answer is a permission policy, centralize the capability decision.
- If the answer is an API/data lifecycle, give that feature an appropriate data boundary.
- If several unrelated workflows depend on one parent, reconsider the ownership boundaries.

**Final Rule:** Do not optimize for smaller files. Optimize for:

1. Clear ownership
2. Narrow component contracts
3. Independent feature lifecycles
4. Predictable state
5. Explicit business decisions
6. Meaningful data boundaries
7. Components that know only what they need to know

A component can remain large when the interface itself is large. The problem is not the number of lines. The problem is when one component becomes responsible for too many unrelated decisions.

## Form Validation Rules (MANDATORY)

### Every Input MUST Have Validation
- **ANY user input field** (Input, Textarea, Select, Checkbox, RadioGroup, Switch, custom controls) **MUST be validated**
- **NEVER render an input without a validation schema**
- **NEVER trust raw form data** - validate before submit, before API calls, and before persisting

### Feature-Based Validations Folder (MANDATORY)
- ALL validation schemas live in `src/features/[feature]/validations/`
- **NEVER** place schemas in components, hooks, or services

```
src/features/[feature]/validations/
├── index.ts              # Barrel exports
└── [entity].schema.ts    # e.g. login.schema.ts, user-profile.schema.ts
```

- Files: `kebab-case.schema.ts` (e.g., `login.schema.ts`)
- Schema exports: `PascalCaseSchema` (e.g., `LoginSchema`)
- Derived types: `type LoginInput = z.infer<typeof LoginSchema>`

### Validation Library
- Use `zod` for ALL validation schemas
- Use `react-hook-form` with `zodResolver` for forms
- Derive input types with `z.infer` - never hand-write duplicate types
- Never write manual inline validation when a schema can express it

### Context-Aware Validation (MANDATORY)
- Consider the **context and purpose** of each input before writing rules
- The same field has different requirements per context (e.g., password for login = required only; password for signup = min 8 + uppercase + lowercase + number)
- Base rules on what the field is FOR, the data source, and business requirements
- Use `.refine()` / `.superRefine()` for cross-field rules (e.g., confirm password matches)

### Toast on Validation Errors (MANDATORY)
- On validation failure, **ALWAYS** show an error toast via `sonner` (`toast.error`)
- Show the **FIRST** validation error message in the toast
- Keep inline field-level errors as well - toast + inline errors together
- **NEVER** silently swallow validation errors
- Server/API validation errors (e.g., 400 responses) must also surface as `toast.error`

```tsx
const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
  resolver: zodResolver(LoginSchema),
})

const onInvalid = (errs: FieldErrors<LoginInput>) => {
  const first = Object.values(errs)[0]
  toast.error(first?.message ?? "Please fix the highlighted fields")
}

return <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
```

### Validation Checklist
- [ ] Every input registered and covered by a zod schema
- [ ] Schema lives in `features/[feature]/validations/`
- [ ] Rules match the input's context
- [ ] `zodResolver` wired into `useForm`
- [ ] Inline error message rendered for every field
- [ ] `toast.error` fires with the first error on invalid submit

## Data Display Rules

### USE TanStack Virtual for Large Lists
- **ANY list with 50+ items MUST use `@tanstack/react-virtual`**
- Do NOT use `.map()` for large datasets
- Implement virtual scrolling for performance
- Example patterns:

```tsx
// GOOD: Virtualized list
import { useVirtualizer } from "@tanstack/react-virtual"

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  })

  return (
    <div ref={parentRef} className="h-[500px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div key={virtualRow.key} style={virtualRow.style}>
            {items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  )
}

// BAD: Raw map for large lists
function List({ items }: { items: Item[] }) {
  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

### When to Use TanStack Virtual
- Data tables with 100+ rows
- Dropdowns with many options (50+)
- Infinite scroll lists
- Any scrollable content with dynamic/unknown length
- Chat messages, logs, activity feeds

## State Management Rules

### Local State
- Use `useState` for simple component state
- Use `useReducer` for complex local state
- Keep state as close to where it's used as possible

### Global State (Zustand)
- Use Zustand for shared application state
- Create feature-specific stores in `features/[name]/stores/`
- Create global stores in `shared/stores/`
- Use devtools middleware for debugging
- Use persist middleware for localStorage

### Server State (React Query)
- Use React Query for ALL API calls
- Define query keys in `shared/constants/`
- Use custom hooks for data fetching
- Implement proper caching strategies
- Handle loading and error states

## Import Rules

### Path Aliases
- Use `@shared/` for imports from `src/shared/`
- Use `@features/` for imports from `src/features/`
- Use `@core/` for imports from `src/core/`
- Use `@/` as fallback for any `src/` import
- NEVER use relative paths for shared imports

### Import Examples
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

### Import Order
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

## Type Rules

- Use TypeScript strict mode
- Define types in feature-specific `types/` folders
- Export types from `index.ts` barrel files
- Use `interface` for object shapes
- Use `type` for unions, intersections, and utilities
- Never use `any` - use `unknown` and narrow types

## Logger Rules (MANDATORY)

### NEVER Use Console Directly
- **NEVER use `console.log()`, `console.info()`, `console.debug()`**
- **ALWAYS use the logger utility** from `@/shared/lib/logger`
- After implementation, **REMOVE all direct console statements**

### Logger Usage
```typescript
import { logger, createLogger } from "@/shared/lib/logger"

// Global logger (for small apps)
logger.info("User logged in")
logger.error("API call failed", error)

// Feature-specific logger (recommended)
const authLogger = createLogger("Auth")
authLogger.info("Login attempt")
authLogger.error("Login failed", { email })

// Child logger (for sub-modules)
const apiLogger = logger.child("API")
apiLogger.debug("Request sent")
```

### Log Levels & Behavior
| Level | Development | Production | Use Case |
|-------|-------------|------------|----------|
| `debug` | ✅ Enabled | ❌ Disabled | Debug info, variable values |
| `info` | ✅ Enabled | ❌ Disabled | Flow tracking, confirmations |
| `warn` | ✅ Enabled | ✅ Enabled | Potential issues, deprecations |
| `error` | ✅ Enabled | ✅ Enabled | Errors, failures, exceptions |

### When to Use Each Level
```typescript
// DEBUG - Detailed debugging info (dev only)
logger.debug("Fetching user data", { userId, endpoint })

// INFO - General flow messages (dev only)
logger.info("Component mounted")
logger.info("Form submitted successfully")

// WARN - Potential issues (always logged)
logger.warn("Using deprecated API endpoint")
logger.warn("Cache miss, fetching fresh data")

// ERROR - Errors and failures (always logged)
logger.error("Failed to fetch user data", error)
logger.error("Authentication failed", { reason: "Invalid token" })
```

### Creating Feature Loggers
```typescript
// features/auth/services/auth.service.ts
import { createLogger } from "@/shared/lib/logger"

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

### ESLint Rule
Add to `.eslintrc` to enforce logger usage:
```json
{
  "rules": {
    "no-console": ["error", { "allow": ["warn", "error"] }]
  }
}
```

## API Rules

### Centralized API Routes (MANDATORY)
- **ALL API routes MUST be defined in `@shared/api/index.ts`**
- **NEVER hardcode route strings in services or components**
- **Add new endpoints here FIRST before using them**

```typescript
// src/shared/api/index.ts
export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
  },
  USERS: {
    BASE: "/users",
    BY_ID: (id: string) => `/users/${id}`,
  },
} as const
```

### API Client
- Use the shared `apiClient` from `@shared/lib/api-client`
- Create feature-specific API functions in `services/`
- Handle errors consistently with toast notifications

### API Function Structure
```typescript
// features/users/services/user.service.ts
import { apiClient } from "@shared/lib/api-client"
import { API_ROUTES } from "@shared/constants/api-routes"
import type { User, PaginatedResponse, PaginationParams } from "@shared/types"

export const userService = {
  getList: (params: PaginationParams) =>
    apiClient.get<PaginatedResponse<User>>(API_ROUTES.USERS.BASE, { params }),

  getById: (id: string) =>
    apiClient.get<User>(API_ROUTES.USERS.BY_ID(id)),

  create: (data: Omit<User, "id" | "createdAt" | "updatedAt">) =>
    apiClient.post<User>(API_ROUTES.USERS.BASE, data),

  update: (id: string, data: Partial<User>) =>
    apiClient.put<User>(API_ROUTES.USERS.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(API_ROUTES.USERS.BY_ID(id)),
}
```

## CSS Rules

- Use Tailwind CSS for all styling
- Use `cn()` utility for conditional classes
- Use shadcn/ui design tokens (colors, spacing, etc.)
- Keep responsive design mobile-first
- Use CSS variables for theme values
- **NEVER use hard-coded px values** - Always use responsive units

### Responsive Units (MANDATORY)

| Unit | Use Case | Example |
|------|----------|---------|
| `rem` | Font sizes, spacing, dimensions | `text-base` (1rem), `p-4` (1rem) |
| `em` | Component-relative sizing | `w-[10em]` |
| `%` | Width, percentage layouts | `w-full` (100%), `w-1/2` (50%) |
| `vw/vh` | Viewport-relative | `h-screen` (100vh), `w-screen` (100vw) |
| Tailwind spacing | All spacing | `p-4`, `m-2`, `gap-4` |

### BAD (Never Do This)
```tsx
// ❌ Hard-coded px values
<div style={{ width: "200px", height: "100px", fontSize: "16px" }}>
<div className="w-[200px] h-[100px] text-[16px]">

// ❌ Inline styles with px
<div style={{ padding: "16px", margin: "8px" }}>
```

### GOOD (Always Do This)
```tsx
// ✅ Tailwind responsive classes
<div className="w-48 h-24 text-base">    {/* 12rem, 6rem, 1rem */}
<div className="p-4 m-2 gap-4">          {/* 1rem, 0.5rem, 1rem */}

// ✅ Responsive with breakpoints
<div className="w-full md:w-1/2 lg:w-1/3">

// ✅ CSS variables for dynamic values
<div style={{ width: "var(--container-width)" }}>

// ✅ clamp() for fluid typography
<div style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)" }}>
```

### Tailwind Spacing Reference
- `p-1` = 0.25rem (4px)
- `p-2` = 0.5rem (8px)
- `p-3` = 0.75rem (12px)
- `p-4` = 1rem (16px)
- `p-5` = 1.25rem (20px)
- `p-6` = 1.5rem (24px)
- `p-8` = 2rem (32px)
- `p-10` = 2.5rem (40px)
- `p-12` = 3rem (48px)
- `p-16` = 4rem (64px)

### Exceptions (Only Allowed)
- SVG elements with fixed viewBox
- Border widths (1px, 2px are acceptable)
- Box shadows and outlines
- Absolute positioning in specific cases
- Third-party library styles

## Testing Rules

- Write unit tests for utilities and hooks
- Write integration tests for features
- Use React Testing Library for component tests
- Mock API calls in tests
- Aim for 80% code coverage

## Performance Rules

- Use React.memo for expensive components
- Use useMemo for expensive calculations
- Use useCallback for event handlers passed to children
- Lazy load features and heavy components
- Use code splitting with React.lazy

## Git Rules

### Commit Message Format (MANDATORY)
```
<icon> <type>: <description>
```

### Commit Types & Icons
| Icon | Type | Description |
|------|------|-------------|
| ✨ | feature | New feature |
| 🐞 | fix | Bug fix |
| 📄 | docs | Documentation |
| 🚅 | perfs | Performance |
| ♻️ | refactor | Code refactoring |
| 🎨 | style | UI/Style changes |
| ✅ | test | Adding tests |
| 🔧 | chore | Maintenance |
| ⚡ | hotfix | Critical fix |
| 🚀 | deploy | Deployment |

### Rules
- **ONE LINER ONLY** - Single line commits
- **Max 100 characters** recommended
- Use **imperative mood** ("add" not "added")
- **No period** at end
- Be **specific but concise**

### Examples
```
✨feature: add user authentication system
🐞 fix: resolve memory leak in useEffect
📄 docs: update API integration guide
HTTPRequestOperation perfs: implement virtual scrolling
♻️ refactor: extract shared hooks
🎨 style: add dark mode support
✅ test: add unit tests for API client
🔧 chore: upgrade React to v19
⚡ hotfix: fix critical security issue
🚀 deploy: setup GitHub Actions workflow
```

### Bad Examples
```
❌ fixed stuff
❌ WIP
❌ updates
❌ fix bug
❌ added new feature
```

Keep commits small and focused. Never commit secrets or API keys.

## Documentation Rules (MANDATORY)

### Update Docs Before Implementation
- **ALWAYS update documentation BEFORE implementing new features or changes**
- Never implement without updating docs first

### Documentation Checklist
Before implementing any change, update:

1. **README.md** - If adding new features or changing tech stack
2. **docs/features.md** - For new features or feature changes
3. **docs/components.md** - For new components
4. **docs/hooks.md** - For new hooks
5. **docs/api.md** - For API changes
6. **AGENTS.md** - For new coding rules

### Implementation Flow
```
1. Update Documentation (FIRST)
2. Implement Feature
3. Update Tests
4. Final Review
5. Done
```

### Documentation Templates

#### New Feature Template
```markdown
## Feature Name

**Location:** `src/features/feature-name/`

### Description
Brief description of the feature.

### Components
- `ComponentName` - Description

### Hooks
- `useHookName` - Description

### Services
- `serviceName.service.ts` - Description

### Implementation Status
- [ ] Component 1
- [ ] Hook 1
```

#### New Component Template
```markdown
### ComponentName
**File:** `component-name.tsx`

Description of the component.

```tsx
// Usage example
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| prop1 | string | - | Description |
```
---

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bun x ultracite fix`
- **Check for issues**: `bun x ultracite check`
- **Diagnose setup**: `bun x ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**
- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**
- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**
- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `bun x ultracite fix` before committing to ensure compliance.
