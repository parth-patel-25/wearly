import { cn } from "cn";
import type * as React from "react";

/**
 * A labelled block on the showcase page. Every section uses this so spacing and
 * heading rhythm stay consistent — which is also the thing the page is meant to
 * be demonstrating.
 */
export function Section({
  className,
  description,
  id,
  title,
  children,
  ...props
}: React.ComponentProps<"section"> & {
  description?: string;
  id: string;
  title: string;
}) {
  return (
    <section
      className={cn("flex flex-col gap-6", className)}
      id={id}
      {...props}
    >
      <header className="flex flex-col gap-1">
        <h2 className="text-heading-lg">{title}</h2>
        {description ? (
          <p className="max-w-2xl text-body-md text-muted-foreground">
            {description}
          </p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

/** A titled group inside a section, for sub-grouping without a new heading level. */
export function Group({
  className,
  label,
  children,
  ...props
}: React.ComponentProps<"div"> & { label: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <p className="text-label text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
