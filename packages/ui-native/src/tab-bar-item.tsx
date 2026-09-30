import type { LayoutChangeEvent } from "react-native";
import { Icon } from "./icon";
import type { IconName } from "./icon-glyphs";
import { AnimatedPressable, usePressScale } from "./motion";
import { Text } from "./text";

/**
 * One tab.
 *
 * Deliberately presentational: it is told which icon to draw in each state and
 * whether it is the emphasised centre action, and it knows nothing about tabs,
 * routes or what "list" means. The policy lives in `./tab-bar`, and the only reason
 * this is a separate file is that the bar outgrew its line budget once the sliding
 * indicator and the measurement hooks moved in.
 *
 * `onLayout` is how the indicator finds this tab. It reports relative to the row,
 * which is exactly the coordinate space the indicator slides in.
 */

export interface TabItemProps {
  active: boolean;
  /** The filled twin, drawn only while this tab is active. */
  activeIcon: IconName;
  /**
   * The centre action is a *button*, not a destination — publishing clothing is
   * something you do, not somewhere you go — so it renders as a filled circle with
   * no label and never changes icon.
   */
  emphasised?: boolean;
  icon: IconName;
  label: string;
  onLayout: (event: LayoutChangeEvent) => void;
  onPress: () => void;
}

export function TabItem({
  active,
  activeIcon,
  emphasised = false,
  icon,
  label,
  onLayout,
  onPress,
}: TabItemProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.9);

  if (emphasised) {
    return (
      <AnimatedPressable
        accessibilityLabel={label}
        accessibilityRole="button"
        className="mx-1 size-12 items-center justify-center self-center rounded-pill bg-primary"
        onLayout={onLayout}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={animatedStyle}
      >
        <Icon name={icon} size="md" tone="primary-foreground" />
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      className="flex-1 items-center gap-1 py-1"
      onLayout={onLayout}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={animatedStyle}
    >
      <Icon
        name={active ? activeIcon : icon}
        size="sm"
        tone={active ? "primary" : "muted-foreground"}
      />
      <Text tone={active ? "primary" : "muted-foreground"} variant="caption">
        {label}
      </Text>
    </AnimatedPressable>
  );
}
