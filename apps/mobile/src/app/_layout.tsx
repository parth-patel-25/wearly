import { Stack } from "expo-router";
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useSatoshi } from "../lib/fonts";
import "../global.css";

// Hold the splash screen until Satoshi is ready, otherwise the first frame
// renders in the system font and then reflows once the family swaps in. The
// rejection is swallowed deliberately: a failed hold is cosmetic, and an
// unhandled rejection here would crash the app on launch.
preventAutoHideAsync().catch(() => {
  /* splash already hidden */
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useSatoshi();
  const ready = Boolean(fontsLoaded || fontError);

  useEffect(() => {
    // Hide on error too. A missing font is a visual regression, not a reason to
    // leave the user staring at a splash screen forever.
    if (ready) {
      hideAsync().catch(() => {
        /* already hidden */
      });
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ title: "Wearly" }} />
      </Stack>
    </>
  );
}
