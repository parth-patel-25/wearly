import type { LayoutChangeEvent } from "react-native";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { Icon } from "./icon";
import type { IconName } from "./icon-glyphs";
import { AnimatedPressable, usePressScale } from "./motion";
import { Text } from "./text";
import { useTabItemMotion } from "./use-tab-item-motion";

/**
 * One tab.
 *
 * Deliberately presentational: it is told which icon to draw, whether that tab is
 * the active one, and it knows nothing about tabs, routes or what "list" means. The
 * policy lives in `./tab-bar`.
 *
 * Every tab is the same shape: a caption under an icon slot, `flex-1` and a fixed
 * height so the four share the bar evenly and the bar cannot change height when a
 * tab is pressed. There is no special tab — the old centre action was a 48px filled
 * circle with no label, which made it a button sitting inside a navigation bar
 * rather than a destination in it. Listing a piece is somewhere you go, so it is a
 * destination like any other, and the bar is four identical slots with one circle
 * travelling between them.
 *
 * **The active tab renders no icon.** The filled glyph is drawn inside the
 * travelling circle, which is what makes the disc and its glyph one object crossing
 * the bar rather than two things that have to stay in step. The slot is still
 * occupied while active — an `opacity-0` icon of the same size — because collapsing
 * it would change the column's height mid-travel and the bar would visibly jump.
 *
 * The label is the whole of the active read that stays in the tab: `primary` tone
 * and `font-medium` when active, `muted-foreground` and `font-normal` when not,
 * with the cross-fade driven by `useTabItemMotion`.
 *
 * The icon and the label are both centred, and neither is ever moved vertically. An
 * earlier version lifted the icon 2px into the pill, which meant the active tab was
 * the only tab not optically centred in its slot.
 *
 * `onLayout` is how the circle finds this tab. It reports relative to the row,
 * which is exactly the coordinate space the circle slides in, and it gives the
 * circle the slot whose middle it centres on.
 */

export interface TabItemProps {
  active: boolean;
  /** The outline glyph, drawn only while this tab is inactive. */
  icon: IconName;
  label: string;
  onLayout: (event: LayoutChangeEvent) => void;
  onPress: () => void;
}

/**
 * `h-14` is the slot's height and therefore the bar's inner height. It is a fixed
 * height rather than a padding pair so that a taller label, a larger system font or
 * a longer translation cannot grow the row — and it doubles as a 56pt touch target,
 * which is comfortably past the 44pt minimum.
 */
const SLOT = "h-14";
/** Icon-to-label gap, 4pt. */
const CONTENT = "items-center gap-1";

export function TabItem({
  active,
  icon,
  label,
  onLayout,
  onPress,
}: TabItemProps) {
  const { labelStyle } = useTabItemMotion(active);
  // Lighter than a button's 0.97: a tab is a target you pass through, not a thing
  // you confirm, so it should register the touch without visibly recoiling.
  const press = usePressScale(0.94);

  return (
    <AnimatedPressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      className={`flex-1 ${SLOT} items-center justify-center`}
      onLayout={onLayout}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      style={press.animatedStyle}
    >
      {/* Sized to its content rather than stretched, so the column stays centred
          on the slot's own axis whatever the label's width. */}
      <View className={CONTENT}>
        {/* `opacity-0` rather than a conditional: the active glyph is painted
            inside the circle, and the space it used to occupy has to stay occupied
            so the row cannot change height while the circle travels. */}
        <View className={active ? "opacity-0" : undefined}>
          <Icon name={icon} size="md" tone="muted-foreground" />
        </View>
        {/* The caption animates inside a wrapper rather than as an animated
            `Text`: Reanimated can style a host text node, but the Wearly `Text`
            is a wrapper that resolves its own tone, and animating the wrapper
            keeps the class-based type scale as the single source of size and
            colour.

            `leading-tight` overrides the caption token's `leading-normal`. That
            token is 1.5, which puts a 12px caption in an 18px line box and leaves
            3pt of dead space above and below every label. 1.15 brings the box to
            14pt.

            `numberOfLines` is a hard guard, not tidiness. A label wider than its
            slot would wrap, the row would grow, and the bar's height would change
            mid-travel. Truncating is the smaller failure. */}
        <Animated.View style={labelStyle}>
          <Text
            className={`leading-tight ${active ? "font-medium" : "font-normal"}`}
            numberOfLines={1}
            tone={active ? "primary" : "muted-foreground"}
            variant="caption"
          >
            {label}
          </Text>
        </Animated.View>
      </View>
    </AnimatedPressable>
  );
}
