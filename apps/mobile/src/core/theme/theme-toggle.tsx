import type { ThemePreference } from "@core/theme/use-theme-override";
import { DEFAULT_THEME, INITIAL_THEME } from "@core/theme/use-theme-override";
import { AnimatedPressable, usePressScale } from "@wearly/ui-native/motion";
import { Text } from "@wearly/ui-native/text";
import { usePathname } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Uniwind, useUniwind } from "uniwind";

/**
 * A theme switch, for design review.
 *
 * The app opens in light — see `use-theme-override.ts` for why — and this is how
 * you go and look at the other one. Without it, reviewing the dark palette means
 * walking to device Settings every time, which is the fastest way to never review
 * it at all.
 *
 * So this is a three-state control — light, dark, follow the system — mounted above
 * every screen and stripped from release builds. It is a development affordance
 * and it says so: it is the one control in the product that exists to be looked at
 * rather than used.
 *
 * It is a *cycle* rather than a switch, because three states do not fit in a
 * switch, and a control that cannot show its own state is worse than one more tap.
 * The word on the pill is the preference, not the result, so "Auto" stays visible
 * while the phone is in dark mode — the label and the screen are allowed to
 * disagree, and the accessibility label is what reconciles them.
 */

const CYCLE: readonly ThemePreference[] = ["light", "dark", "system"];

const LABEL: Record<ThemePreference, string> = {
  dark: "Dark",
  light: "Light",
  system: "Auto",
};

/** Where a floating control would land on the brand moment and the first-run copy. */
const HIDDEN_ROUTES = new Set(["/splash", "/welcome"]);

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>(INITIAL_THEME);
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { theme } = useUniwind();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.94);

  if (!__DEV__ || HIDDEN_ROUTES.has(pathname)) {
    return null;
  }

  function cycle() {
    const index = CYCLE.indexOf(preference);
    const next = CYCLE[(index + 1) % CYCLE.length] ?? DEFAULT_THEME;
    setPreference(next);
    Uniwind.setTheme(next);
  }

  const current = LABEL[preference];

  return (
    // Absolutely positioned on purpose, and it is the sanctioned kind: the
    // control floats *above* the app rather than participating in any screen's
    // layout. Nothing reflows when it appears, and no screen has to know about
    // it. `toast.tsx` and the sticky bar on the product page are the other two
    // places Wearly does this.
    //
    // The small size and the `insets.top + 4` offset are load-bearing. Screens
    // start at `pt-safe` and add their own `pt-6`, so there is a 24px band
    // between the status bar and the first line of any header. A 32px pill
    // dropped in at `+4` ends 12px into that band and clears the text, where the
    // 36px version this started as overlapped the heading. `min-h-8` is 32px —
    // still above the 24px minimum, and this is a dev control, not a
    // user-reachable action.
    <View
      className="absolute top-0 right-0 z-50"
      pointerEvents="box-none"
      style={{ paddingRight: insets.right + 12, paddingTop: insets.top + 4 }}
    >
      <AnimatedPressable
        accessibilityHint="Switches between light, dark and following the system"
        accessibilityLabel={`Theme: ${current}, currently ${theme}`}
        accessibilityRole="button"
        className="min-h-8 flex-row items-center rounded-pill border border-border bg-card px-2.5 active:bg-muted"
        onPress={cycle}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={animatedStyle}
      >
        <Text tone="muted-foreground" variant="caption">
          {current}
        </Text>
      </AnimatedPressable>
    </View>
  );
}
