import { View } from "react-native";
import Svg from "react-native-svg";
import type { IconName } from "./icon-glyphs";
import { GLYPHS } from "./icon-glyphs";
import type { Tone } from "./tone";
import { toneClassName, useToneColor } from "./tone";

export type { IconName } from "./icon-glyphs";

const SIZES = {
  lg: 28,
  md: 22,
  sm: 18,
  xl: 36,
  xs: 14,
} as const;

export type IconSize = keyof typeof SIZES;

export interface IconProps {
  /**
   * Set this whenever the icon is the only thing conveying something. Without
   * it the icon is hidden from assistive technology, which is correct when a
   * visible text label sits beside it.
   */
  accessibilityLabel?: string;
  name: IconName;
  size?: IconSize;
  tone?: Tone;
}

/** One icon from the Wearly set. */
export function Icon({
  accessibilityLabel,
  name,
  size = "md",
  tone = "foreground",
}: IconProps) {
  const color = useToneColor(tone);
  const isDecorative = accessibilityLabel === undefined;

  return (
    // The tone utility rides on the wrapper for two reasons: it registers the
    // CSS variable with Uniwind so `useToneColor` can resolve it, and it gives
    // the SVG a themed parent to sit in. `Svg` cannot take a className.
    <View className={toneClassName(tone)}>
      <Svg
        accessibilityElementsHidden={isDecorative}
        accessibilityLabel={accessibilityLabel}
        accessible={!isDecorative}
        height={SIZES[size]}
        importantForAccessibility={isDecorative ? "no-hide-descendants" : "yes"}
        role={isDecorative ? undefined : "img"}
        viewBox="0 0 24 24"
        width={SIZES[size]}
      >
        {GLYPHS[name](color)}
      </Svg>
    </View>
  );
}
