import { cn } from "cn";
import type * as React from "react";
import type { Swatch } from "./data";

function SwatchCard({
  className,
  foregroundClassName,
  hex,
  note,
  token,
  ...props
}: Swatch & React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-card border border-border shadow-soft",
        className
      )}
      {...props}
    >
      <div className={cn("h-16 w-full border-border border-b", className)} />
      <div className="flex flex-col gap-1 p-3">
        <code className={cn("text-caption", foregroundClassName)}>{token}</code>
        <span className={cn("text-caption opacity-80", foregroundClassName)}>
          {hex}
        </span>
        {note ? (
          <span
            className={cn("mt-1 text-caption opacity-80", foregroundClassName)}
          >
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
