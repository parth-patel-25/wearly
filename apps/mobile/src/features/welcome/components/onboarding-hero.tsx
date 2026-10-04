import { Media } from "@wearly/ui-native/media";
import { Text } from "@wearly/ui-native/text";
import { useCallback, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { View } from "react-native";

import { SwipeToContinue } from "./swipe-to-continue";

/**
 * Onboarding step 1 — the fashion moment.
 *
 * One photograph, one headline, one line of support, one drag. It is the only
 * screen in the product that asks nothing of the user, which is exactly why it
 * can afford to be the only one that asks for a gesture.
 *
 * The word *Fashion* sits on a rotated pill rather than being bolded. Bold is a
 * weight, and a weight is invisible when the line wraps — the pill is an object
 * with its own shape, so the emphasis survives at any width and reads as
 * editorial rather than shouted.
 *
 * The photography is a **remote placeholder**. It is a stand-in for the real
 * campaign shoot, not an asset, and `Media` falls back to a garment block if it
 * cannot load — so the screen is never blank, only less good.
 */

/** Placeholder photography — cyan hoodie on a cool ground. */
const HERO_SRC =
  "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80";

const PILL_TILT = "-12deg";

/** Gap between the floating pill and "With Your" — 2px by request. */
const PILL_GAP = 1;

/** Stable pager dot keys — the flow has three steps and never grows silently. */
const DOT_KEYS = ["one", "two", "three"] as const;

export interface OnboardingHeroProps {
  onSwipeComplete: () => void;
  /** Zero-based. Renders the pager, so the screen says where it is. */
  step: number;
  totalSteps: number;
}

export function OnboardingHero({
  onSwipeComplete,
  step,
  totalSteps,
}: OnboardingHeroProps) {
  // Measured pill width. The pill is absolute (takes no space), so the text
  // reserves exactly pill + 2px of left padding — the visual gap stays 2px
  // and Rows 1/3 can never slide under the pill.
  const [pillWidth, setPillWidth] = useState(0);
  const onPillLayout = useCallback((event: LayoutChangeEvent) => {
    setPillWidth(event.nativeEvent.layout.width);
  }, []);
  // Pre-first-layout fallback so the text doesn't jump once measured.
  const pillReserve = (pillWidth > 0 ? pillWidth : 130) + PILL_GAP;

  return (
    <View className="flex-1 justify-between gap-6">
      <Media aspect="3/4" className="flex-1" src={HERO_SRC} tone="accent" />

      <View className="gap-4">
        {/* Three forced centered lines. Row 2 is a shrink-wrapped relative unit
            (self-centered), so the absolute pill lives inside its own row's
            bounds and Rows 1/3 stay full-width readable. */}
        <View className="gap-0">
          <Text className="text-center leading-tight" variant="displaySm">
            Get Ready For
          </Text>
          <View className="mt-px flex-row justify-center">
            <View className="relative flex-row items-center">
              <Pill onLayout={onPillLayout} />
              <Text style={{ paddingLeft: pillReserve }} variant="displaySm">
                With Your
              </Text>
            </View>
          </View>
          <Text className="text-center leading-tight" variant="displaySm">
            Own Style
          </Text>
        </View>

        <Text
          className="px-2 text-center capitalize"
          tone="muted-foreground"
          variant="caption"
        >
          Embrace your individuality and express {"\n"} yourself through fashion
          — whether you prefer
        </Text>

        <View className="gap-5 pt-1">
          <SwipeToContinue label="Get Started" onComplete={onSwipeComplete} />
          <Pager current={step} total={totalSteps} />
        </View>
      </View>
    </View>
  );
}

function Pill({ onLayout }: { onLayout: (event: LayoutChangeEvent) => void }) {
  return (
    <View
      className="absolute left-0 self-center rounded-pill bg-primary px-4 py-1"
      onLayout={onLayout}
      style={{ transform: [{ rotate: PILL_TILT }] }}
    >
      <Text
        className="text-center"
        tone="primary-foreground"
        variant="displayXs"
      >
        Fashion
      </Text>
    </View>
  );
}

/**
 * Three dots. The active one is wider rather than a different colour, so the
 * position reads at a glance and the inactive pair stays quiet.
 *
 * Keys are names rather than indices because these are positional children of a
 * fixed-length list — `key={index}` would be correct and still reads as a
 * reorder bug to anyone reviewing it later.
 */
function Pager({ current, total }: { current: number; total: number }) {
  return (
    <View
      accessibilityLabel={`Step ${current + 1} of ${total}`}
      className="h-4 flex-row items-center justify-center gap-2"
    >
      {DOT_KEYS.slice(0, total).map((dot, index) => (
        <View
          className={[
            "h-2 rounded-pill",
            index === current ? "w-5 bg-primary" : "w-2 bg-muted",
          ].join(" ")}
          key={dot}
        />
      ))}
    </View>
  );
}
