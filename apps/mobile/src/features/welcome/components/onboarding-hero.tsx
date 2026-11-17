import { Text } from "@wearly/ui-native/text";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  Path,
  Stop,
  LinearGradient as SvgGradient,
} from "react-native-svg";
import { useCSSVariable, withUniwind } from "uniwind";

import { StepDots } from "./step-dots";
import { SwipeToContinue } from "./swipe-to-continue";

// Uniwind shims React Native's own components but not third-party ones, so
// `className` on expo-image's Image would be dropped and the image would
// render at zero size. Wrapping at module level keeps the HOC out of the
// render path.
const StyledImage = withUniwind(Image);
const StyledGradient = withUniwind(LinearGradient);

/**
 * Onboarding step 1 — the fashion moment.
 *
 * The hero is a full-bleed block at the top of the screen: a pink gradient
 * backdrop spans the whole width, the campaign cutout is anchored to its
 * bottom edge, and a subtle wash sits over the photograph. The headline,
 * support line and swipe live on a sheet whose top edge is a full-width dome
 * curve overlapping the photo — the curve is drawn (SVG), because a radius
 * can only round corners, and the reference's sweep spans half the width.
 * The sheet body's background is itself a gradient, not an overlay: a
 * diagonal tint from background at the top-left to faint pink at the
 * bottom-right, with the content as the gradient's children so the colour
 * stays behind the text.
 *
 * The word *Fashion* sits on a rotated pill rather than being bolded. Bold is a
 * weight, and a weight is invisible when the line wraps — the pill is an object
 * with its own shape, so the emphasis survives at any width and reads as
 * editorial rather than shouted.
 *
 * The two gradient washes are sanctioned absolute surfaces (see
 * DESIGN_SYSTEM.md §10): no flexbox arrangement can paint colour *behind* a
 * cutout, and the hero block's `overflow-hidden` keeps both washes inside the
 * silhouette the sheet overlaps. All are static at module scope — created
 * once, never per render — and none take touches. The bundled asset is a
 * local `require()`, so there is no remote fetch to fail; the block degrades
 * to pure gradient, never to blank.
 */

/**
 * The pink backdrop. Strongest at the top edge, dissolving by the bottom —
 * the sheet and the subject's own ground take over from there.
 */
const HERO_BACKDROP = (
  <LinearGradient
    colors={[
      "rgba(255, 158, 190, 0.55)",
      "rgba(255, 224, 235, 0.28)",
      "rgba(255, 255, 255, 0)",
    ]}
    end={{ x: 0, y: 1 }}
    pointerEvents="none"
    start={{ x: 0, y: 0 }}
    style={StyleSheet.absoluteFill}
  />
);

/**
 * The subtle wash over the cutout itself, kept from the original design. It
 * runs the opposite diagonal to the sheet's tint: deepest at the top-right
 * corner, fading to nothing at the bottom-left.
 */
const HERO_TINT = (
  <LinearGradient
    colors={["rgba(255, 148, 181, 0.20)", "rgba(255, 255, 255, 0)"]}
    end={{ x: 0, y: 1 }}
    pointerEvents="none"
    start={{ x: 1, y: 0 }}
    style={StyleSheet.absoluteFill}
  />
);

/**
 * How the cutout fills the hero block. The asset is a transparent-background
 * cutout, so it renders `contain` — no cropping of the subject — and sits at
 * the bottom edge, standing on the sheet's dome curve.
 */
const HERO_CONTENT_FIT = "contain" as const;

/**
 * How high the sheet's dome climbs from each side edge to its centre, and how
 * far the sheet overlaps the photo. Measured from the reference: ~40px of
 * rise over a 406px-wide frame, ≈36dp on a phone.
 */
const DOME_RISE = 36;

/** The shared tint colour — the body's gradient and the dome's match. */
const TINT_PINK = "#FF94B5";

/** The dome's silhouette: sides low, centre high, in a 100×100 stretched box. */
const DOME_PATH = "M 0 100 Q 50 -100 100 100 Z";

/**
 * The sheet's top edge: an opaque base path (the sheet is a surface *over*
 * the photo) with the body's diagonal tint continued across it. The body's
 * gradient reaches 0.075 alpha at its top-right corner — halfway along its
 * own diagonal — so the dome's gradient ends at exactly that value where the
 * seam runs, and both gradients are at zero along the seam's left half. The
 * two surfaces meet with no visible step, so no part of the sheet reads as
 * untinted white above the title.
 */
function SheetCurve({ fill }: { fill: string }) {
  return (
    <Svg
      height={DOME_RISE}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
      width="100%"
    >
      <Defs>
        <SvgGradient id="dome-tint" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor={TINT_PINK} stopOpacity={0} />
          <Stop offset="0.5" stopColor={TINT_PINK} stopOpacity={0} />
          <Stop offset="1" stopColor={TINT_PINK} stopOpacity={0.075} />
        </SvgGradient>
      </Defs>
      <Path d={DOME_PATH} fill={fill} />
      <Path d={DOME_PATH} fill="url(#dome-tint)" />
    </Svg>
  );
}

const PILL_TILT = "-12deg";

/** Gap between the floating pill and "With Your" — 2px by request. */
const PILL_GAP = 1;

export interface OnboardingHeroProps {
  onSwipeComplete: () => void;
  /** Zero-based. Renders the step dots, so the screen says where it is. */
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

  // SVG cannot take a className, so the sheet's fill resolves the theme
  // variable directly — the same route tone.ts documents for every SVG fill.
  const background = String(useCSSVariable("--wearly-background") ?? "#FFFBFC");

  return (
    <View className="flex-1">
      {/* Full-bleed hero: gradient backdrop, cutout, wash — in that order. */}
      <View className="min-h-0 flex-1 overflow-hidden">
        {HERO_BACKDROP}
        <StyledImage
          className="h-full w-full"
          contentFit={HERO_CONTENT_FIT}
          contentPosition="bottom"
          source={require("../../../../assets/images/onboarding-hero-girl.png")}
        />
        {HERO_TINT}
      </View>

      {/* The content sheet — a full-width dome curve over the photo. The
          overlap (-mt-9 = DOME_RISE) lets the photo show through above the
          curve, beside its centre apex. The tint wash deepens toward the
          bottom like the reference panel. */}
      <View className="-mt-9">
        <SheetCurve fill={background} />
        {/* The sheet body IS the tint — its own background stays the opaque
            theme colour, and the gradient paints over it: transparent at the
            top-left, faint pink at the bottom-right. Content is the
            gradient's children, so the colour never sits over the text. */}
        <StyledGradient
          className="bg-background px-gutter pt-4 pb-6"
          colors={["rgba(255, 148, 181, 0)", "rgba(255, 148, 181, 0.15)"]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
        >
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
                  <Text
                    style={{ paddingLeft: pillReserve }}
                    variant="displaySm"
                  >
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
              Embrace your individuality and express {"\n"} yourself through
              fashion — whether you prefer
            </Text>

            <View className="gap-5 pt-1">
              <SwipeToContinue
                label="Get Started"
                onComplete={onSwipeComplete}
              />
              <StepDots current={step} total={totalSteps} />
            </View>
          </View>
        </StyledGradient>
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
