import { SPRING } from "@wearly/design-tokens/motion";
import { useEffect, useRef } from "react";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Icon } from "./icon";
import type { IconName } from "./icon-glyphs";

/**
 * The travelling active circle.
 *
 * A colour change alone tells you which tab is active but not that anything moved,
 * and the movement is the part that reads as polished. So a single white circle
 * travels to the active tab rather than four glyphs blinking on and off in place.
 *
 * **One** circle, not four backgrounds. That is the whole point: a bar where each
 * tab lights up independently reads as "the old tab went away and a new tab
 * appeared", while a single object crossing the bar reads as "I am still in the
 * same control, this is where I am now".
 *
 * **The circle carries the filled glyph, and that is the load-bearing decision.**
 * Drawing the active icon in here makes the disc and its glyph one object
 * travelling across the bar. The alternative — leaving the glyph in its tab and
 * having it chase a separately-moving circle — needs two animations locked together
 * across two axes, and any drift between them reads as exactly the bug the single
 * indicator exists to avoid. `TabItem` therefore renders its own icon only while
 * inactive, holding an `opacity-0` placeholder of the same size so the row's
 * height is identical in both states.
 *
 * ### Radius, and the trap in the table above it
 *
 * `rounded-pill` (9999px) on a square box is a true circle, and that is correct
 * here. The post-mortem this replaces was about a *rounded rectangle* rendering as a
 * circle when it should not have — a real diagnostic, and still the first thing to
 * check when something renders as a blob. What changed is the intent. See
 * `docs/DESIGN_SYSTEM.md` §10.
 *
 * ### Position is measured, never computed
 *
 * `centerX` comes from `onLayout` via `useTabFrames`, so the circle goes to where
 * the tab actually is rather than to where a `width / 4` calculation guesses.
 *
 * **Both axes are transforms.** Only the horizontal is animated, and only the
 * horizontal runs on the spring; `translateY` is a static `-overhang` composed into
 * the same transform array. Putting the overhang on that clock instead would let it
 * drift against the horizontal, and it is a fixed offset with nothing to stay in
 * sync with.
 *
 * The circle's size is fixed rather than derived from the slot, so `width` and
 * `height` are assigned outright and never animated — a layout property animated
 * per frame re-measures the view, which is the drag this avoids.
 */

export interface TabBarActiveCircleProps {
  /** The active tab's filled glyph. */
  activeIcon: IconName;
  /** The active tab's horizontal centre in the row, or `undefined` before measurement. */
  centerX?: number;
  /** How far the circle rises above the bar's top edge, in pixels. */
  overhang: number;
  /** The circle's diameter in pixels. */
  size: number;
}

export function TabBarActiveCircle({
  activeIcon,
  centerX,
  overhang,
  size,
}: TabBarActiveCircleProps) {
  const x = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  /**
   * Whether a tab has ever been measured. Without this the circle would spring in
   * from zero on every app launch, which reads as a flicker rather than an arrival.
   */
  const arrived = useRef(false);

  useEffect(() => {
    if (centerX === undefined) {
      return;
    }

    // First placement, or reduced motion: land on the value. Animating would mean
    // showing the user a transition that is not one.
    if (reduceMotion === true || arrived.current === false) {
      arrived.current = true;
      x.value = centerX;
      return;
    }

    // Reassigning an animation to a shared value already in flight restarts it from
    // wherever it currently is rather than from the old target, so rapid tapping
    // between tabs tracks the finger instead of queueing a backlog of transitions.
    x.value = withSpring(centerX, SPRING.tab);
  }, [centerX, reduceMotion, x]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: size,
    // Both axes are transforms, never `left`/`top`. `left` is a layout property:
    // animating it re-measures the view every frame, so the circle would visibly
    // drag on its horizontal travel while the spring's easing is supposed to be
    // the thing you feel. A transform is pure paint, so it runs at display frame
    // rate and cannot desynchronise. `left-0 top-0` in the className pins the
    // origin; everything past that is transform.
    transform: [{ translateX: x.value - size / 2 }, { translateY: -overhang }],
    width: size,
  }));

  // Absolutely positioned, painted first so it sits behind every tab, and raised
  // above the bar's top edge by the overhang. That is the sanctioned kind of
  // absolute surface: an overlay anchored to its siblings' measured positions, not
  // a way of arranging the row — there is no flexbox way to place a view outside
  // its parent's bounds, which is the entire point of this component.
  // `pointerEvents` stops it swallowing a tap meant for the tab underneath.
  return (
    <Animated.View
      className="absolute top-0 left-0 items-center justify-center rounded-pill bg-card shadow-float"
      pointerEvents="none"
      style={animatedStyle}
    >
      <Icon name={activeIcon} size="md" tone="primary" />
    </Animated.View>
  );
}
