import type { LayoutChangeEvent } from "react-native";
import Animated from "react-native-reanimated";
import { Icon } from "./icon";
import type { IconName } from "./icon-glyphs";
import { AnimatedPressable } from "./motion";
import { Text } from "./text";
import { useTabItemMotion } from "./use-tab-item-motion";

/**
 * One tab.
 *
 * Deliberately presentational: it is told which icon to draw in each state and
 * whether that tab is the active one, and it knows nothing about tabs, routes or
 * what "list" means. The policy lives in `./tab-bar`.
 *
 * Every tab is the same shape: an icon over a caption, `flex-1` so the five share
 * the bar evenly. There is no special tab — the old centre action was a 48px
 * filled circle with no label, which made it a button sitting inside a
 * navigation bar rather than a destination in it. Listing a piece is somewhere
 * you go, so it is a destination now, and the bar is five identical slots with
 * one pill travelling between them.
 *
 * `onLayout` is how the indicator finds this tab. It reports relative to the row,
 * which is exactly the coordinate space the indicator slides in.
 *
 * The icon swaps to its filled twin at the moment it becomes active rather than
 * crossfading the two. Stacking both glyphs and fading between them needs one of
 * them out of flow, and the only way to do that here is a second absolute surface
 * per tab — five more overlays for an 18px change. The swap is covered by the
 * scale and lift, and the active state is carried to assistive technology by
 * `accessibilityState.selected` regardless.
 */

export interface TabItemProps {
  active: boolean;
  /** The filled twin, drawn only while this tab is active. */
  activeIcon: IconName;
  icon: IconName;
  label: string;
  onLayout: (event: LayoutChangeEvent) => void;
  onPress: () => void;
}

export function TabItem({
  active,
  activeIcon,
  icon,
  label,
  onLayout,
  onPress,
}: TabItemProps) {
  const { iconStyle, labelStyle, onPressIn, onPressOut } =
    useTabItemMotion(active);

  return (
    <AnimatedPressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      className="flex-1 items-center gap-1 py-1.5"
      onLayout={onLayout}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={iconStyle}>
        <Icon
          name={active ? activeIcon : icon}
          size="sm"
          tone={active ? "primary" : "muted-foreground"}
        />
      </Animated.View>
      {/* The caption animates inside a wrapper rather than as an animated
          `Text`: Reanimated can style a host text node, but the Wearly `Text` is
          a wrapper that resolves its own tone, and animating the wrapper keeps
          the class-based type scale as the single source of size and colour. */}
      <Animated.View style={labelStyle}>
        <Text tone={active ? "primary" : "muted-foreground"} variant="caption">
          {label}
        </Text>
      </Animated.View>
    </AnimatedPressable>
  );
}
