import { cn } from "cn";
import type * as React from "react";
import type { Swatch } from "./data";

function SwatchCard({
  className,
  hex,
  note,
  token,
  ...props
}: Swatch & React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-soft",
        className
      )}
      {...props}
    >
      <div className={cn("h-16 w-full border-border border-b", className)} />
      <div className="flex flex-col gap-1 p-3">
        <code className="text-caption text-foreground">{token}</code>
        <span className="text-caption text-muted-foreground">{hex}</span>
        {note ? (
          <span className="mt-1 text-caption text-muted-foreground">
            {note}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function SwatchGrid({
  items,
  ...props
}: { items: Swatch[] } & React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5",
        props.className
      )}
      {...props}
    >
      {items.map((item) => (
        <SwatchCard key={item.token} {...item} />
      ))}
    </div>
  );
}
