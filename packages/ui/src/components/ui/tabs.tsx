"use client"

import { cn } from "cn"
import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";

/**
 * Tabs sit in a soft rose pill so the active tab is obvious without a heavy
 * underline or a filled block.
 */
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      className={cn(
        "flex flex-col gap-4 data-[orientation=vertical]:flex-row",
        className
      )}
      data-slot="tabs"
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-pill bg-muted p-1",
        "data-[orientation=vertical]:flex-col",
        className
      )}
      data-slot="tabs-list"
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-pill px-4",
        "text-button-sm whitespace-nowrap text-muted-foreground",
        "transition-colors duration-150 ease-out",
        "hover:text-foreground",
        "focus-visible:ring-4 focus-visible:ring-ring/25 focus-visible:outline-none",
        "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-soft",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
      )}
      data-slot="tabs-trigger"
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn("flex-1 text-body-md outline-none", className)}
      data-slot="tabs-content"
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
