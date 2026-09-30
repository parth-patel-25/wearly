import type { ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaListener,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { Uniwind } from "uniwind";

/**
 * The shared native provider stack. Order matters:
 *
 * 1. `GestureHandlerRootView` outermost, so every overlay in the app inherits a
 *    gesture root.
 * 2. `SafeAreaProvider`, which also feeds Uniwind the real device insets — that
 *    is what makes `pt-safe` and friends resolve instead of guessing.
 * 3. `Uniwind`'s inset subscription, so a class reading an inset updates when a
 *    notch, a home indicator or a keyboard changes it.
 *
 * Note on HeroUI Native: its `AppProviders` is deliberately **not** in this
 * stack. `heroui-native` re-exports `BottomSheet`, `Popover`, `Select` and
 * `GlassView` from its barrel, and those import `@gorhom/bottom-sheet` and
 * `expo-blur` as peer dependencies that this workspace does not install — so
 * importing the provider at all fails to resolve. The components Wearly needs
 * are built on the token layer instead; see `DESIGN_SYSTEM.md` §16.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaListener
          onChange={({ insets }) => Uniwind.updateInsets(insets)}
        >
          {children}
        </SafeAreaListener>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
