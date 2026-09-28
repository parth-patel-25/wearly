---
description: Enforce TanStack Virtual for large lists, never raw map
globs: ["**/*.tsx"]
---

# TanStack Virtual Rules (MANDATORY)

## Use Virtual Scrolling for Large Lists
- **ANY list with 50+ items MUST use `@tanstack/react-virtual`**
- **Do NOT use `.map()` for large datasets**
- Implement virtual scrolling for performance

## When to Use TanStack Virtual
- Data tables with 100+ rows
- Dropdowns with many options (50+)
- Infinite scroll lists
- Any scrollable content with dynamic/unknown length
- Chat messages, logs, activity feeds

## Good Example (Virtualized)
```tsx
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
```

## Bad Example (Raw Map)
```tsx
// ❌ NEVER DO THIS FOR LARGE LISTS
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

## Small Lists Exception
- Lists with < 50 items can use `.map()`
- Still prefer virtualization for unknown/growing lists
