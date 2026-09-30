import { SPRING } from "@wearly/design-tokens/motion";
import { useCallback, useEffect } from "react";
import type { ViewStyle } from "react-native";
import type { AnimatedStyle } from "react-native-reanimated";
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

/**
 * The tab that becomes active.
 *
 * `TabBarIndicator` moves the pill; this moves what is *inside* the pill. Two
 * separate jobs, so two separate files — and keeping them apart means the pill
 * cannot be re-tuned by accident when a tab's icon is retouched.
 *
 * One shared value (`progress`, 0 → 1) drives everything, so the icon, the label
 * and the glyph swap are guaranteed to be the same event rather than three
 * animations that happen to start together and drift.
 *
 * The magnitudes are deliberately small. A tab is 18px of icon beside an 11px
 * caption inside a 56px pill; anything past ~6% scale and 2px of travel stops
 * reading as "this one is active" and starts reading as a pop animation. The
 * overshoot is under 1% — the spring is there to take the hard edge off the
 * arrival, not to bounce.
 *
 * Press scale is composed into the icon transform here rather than applied to the
 * pressable, for two reasons: it keeps the press inside the control's own bounds
 * (so the label never shifts relative to the pill), and two animated styles both
 * writing `transform: [{ scale }]` would silently overwrite each other. The
 * pressable is the only thing that should own "is this finger down" *handlers*;
 * what it renders is this hook's business.
 */

/** How far the icon lifts into the pill, in pixels. */
const ICON_LIFT = 2;
/** Icon scale, inactive → active. */
const ICON_GROW = 0.06;
/** Label scale, inactive → active. The label is small, so this reads clearly. */
const LABEL_GROW = 0.04;
/** Label travel, inactive → active, in pixels. */
const LABEL_LIFT = 1.5;
/**
 * Inactive labels stay readable rather than disappearing — the bar is a
 * navigation, and a label that fades to nothing stops being a label. What
 * changes is weight of attention: `foreground` at full strength versus
 * `muted-foreground` at 80%.
 */
const LABEL_DIM = 0.8;

export interface TabItemMotion {
  /** On the icon wrapper. Carries scale and the lift. */
  iconStyle: AnimatedStyle<ViewStyle>;
  /** On the label wrapper. */
  labelStyle: AnimatedStyle<ViewStyle>;
  onPressIn: () => void;
  onPressOut: () => void;
}

/**
 * How hard a tab squashes under a finger. Lighter than a button's 0.97: a tab
 * is a target you pass through, not a thing you confirm, so it should register
 * the touch without visibly recoiling.
 */
const PRESSED = 0.94;

export function useTabItemMotion(active: boolean): TabItemMotion {
  const progress = useSharedValue(active ? 1 : 0);
  const press = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // Reduced motion still changes state — only the travel is dropped, so the
    // active tab is as legible as it is for everyone else.
    if (reduceMotion === true) {
      progress.value = active ? 1 : 0;
      return;
    }
    progress.value = withSpring(active ? 1 : 0, SPRING.tab);
  }, [active, progress, reduceMotion]);

  const onPressIn = useCallback(() => {
    press.value = reduceMotion === true ? 1 : withSpring(PRESSED, SPRING.press);
  }, [press, reduceMotion]);

  const onPressOut = useCallback(() => {
    press.value = reduceMotion === true ? 1 : withSpring(1, SPRING.press);
  }, [press, reduceMotion]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: (1 + ICON_GROW * progress.value) * press.value },
      { translateY: -ICON_LIFT * progress.value },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: LABEL_DIM + (1 - LABEL_DIM) * progress.value,
    transform: [
      { scale: 1 + LABEL_GROW * progress.value },
      { translateY: -LABEL_LIFT * progress.value },
    ],
  }));

  return { iconStyle, labelStyle, onPressIn, onPressOut };
}
