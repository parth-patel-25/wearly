import { useEffect, useState } from "react";
import { Uniwind } from "uniwind";

/**
 * The theme the app launches into.
 *
 * Wearly ships a light and a dark palette, and both are real. The default is
 * **light**, not "whatever the device is doing", for two reasons.
 *
 * The first is design. `DESIGN_SYSTEM.md` §10 originally asked the app to follow
 * the OS scheme, which is right for a shipped product and wrong for reviewing one:
 * the palette a designer is actually looking at changes depending on which phone
 * is on the desk. Pinning the default to light means the light theme is the one
 * that gets looked at, and dark is something you choose to go and check.
 *
 * The second is that light is the palette the brand is drawn in — the soft rose,
 * the warm off-white, the "blush" that the whole colour system is tuned around.
 * It is the reference render, not one of two equally weighted options.
 *
 * `EXPO_PUBLIC_WEARLY_THEME` still overrides this for a forced run, and the
 * in-app toggle in `theme-toggle.tsx` starts from the same resolved value so the
 * control never disagrees with the screen.
 */

export type ThemePreference = "dark" | "light" | "system";

/** The preference the app opens with when nothing overrides it. */
export const DEFAULT_THEME: ThemePreference = "light";

const raw = process.env.EXPO_PUBLIC_WEARLY_THEME;

/**
 * The theme the environment forces, or `null`.
 *
 * Exported rather than kept private so the in-app theme toggle can start from the
 * same value instead of claiming "Auto" while the app is actually pinned to dark —
 * a control that lies about the current state is worse than no control.
 */
export const FORCED_THEME: ThemePreference | null =
  raw === "light" || raw === "dark" ? raw : null;

/** The preference the app actually starts in. */
export const INITIAL_THEME: ThemePreference = FORCED_THEME ?? DEFAULT_THEME;

/**
 * Applies {@link INITIAL_THEME} before anything paints.
 *
 * Called from the root layout, and deliberately an effect rather than a call
 * during render: `Uniwind.setTheme` notifies every subscriber, so doing it in the
 * render body would re-render the tree that is still being built. The dummy state
 * exists so Uniwind's re-render actually lands in React.
 */
export function useThemeOverride(): void {
  const [, setApplied] = useState(false);

  useEffect(() => {
    Uniwind.setTheme(INITIAL_THEME);
    setApplied(true);
  }, []);
}
