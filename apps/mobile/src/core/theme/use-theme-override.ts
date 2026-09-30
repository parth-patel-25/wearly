import { useEffect, useState } from "react";
import { Uniwind } from "uniwind";

/**
 * A development-only theme override.
 *
 * The product follows the OS colour scheme, which is the right default and is
 * what `DESIGN_SYSTEM.md` §10 asks for. But it makes reviewing a *design*
 * awkward: a dark phone shows you the dark palette, and half the questions you
 * want to answer — is the blush warm enough, is the type hierarchy right, does
 * the card breathe — are questions about the light theme.
 *
 * So in development only, a theme can be forced from `EXPO_PUBLIC_WEARLY_THEME`.
 * It is stripped from production builds, because a switch that only exists on a
 * developer's machine is worse than no switch at all.
 */

type ForcedTheme = "dark" | "light" | null;

const raw = process.env.EXPO_PUBLIC_WEARLY_THEME;
const forced: ForcedTheme = raw === "light" || raw === "dark" ? raw : null;

/** `true` when a theme has been forced by the environment. */
export function isThemeForced(): boolean {
  return forced !== null;
}

export function useThemeOverride(): void {
  const [, setApplied] = useState(false);

  useEffect(() => {
    if (forced === null) {
      return;
    }
    Uniwind.setTheme(forced);
    setApplied(true);
  }, []);
}
