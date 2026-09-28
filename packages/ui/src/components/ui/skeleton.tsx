import { cn } from "cn"
import * as React from "react"

/**
 * Placeholder blocks for loading content.
 *
 * Built from `--wearly-radius-*` and the muted surface so a skeleton sits in the
 * same visual language as the real thing it stands in for. The shimmer is
 * suppressed under `prefers-reduced-motion`; a static placeholder is still
 * perfectly legible without it.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-muted motion-reduce:animate-none",
        className
      )}
      data-slot="skeleton"
      {...props}
    />
  )
}

export { Skeleton }
