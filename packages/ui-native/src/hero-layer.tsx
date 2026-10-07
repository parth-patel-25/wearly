import { DURATION } from "@wearly/design-tokens/motion";
import { useEffect } from "react";
import { Dimensions, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useHero } from "./hero-provider";

/**
 * The expanding surface.
 *
 * Quick + together: the tapped card's media slides and scales up to the
 * full-bleed 3:4 hero while fading in, then fades out to reveal the detail
 * page running its own matching entrance underneath. Back navigation mirrors
 * it: the overlay fades back in and collapses to the recorded frame.
 */

const EASING = Easing.bezier(0.16, 1, 0.3, 1);
const EXPAND_MS = 260;
const COLLAPSE_MS = 240;
const REVEAL_MS = 140;

export function HeroLayer() {
  const { end, settle, state } = useHero();
  const progress = useSharedValue(0);
  const overlay = useSharedValue(0);
  const screen = Dimensions.get("window");

  useEffect(() => {
    if (state.phase === "expanding") {
      progress.value = 0;
      overlay.value = 1;
      progress.value = withTiming(
        1,
        { duration: EXPAND_MS, easing: EASING },
        (finished) => {
          if (finished) {
            runOnJS(settle)();
          }
        }
      );
    } else if (state.phase === "settled") {
      overlay.value = withTiming(0, {
        duration: REVEAL_MS,
        easing: Easing.out(Easing.quad),
      });
    } else if (state.phase === "collapsing") {
      overlay.value = withTiming(1, { duration: DURATION.instant });
      progress.value = withTiming(
        0,
        { duration: COLLAPSE_MS, easing: EASING },
        (finished) => {
          if (finished) {
            runOnJS(end)();
          }
        }
      );
    }
  }, [end, overlay, progress, settle, state.phase]);

  if (!(state.frame && state.render && state.phase)) {
    return null;
  }

  return (
    <ExpandingSurface
      frame={state.frame}
      overlay={overlay}
      progress={progress}
      render={state.render}
      screen={screen}
    />
  );
}

interface ExpandingSurfaceProps {
  frame: { height: number; width: number; x: number; y: number };
  overlay: SharedValue<number>;
  progress: SharedValue<number>;
  render: () => React.ReactNode;
  screen: { height: number; width: number };
}

function ExpandingSurface({
  frame,
  overlay,
  progress,
  render,
  screen,
}: ExpandingSurfaceProps) {
  const targetWidth = screen.width;
  const targetHeight = Math.round(screen.width * (4 / 3));
  const style = useAnimatedStyle(() => {
    const top = interpolate(progress.value, [0, 1], [frame.y, 0]);
    const left = interpolate(progress.value, [0, 1], [frame.x, 0]);
    const width = interpolate(
      progress.value,
      [0, 1],
      [frame.width, targetWidth]
    );
    const height = interpolate(
      progress.value,
      [0, 1],
      [frame.height, targetHeight]
    );
    const fadeIn = interpolate(progress.value, [0, 0.2, 1], [0, 1, 1]);

    return {
      // Constant 20px (`rounded-media`): the card and the detail hero both
      // round at 20, so morphing the radius would snap at both handoffs.
      borderRadius: 20,
      height,
      left,
      opacity: overlay.value * fadeIn,
      top,
      width,
      zIndex: 10,
    };
  }, [frame, screen]);

  return (
    <View className="absolute inset-0" pointerEvents="none">
      <Animated.View className="overflow-hidden" style={style}>
        {render()}
      </Animated.View>
    </View>
  );
}
