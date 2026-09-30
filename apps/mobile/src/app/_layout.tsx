import { SessionProvider } from "@core/providers/session-provider";
import { ThemeToggle } from "@core/theme/theme-toggle";
import { useThemeOverride } from "@core/theme/use-theme-override";
import { RentalDraftProvider } from "@features/rental/providers/rental-draft-provider";
import { HeroLayer } from "@wearly/ui-native/hero-layer";
import { HeroProvider } from "@wearly/ui-native/hero-provider";

import { AppProviders } from "@wearly/ui-native/providers";
import { ToastProvider } from "@wearly/ui-native/toast";
import { Stack } from "expo-router";
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useCSSVariable, useUniwind } from "uniwind";

import { useSatoshi } from "../lib/fonts";
import "../global.css";

// Hold the native splash until Satoshi is ready, otherwise the first frame
// renders in the system font and then reflows once the family swaps in. The
// rejection is swallowed deliberately: a failed hold is cosmetic, and an
// unhandled rejection here would crash the app on launch.
preventAutoHideAsync().catch(() => {
  /* splash already hidden */
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useSatoshi();
  const ready = Boolean(fontsLoaded || fontError);
  // A JS style object cannot hold a CSS custom property, so the navigator's
  // background has to be resolved through Uniwind rather than written as one.
  const background = String(useCSSVariable("--wearly-background") ?? "");
  // Not `style="auto"`: auto follows the *device*, which is exactly the mismatch
  // the theme toggle exists to create. Reading Uniwind's resolved theme keeps the
  // status bar legible against a forced palette instead of the OS one.
  const { theme } = useUniwind();

  useEffect(() => {
    // Hide on error too. A missing font is a visual regression, not a reason to
    // leave the user staring at a splash screen forever.
    if (ready) {
      hideAsync().catch(() => {
        /* already hidden */
      });
    }
  }, [ready]);

  // Applied before anything paints, so a forced theme never flashes.
  useThemeOverride();

  if (!ready) {
    return null;
  }

  return (
    <AppProviders>
      <SessionProvider>
        <RentalDraftProvider>
          <ToastProvider>
            <HeroProvider>
              <StatusBar style={theme === "dark" ? "light" : "dark"} />
              <Stack
                screenOptions={{
                  // The hero expansion is the transition. A slide underneath it
                  // would fight it, so screen changes are a quiet fade.
                  animation: "fade",
                  contentStyle: { backgroundColor: background },
                }}
              >
                <Stack.Screen name="splash" options={{ animation: "none" }} />
                <Stack.Screen name="welcome" />
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="product/[id]"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="rent/dates"
                  options={{ presentation: "modal" }}
                />
                <Stack.Screen name="rent/checkout" />
                <Stack.Screen
                  name="rent/confirmed"
                  options={{ gestureEnabled: false }}
                />
              </Stack>
              {/* Above every screen, so the expansion is not clipped by a route. */}
              <HeroLayer />
              {/* Dev-only, and above every screen so the palette can be checked
                  from anywhere without navigating to a settings screen. */}
              <ThemeToggle />
            </HeroProvider>
          </ToastProvider>
        </RentalDraftProvider>
      </SessionProvider>
    </AppProviders>
  );
}
