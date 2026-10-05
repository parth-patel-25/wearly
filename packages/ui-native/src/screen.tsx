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
  /**
   * Classes for the inner content wrapper. Defaults to a full-height column —
   * `grow` is what lets a `flex-1` child centre itself. Pass your own only if
   * you intend to own the height, and keep `grow` in it.
   */
  contentClassName?: string;
  /** Wrap content in a ScrollView. Disable for screens that own their own list. */
  scrollable?: boolean;
}

const DEFAULT_CONTENT = "flex grow flex-col gap-4 p-gutter";

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
    <View className={contentClassName ?? DEFAULT_CONTENT}>{children}</View>
  );

  return (
    <StyledSafeAreaView
      className={className ?? "flex-1 bg-background"}
      edges={["top", "left", "right"]}
    >
      {scrollable ? (
        <ScrollView
          className="flex grow flex-col"
          contentContainerClassName="flex grow flex-col"
        >
          {container}
        </ScrollView>
      ) : (
        container
      )}
    </StyledSafeAreaView>
  );
}
