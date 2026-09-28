---
description: Enforce zod validation for every input, context-aware rules, feature-based validations folder, and error toasts
globs: ["**/*.tsx", "**/*.ts"]
---

# Form Validation Rules (MANDATORY)

## Every Input MUST Have Validation
- ANY user input field (`Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Combobox`, OTP, custom controls) MUST be validated
- **NEVER render an input without a validation schema**
- **NEVER trust raw form data** - always validate before submit, before sending to an API, or before persisting
- A form without validation is a bug, not an omission

## Feature-Based Validations Folder (MANDATORY)
- ALL validation schemas live in `src/features/[feature]/validations/`
- **NEVER** place schemas inside components, hooks, or services

```
src/
└── features/
    └── [feature]/
        ├── validations/            # Zod schemas (MANDATORY)
        │   ├── index.ts            # Barrel exports
        │   └── [entity].schema.ts  # e.g. login.schema.ts, user-profile.schema.ts
        ├── components/
        ├── hooks/
        ├── services/
        ├── types/
        └── index.tsx
```

### Naming
- Files: `kebab-case.schema.ts` (e.g., `user-profile.schema.ts`)
- Schema exports: `PascalCaseSchema` (e.g., `LoginSchema`, `UserProfileSchema`)
- Derived types: `PascalCaseInput` (e.g., `type LoginInput = z.infer<typeof LoginSchema>`)

### Validations Folder Example
```typescript
// src/features/auth/validations/login.schema.ts
import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export type LoginInput = z.infer<typeof LoginSchema>
```

```typescript
// src/features/auth/validations/index.ts
export * from "./login.schema"
export * from "./register.schema"
```

## Validation Library (MANDATORY)
- **ALWAYS** use `zod` for validation schemas
- **ALWAYS** use `react-hook-form` with `zodResolver` for forms
- **ALWAYS** derive input types with `z.infer` - NEVER hand-write types that duplicate schemas
- **NEVER** write manual inline validation logic (if/else chains, regex in components) when a zod schema can express it

## Context-Aware Validation (MANDATORY)
Always consider the **context and purpose** of each input before writing its rules.
The same field type has different requirements depending on where it lives:

| Input | Context | Required Validation |
|-------|---------|--------------------|
| Email | Login | Required + valid email format |
| Email | Signup/Contact | Required + valid email + max length (e.g., 254) |
| Password | Login | Required only |
| Password | Signup | Required + min 8 + uppercase + lowercase + number |
| Name | Profile | Required + length (2-50) + letters/spaces only |
| Name | Comment/Username | Length (3-20) + alphanumeric, no spaces |
| Phone | US domestic form | Required + US format `(555) 555-5555` |
| Phone | International contact | Required + E.164 format `+[country][number]` |
| Age/DOB | Adult-only app | Required + 18+ + must be past date |
| URL | Social links | Required + valid `http(s)` URL + allowlisted domain |
| Amount | Payment | Required + positive + max 2 decimal places + max cap |
| Age/DOB | Birthday celebrant | Required + valid past date, no 18+ gate |

### Rules for Context
- **NEVER** copy-paste a generic validator across features - re-evaluate for each context
- Base rules on what the field is FOR, the data source, and the business requirement
- Use `.refine()`, `.superRefine()`, and `.transform()` when context demands cross-field rules (e.g., "confirm password matches password")
- Only validate what the context needs - over-validation is as bad as no validation

## Toast on Validation Errors (MANDATORY)
- When validation fails, **ALWAYS** show an error toast via `sonner` (`import { toast } from "sonner"`)
- Show the **FIRST** validation error message in the toast (user-friendly, not code text)
- Keep inline field-level errors too - toast + inline errors together
- **NEVER** silently swallow validation errors
- Use `toast.error(...)` for validation failures (errors), NOT `toast.success` or `toast.info`

### Form Pattern
```tsx
// src/features/auth/components/LoginForm.tsx
import { useForm, type FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Input } from "@shared/components/ui/input"
import { Label } from "@shared/components/ui/label"
import { LoginSchema, type LoginInput } from "@features/auth/validations"

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  })

  const onInvalid = (errs: FieldErrors<LoginInput>) => {
    const first = Object.values(errs)[0]
    toast.error(first?.message ?? "Please fix the highlighted fields")
  }

  const onSubmit = (data: LoginInput) => {
    // data is fully validated here
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" aria-invalid={!!errors.password} {...register("password")} />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
    </form>
  )
}
```

### Toasts with React Query / Services
- API/server-side validation errors MUST also surface as `toast.error` (e.g., 400 "Email already exists")
- Never log-and-forget server validation failures

## Checklist Before Finishing Any Form
- [ ] Every input registered and covered by a zod schema
- [ ] Schema lives in `features/[feature]/validations/`
- [ ] Validation rules match the input's context
- [ ] `zodResolver` wired into `useForm`
- [ ] Inline field error message rendered for every field
- [ ] `toast.error` fires with the first error on invalid submit
- [ ] No input rendered without validation
