import { DURATION, EASE_OUT } from "@wearly/design-tokens/motion";
import { useEffect } from "react";
import type { ViewStyle } from "react-native";
import type { AnimatedStyle } from "react-native-reanimated";
import {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/**
 * The label of the tab that becomes active.
 *
 * `TabBarActiveCircle` moves the circle and carries the active glyph with it; this
 * moves what is left behind in the tab — the caption. Two separate jobs, so two
 * separate files, and keeping them apart means the circle cannot be re-tuned by
 * accident when a tab's icon is retouched. Press feedback is not here: it belongs
 * to the control as a whole, so `TabItem` takes it from `usePressScale` in
 * `./motion` and applies it to the pressable.
 *
 * This used to drive the icon as well. It no longer does, and the reason is
 * structural rather than a matter of taste: the active glyph is drawn inside the
 * circle so the two travel as one object, which leaves the tab itself with no icon
 * to animate. See `tab-bar-active-circle.tsx`.
 *
 * One shared value (`progress`, 0 → 1) drives the caption's scale and opacity
 * together, so they are guaranteed to be the same event rather than two animations
 * that happen to start together and drift.
 *
 * **Nothing here moves an item vertically, and that is the point.** An earlier
 * version lifted the icon 2px and the label 1.5px as they became active, on the
 * reasoning that it made them "settle into the pill". In practice it made the
 * active tab the only tab in the bar whose icon and label were not centred in its
 * slot — a permanent half-pixel of misalignment on exactly the tab the user is
 * looking at.
 *
 * This runs on `DURATION.base`/`EASE_OUT` rather than `SPRING.tab` on purpose. The
 * circle is the object; the caption is a tint on a piece of text. Matching clocks
 * would put a spring's overshoot on a 12px word, which is where overshoot stops
 * reading as energy and starts reading as a bounce — and a label that settles
 * after the circle has landed looks like it arrived late rather than softly.
 */

/** Label scale, inactive → active. The label is small, so this reads clearly. */
const LABEL_GROW = 0.02;
/**
 * Inactive labels stay readable rather than disappearing — the bar is a
 * navigation, and a label that fades to nothing stops being a label. What
 * changes is weight of attention: `foreground` at full strength versus
 * `muted-foreground` at 85%.
 */
const LABEL_DIM = 0.85;

export interface TabItemMotion {
  /** On the label wrapper. */
  labelStyle: AnimatedStyle<ViewStyle>;
}

/** `cubic-bezier(0.16, 1, 0.3, 1)` — the product's default decelerating curve. */
const TRANSITION = {
  duration: DURATION.base,
  easing: Easing.bezier(...EASE_OUT),
};

export function useTabItemMotion(active: boolean): TabItemMotion {
  const progress = useSharedValue(active ? 1 : 0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // Reduced motion still changes state — only the travel is dropped, so the
    // active tab is as legible as it is for everyone else.
    if (reduceMotion === true) {
      progress.value = active ? 1 : 0;
      return;
    }
    progress.value = withTiming(active ? 1 : 0, TRANSITION);
  }, [active, progress, reduceMotion]);

  const labelStyle = useAnimatedStyle(() => ({
    opacity: LABEL_DIM + (1 - LABEL_DIM) * progress.value,
    transform: [{ scale: 1 + LABEL_GROW * progress.value }],
  }));

  return { labelStyle };
}
