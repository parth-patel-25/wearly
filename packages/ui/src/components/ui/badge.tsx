import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import * as React from "react"
import { Slot } from "radix-ui"

/**
 * Badges stay quiet by default — a soft rose wash rather than a saturated fill.
 * The four status variants use the `-background` / `-foreground` token pairs so
 * the text always clears WCAG AA; the mid `--wearly-success` tone is for dots and
 * icons, never for text on a light surface.
 */
const badgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden",
    "rounded-badge border border-transparent px-2.5 py-0.5",
    "text-caption whitespace-nowrap",
    "transition-colors duration-150 ease-out",
    "focus-visible:ring-4 focus-visible:ring-ring/25 focus-visible:outline-none",
    "[&>svg]:pointer-events-none [&>svg]:size-3",
  ],
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        success: "bg-success-background text-success-foreground",
        warning: "bg-warning-background text-warning-foreground",
        info: "bg-info-background text-info-foreground",
        destructive: "bg-destructive-background text-destructive-foreground",
        outline: "border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        ghost: "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "px-2 py-0 text-[11px]",
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      className={cn(badgeVariants({ variant, size }), className)}
      data-size={size}
      data-slot="badge"
      data-variant={variant}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
