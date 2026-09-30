import { DURATION } from "@wearly/design-tokens/motion";
import { useEffect } from "react";
import { Dimensions, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useHero } from "./hero-provider";

/**
 * The expanding surface.
 *
 * Rendered once, at the root, above everything. When a card is tapped its frame
 * is recorded, the product page navigates, and this layer animates the tapped
 * card's own media from that rectangle up to full bleed. The real page content is
 * faded in underneath as the expansion completes, so the two are never both
 * fighting for attention.
 *
 * The reverse — collapsing the page back into the grid — runs the same values
 * backwards, which is why the destination grid cell is measured on the way out
 * rather than guessed at.
 */

const EASING = Easing.bezier(0.16, 1, 0.3, 1);
const EXPAND_MS = DURATION.slow;

export function HeroLayer() {
  const { end, state } = useHero();
  const progress = useSharedValue(0);
  const screen = Dimensions.get("window");

  useEffect(() => {
    if (state.frame) {
      progress.value = 0;
      progress.value = withTiming(1, { duration: EXPAND_MS, easing: EASING });
      return;
    }
    progress.value = withTiming(0, { duration: DURATION.fast });
  }, [progress, state.frame]);

  useEffect(() => {
    if (!state.frame) {
      // Let the collapse finish before the overlay stops rendering, otherwise
      // the page would pop back in mid-animation.
      const timeout = setTimeout(() => end(), DURATION.fast);
      return () => clearTimeout(timeout);
    }
  }, [end, state.frame]);

  if (!(state.frame && state.render)) {
    return null;
  }

  return (
    <ExpandingSurface
      frame={state.frame}
      progress={progress}
      render={state.render}
      screen={screen}
    />
  );
}

interface ExpandingSurfaceProps {
  frame: { height: number; width: number; x: number; y: number };
  progress: SharedValue<number>;
  render: () => React.ReactNode;
  screen: { height: number; width: number };
}

function ExpandingSurface({
  frame,
  progress,
  render,
  screen,
}: ExpandingSurfaceProps) {
  const style = useAnimatedStyle(() => {
    const top = interpolate(progress.value, [0, 1], [frame.y, 0]);
    const left = interpolate(progress.value, [0, 1], [frame.x, 0]);
    const width = interpolate(
      progress.value,
      [0, 1],
      [frame.width, screen.width]
    );
    const height = interpolate(
      progress.value,
      [0, 1],
      [frame.height, screen.height]
    );

    return {
      height,
      left,
      opacity: interpolate(progress.value, [0, 0.15, 1], [1, 1, 1]),
      top,
      width,
      zIndex: 10,
    };
  }, [frame, screen]);

  return (
    <View className="absolute inset-0" pointerEvents="none">
      <Animated.View className="overflow-hidden rounded-media" style={style}>
        {render()}
      </Animated.View>
    </View>
  );
}
