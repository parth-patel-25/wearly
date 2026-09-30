import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { Text } from "./text";
import type { Tone } from "./tone";
import { useToneColor } from "./tone";

/**
 * The Wearly mark.
 *
 * A wardrobe rail seen head-on: a rounded arch — the shoulder line of a hanging
 * garment — with a hook rising from its centre and a single rose drop at the
 * heart of it. It is drawn in SVG rather than shipped as a bitmap so it stays
 * sharp at any size, re-themes with the tokens, and costs no asset weight.
 *
 * Nothing else in the product uses this shape, which is the point: it is the one
 * thing that makes the app recognisable before any word is read.
 */

export interface BrandMarkProps {
  /** Draw the halo behind the mark. On for the splash, off when inline. */
  halo?: boolean;
  size?: number;
  tone?: Tone;
}

export function BrandMark({
  halo = false,
  size = 96,
  tone = "primary",
}: BrandMarkProps) {
  const color = useToneColor(tone);
  const haloColor = useToneColor("brand-decorative");

  return (
    <View className="items-center justify-center">
      {halo ? (
        <View
          className="absolute rounded-pill bg-accent"
          style={{ height: size * 1.7, opacity: 0.55, width: size * 1.7 }}
        />
      ) : null}
      <Svg height={size} viewBox="0 0 96 96" width={size}>
        {halo ? (
          <Circle cx="48" cy="52" fill={haloColor} opacity={0.16} r="40" />
        ) : null}
        {/* Hook */}
        <Path
          d="M48 14c5 0 8 3.4 8 7.6 0 3.4-2 5.6-4.6 6.6"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="4"
        />
        {/* The arch: the shoulder line of a hanging piece */}
        <Path
          d="M16 44c0-7 5-12 12-14 8-2.3 16-3.4 20-3.4s12 1.1 20 3.4c7 2 12 7 12 14v22a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6V44Z"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4.5"
        />
        {/* The drop at the heart of it */}
        <Path
          d="M48 56c2.6 0 4.7 2 4.7 4.5 0 2.7-2.4 4.6-4.7 6.6-2.3-2-4.7-3.9-4.7-6.6 0-2.5 2.1-4.5 4.7-4.5Z"
          fill={color}
        />
      </Svg>
    </View>
  );
}

export interface WordmarkProps {
  tone?: Tone;
}

/** The wordmark. Satoshi at display size, letter-spaced open so it reads as a name. */
export function Wordmark({ tone = "foreground" }: WordmarkProps) {
  return (
    <Text className="tracking-brand" tone={tone} variant="display">
      Wearly
    </Text>
  );
}
