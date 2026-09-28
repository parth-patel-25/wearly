import { HeroUINativeProvider } from "heroui-native";
import type { ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

/**
 * Shared native provider stack. Order matters:
 * gestures must be outermost so overlays (Dialog, Select, BottomSheet, Toast)
 * inherit a gesture root, then safe-area insets, then HeroUI's theme context.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <HeroUINativeProvider>{children}</HeroUINativeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
