import { cn } from "cn"
import * as React from "react"

/**
 * Soft, approachable fields. 16px radius, a 44px default height, and a focus
 * ring that reads as a rose glow rather than a hard outline.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full min-w-0 rounded-input border border-input bg-card px-4 py-2",
        "text-body-md shadow-soft",
        "transition-[color,box-shadow,border-color] duration-150 ease-out",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-body-sm file:font-medium file:text-foreground",
        "placeholder:text-muted-foreground",
        "focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      data-slot="input"
      type={type}
      {...props}
    />
  )
}

export { Input }
