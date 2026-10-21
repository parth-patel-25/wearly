"use client";

import { cn } from "cn";
import { Check, Info, TriangleAlert, X } from "lucide-react";
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
 * The result is the same pill the mobile toast draws: a `bg-card` surface, the
 * neutral hairline border, `rounded-pill`, a soft `shadow-float`, and a leading
 * `bg-primary` disc holding a white glyph. `richColors` is deliberately not
 * passed — the saturated stock fills are the generic look the tokens exist to
 * replace. Tone is carried by the glyph alone, so the four icons are passed in
 * as bare lucide shapes matching the mobile set (check, x, triangle-alert,
 * info), rather than Sonner's circle-enclosed defaults.
 */
const TOKEN_VARIABLES = {
  "--border-radius": "var(--wearly-radius-pill)",
  "--normal-bg": "var(--wearly-card)",
  "--normal-border": "var(--wearly-border)",
  "--normal-text": "var(--wearly-foreground)",
} as CSSProperties;

const ICONS = {
  error: <X aria-hidden="true" size={18} />,
  info: <Info aria-hidden="true" size={18} />,
  success: <Check aria-hidden="true" size={18} />,
  warning: <TriangleAlert aria-hidden="true" size={18} />,
};

export function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      {...props}
      className={cn("toaster group", props.className)}
      icons={ICONS}
      position={props.position ?? "top-center"}
      style={{ ...TOKEN_VARIABLES, ...props.style }}
      theme={(resolvedTheme ?? "system") as ToasterProps["theme"]}
    />
  );
}
