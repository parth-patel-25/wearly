import { ROUTES } from "@core/routing/routes";
import { DURATION } from "@wearly/design-tokens/motion";
import { BrandMark, Wordmark } from "@wearly/ui-native/brand-mark";
import { useEnterAnimation, useFadeIn } from "@wearly/ui-native/motion";
import { Screen } from "@wearly/ui-native/screen";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

/**
 * The splash.
 *
 * The one moment Wearly is allowed to be theatrical, and it is a brand
 * introduction, not a loading bar. The mark draws itself in, the halo breathes
 * once behind it, the wordmark settles, and then it hands over to the welcome
 * question.
 *
 * Three rules keep it from becoming a pastiche of someone else's onboarding: it
 * moves on by itself, so a slow device never strands anyone; it can be tapped
 * past immediately; and every animation starts from a state the content can
 * still be read from, so a motion preference or a worklet that has not attached
 * can never leave the screen blank.
 */

const HOLD_MS = 1650;
const EASE = Easing.bezier(0.16, 1, 0.3, 1);

export default function SplashScreen() {
  const router = useRouter();
  const animate = useEnterAnimation();
  const halo = useSharedValue(0.82);
  const markScale = useSharedValue(0.86);
  const markOpacity = useSharedValue(animate ? 0 : 1);

  const go = useCallback(() => {
    router.replace(ROUTES.welcome);
  }, [router]);

  useEffect(() => {
    if (!animate) {
      return;
    }
    const timing = { duration: DURATION.slow * 2, easing: EASE };
    markOpacity.value = withTiming(1, timing);
    markScale.value = withTiming(1, timing);
    halo.value = withDelay(DURATION.base, withTiming(1.08, timing));
  }, [animate, halo, markOpacity, markScale]);

  useEffect(() => {
    const timeout = setTimeout(go, HOLD_MS);
    return () => clearTimeout(timeout);
  }, [go]);

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: halo.value }],
  }));
  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: markScale.value }],
  }));
  const captionStyle = useFadeIn({ delay: 320, distance: 12 });

  return (
    <Screen className="flex-1 bg-background" scrollable={false}>
      <Pressable
        accessibilityHint="Skips the introduction"
        accessibilityLabel="Skip intro"
        accessibilityRole="button"
        className="flex grow items-center justify-center gap-10 px-page-inline"
        onPress={go}
      >
        <View className="h-40 w-40 items-center justify-center">
          <Animated.View
            className="absolute size-40 rounded-pill bg-accent"
            style={haloStyle}
          />
          <Animated.View style={markStyle}>
            <BrandMark size={112} />
          </Animated.View>
        </View>

        <Animated.View className="items-center gap-3" style={captionStyle}>
          <Wordmark />
          <Text
            className="text-center"
            tone="muted-foreground"
            variant="bodyMd"
          >
            Rent the wardrobe you already love.
          </Text>
        </Animated.View>
      </Pressable>
    </Screen>
  );
}
