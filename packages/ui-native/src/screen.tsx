import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

// Third-party components don't accept className out of the box. Wrap at module
// level so the HOC isn't recreated on every render.
const StyledSafeAreaView = withUniwind(SafeAreaView);

export interface ScreenProps {
  children: ReactNode;
  /** Classes for the outer safe-area container. */
  className?: string;
  /** Classes for the inner content wrapper. */
  contentClassName?: string;
  /** Wrap content in a ScrollView. Disable for screens that own their own list. */
  scrollable?: boolean;
}

/**
 * Base screen layout. Flexbox only — no absolute positioning — so it scales
 * across phones, tablets and both platforms.
 */
export function Screen({
  children,
  scrollable = true,
  className,
  contentClassName,
}: ScreenProps) {
  const container = (
    <View className={contentClassName ?? "flex flex-col gap-4 p-4"}>
      {children}
    </View>
  );

  return (
    <StyledSafeAreaView
      className={className ?? "flex flex-1 bg-background"}
      edges={["top", "left", "right"]}
    >
      {scrollable ? (
        <ScrollView
          className="flex flex-col"
          contentContainerClassName="flex flex-col grow"
        >
          {container}
        </ScrollView>
      ) : (
        container
      )}
    </StyledSafeAreaView>
  );
}
