import { Media } from "@wearly/ui-native/media";
import { Text } from "@wearly/ui-native/text";
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

const PILL_TILT = "-6deg";

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
  return (
    <View className="flex-1 justify-between gap-6">
      <Media aspect="3/4" className="flex-1" src={HERO_SRC} tone="accent" />

      <View className="gap-4">
        {/* The lines are explicit rather than left to wrap. Three inline boxes in
            a wrapping row break independently, so at a larger font scale the
            lines interleave into a jumble; a column per line keeps the stack the
            design is built on and lets only the last line reflow. */}
        <View className="gap-1">
          <Text className="text-center" variant="display">
            Get Ready For
          </Text>
          <View className="flex-row flex-wrap items-center justify-center gap-x-2">
            <Pill>Fashion</Pill>
            <Text variant="display">With Your Own Style</Text>
          </View>
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

function Pill({ children }: { children: string }) {
  return (
    <View
      className="self-center rounded-pill bg-accent px-4 py-1"
      style={{ transform: [{ rotate: PILL_TILT }] }}
    >
      <Text
        className="text-center"
        tone="accent-foreground"
        variant="headingLg"
      >
        {children}
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
            index === current ? "w-5 bg-accent" : "w-2 bg-muted",
          ].join(" ")}
          key={dot}
        />
      ))}
    </View>
  );
}
