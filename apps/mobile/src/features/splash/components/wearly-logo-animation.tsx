/**
 * The fabric reveal.
 *
 * The approved flow mark (W + lower leaf as the base, upper leaf as the
 * flourish) is unveiled left-to-right by a background-toned veil sliding
 * off it — fabric flowing into the logo. The mark itself is never scaled,
 * stretched or redrawn; only the veil, opacities and feather-light
 * translate/scale wrappers move, all on the UI thread.
 *
 * The asset carries the mark only, so the `wearly` wordmark and the
 * `WEAR / RENT / REPEAT` tagline are set in Satoshi beside it rather than
 * invented as geometry.
 */

import { Text } from "@wearly/ui-native/text";
import { useEffect } from "react";
import { useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useUniwind } from "uniwind";
import { FLOW_MARK_DARK, FLOW_MARK_LIGHT } from "../splash-theme";
import { SPLASH_TIMING } from "../splash-timing";
import { FlowMarkBaseSvg, FlowMarkFlourishSvg } from "./wearly-flow-mark";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function WearlyLogoAnimation() {
  const reduceMotion = useReducedMotion() === true;
  const animate = !reduceMotion;
  const { theme } = useUniwind();
  const { width: screen } = useWindowDimensions();

  // Responsive without pixel positioning: a fluid share of the viewport,
  // capped so tablets stay intimate. The aspect ratio lives in the SVG.
  const markWidth = Math.min(screen * 0.68, 340);
  const palette = theme === "dark" ? FLOW_MARK_DARK : FLOW_MARK_LIGHT;

  const veil = useSharedValue(0);
  const travel = useSharedValue(markWidth);
  const flourish = useSharedValue(animate ? 0 : 1);
  const settle = useSharedValue(animate ? 0.97 : 1);
  const wordmark = useSharedValue(animate ? 0 : 1);
  const tagline = useSharedValue(animate ? 0 : 1);
  const exit = useSharedValue(1);

  useEffect(() => {
    if (!animate) {
      return;
    }
    const curve = Easing.bezier(...EASE);
    const t = SPLASH_TIMING;
    veil.value = withDelay(
      t.markRevealDelay,
      withTiming(1, { duration: t.markRevealDuration, easing: curve })
    );
    flourish.value = withDelay(
      t.flourishDelay,
      withTiming(1, { duration: t.flourishDuration, easing: curve })
    );
    settle.value = withDelay(
      t.settleDelay,
      withSpring(1, { damping: 32, mass: 1, stiffness: 260 })
    );
    wordmark.value = withDelay(
      t.wordmarkDelay,
      withTiming(1, { duration: t.wordmarkDuration, easing: curve })
    );
    tagline.value = withDelay(
      t.taglineDelay,
      withTiming(1, { duration: t.taglineDuration, easing: curve })
    );
    exit.value = withDelay(
      t.holdUntil,
      withTiming(0, { duration: t.exitDuration, easing: curve })
    );
  }, [animate, exit, flourish, settle, tagline, veil, wordmark]);

  const veilStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: veil.value * travel.value }],
  }));
  const flourishStyle = useAnimatedStyle(() => ({
    opacity: flourish.value,
    transform: [
      { translateY: interpolate(flourish.value, [0, 1], [4, 0]) },
      { scale: interpolate(flourish.value, [0, 1], [0.88, 1]) },
      { rotate: `${interpolate(flourish.value, [0, 1], [-6, 0])}deg` },
    ],
  }));
  const settleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: settle.value }],
  }));
  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmark.value,
    transform: [{ translateY: interpolate(wordmark.value, [0, 1], [6, 0]) }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: tagline.value,
    transform: [{ translateY: interpolate(tagline.value, [0, 1], [3, 0]) }],
  }));
  const exitStyle = useAnimatedStyle(() => ({ opacity: exit.value }));

  return (
    <Animated.View
      accessibilityLabel="Wearly logo"
      accessibilityRole="image"
      className="items-center gap-8"
      style={exitStyle}
    >
      <Animated.View style={settleStyle}>
        <View
          onLayout={(event) => {
            travel.value = event.nativeEvent.layout.width;
          }}
        >
          <FlowMarkBaseSvg palette={palette} width={markWidth} />
          <Animated.View
            className="absolute inset-0"
            pointerEvents="none"
            style={flourishStyle}
          >
            <FlowMarkFlourishSvg palette={palette} width={markWidth} />
          </Animated.View>
          {animate ? (
            <Animated.View
              className="absolute inset-0 bg-background"
              pointerEvents="none"
              style={veilStyle}
            />
          ) : null}
        </View>
      </Animated.View>

      <Animated.View className="items-center gap-3" style={wordmarkStyle}>
        <Text className="tracking-brand" tone="primary" variant="display">
          wearly
        </Text>
        <Animated.View style={taglineStyle}>
          <Text
            className="text-center tracking-wide"
            tone="muted-foreground"
            variant="caption"
          >
            WEAR / RENT / REPEAT
          </Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
