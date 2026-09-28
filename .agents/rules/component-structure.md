---
description: Enforce consistent component structure and naming
globs: ["**/*.tsx"]
---

# Component Rules (MANDATORY)

## File Naming
- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Hooks: `use-*.ts` (e.g., `use-auth.ts`)
- Utils: `*.ts` (e.g., `format-date.ts`)
- Types: `index.ts` in types folder
- Constants: `index.ts` in constants folder

## Component Structure
```tsx
// 1. Imports
import { cn } from "@shared/lib/utils"
import { Button } from "@shared/components/ui/button"

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

## Rules
- Use named exports for components
- Use `export default` only for feature entry points (index.tsx)
- Keep components pure and focused on single responsibility
- Extract complex logic to custom hooks
- Use TypeScript interfaces for props
- Forward refs when needed for DOM access
