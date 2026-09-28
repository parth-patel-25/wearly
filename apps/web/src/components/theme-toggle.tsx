"use client";

import { useTheme } from "next-themes";
import { useCallback } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <button
      className="rounded-md border border-border bg-secondary px-3 py-1.5 font-medium text-secondary-foreground text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      onClick={toggleTheme}
      type="button"
    >
      {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
