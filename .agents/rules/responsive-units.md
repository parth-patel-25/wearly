---
description: Enforce responsive units, never hard-coded px values
globs: ["**/*.tsx", "**/*.css"]
---

# Responsive Units Rules (MANDATORY)

## NEVER Use Hard-Coded px
- **NEVER use hard-coded px values** for styling
- **ALWAYS use responsive units** (rem, em, %, vw/vh, Tailwind spacing)

## Use Tailwind Spacing
```tsx
// GOOD
<div className="p-4 m-2 gap-4">

// BAD
<div style={{ padding: "16px", margin: "8px" }}>
```

## Tailwind Spacing Reference
| Class | Value |
|-------|-------|
| `p-1` | 0.25rem (4px) |
| `p-2` | 0.5rem (8px) |
| `p-3` | 0.75rem (12px) |
| `p-4` | 1rem (16px) |
| `p-5` | 1.25rem (20px) |
| `p-6` | 1.5rem (24px) |
| `p-8` | 2rem (32px) |
| `p-10` | 2.5rem (40px) |
| `p-12` | 3rem (48px) |
| `p-16` | 4rem (64px) |

## Fluid Typography
```tsx
// Use clamp() for fluid typography
<div style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)" }}>
```

## Exceptions (Only Allowed)
- SVG elements with fixed viewBox
- Border widths (1px, 2px are acceptable)
- Box shadows and outlines
- Absolute positioning in specific cases
- Third-party library styles
