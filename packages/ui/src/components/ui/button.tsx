import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Loader2 } from "lucide-react"
import * as React from "react"
import { Slot } from "radix-ui"

/**
 * Wearly buttons are pill-shaped, generously sized, and barely animated.
 *
 * Every value below resolves through a shared token — `rounded-button`,
 * `text-button`, `shadow-focus` — so re-theming the whole product's controls is
 * a change in `packages/design-tokens`, not a sweep through components.
 *
 * Heights use the 4px scale: `h-9` 36, `h-11` 44, `h-12` 48, `h-13` 52. The 44px
 * default is the WCAG 2.2 minimum target size.
 */
const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-button",
    "text-button whitespace-nowrap select-none",
    // Motion: a short ease-out on colour only, so press feedback feels tactile
    // without a transform that could shift surrounding layout.
    "transition-[background-color,color,border-color,box-shadow,opacity]",
    "duration-150 ease-out",
    "focus-visible:ring-4 focus-visible:ring-ring/25 focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
    "aria-busy:cursor-progress",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "[&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70 active:bg-secondary",
        // Soft pink wash — the "quiet" primary for secondary actions.
        soft: "bg-accent text-accent-foreground hover:bg-accent/70 active:bg-accent",
        outline:
          "border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground hover:border-border active:bg-accent",
        ghost:
          "text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 active:bg-destructive focus-visible:ring-destructive/25",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 gap-1.5 px-4 text-button-sm has-[>svg]:px-3",
        default: "h-11 px-5 has-[>svg]:px-4",
        lg: "h-12 gap-2.5 px-6 text-button-lg has-[>svg]:px-5",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    compoundVariants: [
      // Ghost and link have no fill, so the focus ring needs its own contrast
      // rather than inheriting the filled treatment.
      { variant: "ghost", class: "focus-visible:ring-ring/30" },
      { variant: "link", class: "h-auto rounded-none p-0 focus-visible:ring-2" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /**
   * Shows a spinner, blocks interaction, and sets `aria-busy`. The label stays
   * mounted so the button does not change width mid-request.
   */
  loading?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  // `asChild` hands the props to a single child element, so a spinner and a
  // second child would break the Slot contract. Fall back to the plain button.
  if (asChild) {
    return (
      <Slot.Root
        className={cn(buttonVariants({ variant, size, className }))}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        {...props}
      >
        {children}
      </Slot.Root>
    )
  }

  return (
    <button
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      disabled={disabled ?? loading}
      type="button"
      {...props}
    >
      {loading && (
        <Loader2
          aria-hidden="true"
          className="animate-spin motion-reduce:animate-none"
        />
      )}
      {children}
    </button>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
