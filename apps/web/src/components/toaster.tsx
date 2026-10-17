"use client";

import { cn } from "cn";
import { useTheme } from "next-themes";
import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Sonner, wearing the Wearly skin.
 *
 * Sonner exposes its palette as CSS variables but hard-codes the silhouette, so
 * the job is split in two. The colour variables are set here — inline, because
 * an inline declaration beats Sonner's own runtime-injected stylesheet — and
 * the parts it does not expose (radius, elevation, padding, type) are finished
 * in `globals.css` under `.toaster`.
 *
 * `richColors` is deliberately not passed: the saturated stock fills are the
 * generic look the token pairs exist to replace. Each toast type is tinted with
 * the same soft `-background` / `-foreground` pair the mobile surface uses, so a
 * success reads identically on both platforms.
 */
const TOKEN_VARIABLES = {
  "--border-radius": "var(--wearly-radius-card)",
  "--normal-bg": "var(--wearly-popover)",
  "--normal-border": "var(--wearly-border)",
  "--normal-text": "var(--wearly-popover-foreground)",
} as CSSProperties;

export function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      {...props}
      className={cn("toaster group", props.className)}
      position={props.position ?? "top-center"}
      style={{ ...TOKEN_VARIABLES, ...props.style }}
      theme={(resolvedTheme ?? "system") as ToasterProps["theme"]}
    />
  );
}
