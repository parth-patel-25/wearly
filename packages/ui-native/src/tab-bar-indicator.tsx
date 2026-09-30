import { DURATION, EASE_OUT } from "@wearly/design-tokens/motion";
import { useEffect, useRef } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/**
 * The sliding active indicator.
 *
 * A colour change alone tells you which tab is active but not that anything
 * moved, and the movement is the part that reads as polished. So the pill
 * travels to the active tab rather than blinking on and off in place.
 *
 * Position is **measured, never computed** — see `useTabFrames` in `./tab-bar`,
 * which is where the numbers come from.
 *
 * It animates `width` as well as position, because the centre action is genuinely
 * a different width from its neighbours. One `Animated.View` with a UI-thread
 * animation is cheap enough at five tabs that the layout prop is not worth
 * contorting into a scale transform.
 */

export interface TabFrame {
  width: number;
  x: number;
}

/** `cubic-bezier(0.16, 1, 0.3, 1)` from the token, not a curve re-typed here. */
const EASE = Easing.bezier(...EASE_OUT);

const TIMING = { duration: DURATION.base, easing: EASE } as const;

export interface TabBarIndicatorProps {
  /** The active tab's frame, or `undefined` before anything has been measured. */
  frame?: TabFrame;
}

export function TabBarIndicator({ frame }: TabBarIndicatorProps) {
  const x = useSharedValue(0);
  const width = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  /**
   * Whether a tab has ever been measured. Without this the pill would animate
   * open from zero width every time the app launched, which reads as a flicker
   * rather than as an arrival.
   */
  const arrived = useRef(false);

  useEffect(() => {
    if (frame === undefined) {
      return;
    }

    // First placement, or reduced motion: land on the value. Animating either
    // would mean showing the user a transition that is not one.
    if (reduceMotion === true || arrived.current === false) {
      arrived.current = true;
      x.value = frame.x;
      width.value = frame.width;
      return;
    }

    x.value = withTiming(frame.x, TIMING);
    width.value = withTiming(frame.width, TIMING);
  }, [frame, reduceMotion, width, x]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    width: width.value,
  }));

  // Absolutely positioned and painted first, so it sits behind every tab. That is
  // the sanctioned kind of absolute surface: an overlay anchored to its siblings,
  // not a way of arranging the row. `pointerEvents` stops it swallowing a tap
  // meant for the tab underneath.
  return (
    <Animated.View
      className="absolute top-0 bottom-0 left-0 rounded-pill bg-muted"
      pointerEvents="none"
      style={animatedStyle}
    />
  );
}
