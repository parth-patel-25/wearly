"use client";

import { cn } from "cn";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

/**
 * Light/dark switch.
 *
 * Rendered as a neutral placeholder until mounted: `next-themes` only knows the
 * resolved theme on the client, so reading it during SSR would produce markup
 * that disagrees with the first client render.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <button
      aria-label={
        mounted && resolvedTheme === "dark"
          ? "Switch to light theme"
          : "Switch to dark theme"
      }
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-badge border border-border bg-card text-muted-foreground",
        "transition-colors duration-150 ease-out",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25",
        className
      )}
      onClick={toggleTheme}
      type="button"
    >
      {/* Both icons are always mounted and toggled by CSS, so the markup does
          not change between themes and hydration stays stable. */}
      <Sun
        aria-hidden="true"
        className={cn(
          "size-4 transition-opacity duration-150",
          mounted && resolvedTheme === "dark" ? "opacity-0" : "opacity-100"
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          "absolute size-4 transition-opacity duration-150",
          mounted && resolvedTheme === "dark" ? "opacity-100" : "opacity-0"
        )}
      />
    </button>
  );
}
