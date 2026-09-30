import { Image } from "expo-image";
import type { ViewProps } from "react-native";
import { View } from "react-native";
import { withUniwind } from "uniwind";

import { Icon } from "./icon";
import type { IconName } from "./icon-glyphs";

// Uniwind shims React Native's own components but not third-party ones, so
// `className` on expo-image's Image would be dropped and the image would render
// at zero size. Wrapping at module level keeps the HOC out of the render path.
const StyledImage = withUniwind(Image);

/**
 * Media blocks.
 *
 * A media block is either a photograph or, when there is nothing to show yet, a
 * soft token-coloured block with a garment silhouette. Both render through the
 * same aspect-ratio box, so `src` is the only difference between a finished
 * product card and one still waiting on its photo.
 *
 * The tone is therefore the *placeholder*, not the imagery — it keeps the block
 * the right shape while the image loads, and it is what every call site falls
 * back to if a photo is missing. Tones come from the existing semantic set
 * rather than new colours, which is what makes a grid of blanks look composed
 * instead of random.
 */

const PLACEHOLDER_TONE = {
  accent: "bg-accent",
  info: "bg-info-background",
  muted: "bg-muted",
  secondary: "bg-secondary",
  soft: "bg-card",
  success: "bg-success-background",
  warning: "bg-warning-background",
} as const;

/** Icon tone that stays legible on each placeholder fill. */
const PLACEHOLDER_ICON = {
  accent: "accent-foreground",
  info: "info-foreground",
  muted: "muted-foreground",
  secondary: "secondary-foreground",
  soft: "muted-foreground",
  success: "success-foreground",
  warning: "warning-foreground",
} as const;

export type PlaceholderTone = keyof typeof PLACEHOLDER_TONE;

export interface MediaProps extends ViewProps {
  /** 4:5 is the product-card ratio; 1:1 for avatars; 16/9 for editorial blocks. */
  aspect?: "1/1" | "3/4" | "4/5" | "16/9";
  icon?: IconName;
  /**
   * Remote photograph. Omit it and the tone block stands in, so a screen that
   * has no imagery yet still renders correctly instead of collapsing.
   */
  src?: string;
  tone?: PlaceholderTone;
}

const ASPECT = {
  "1/1": "aspect-square",
  "3/4": "aspect-3/4",
  "4/5": "aspect-4/5",
  "16/9": "aspect-video",
} as const;

/** A photograph when there is one, a soft block when there is not. */
export function Media({
  aspect = "4/5",
  className,
  icon = "shirt",
  src,
  tone = "muted",
  ...rest
}: MediaProps) {
  return (
    <View
      className={[
        "w-full items-center justify-center overflow-hidden rounded-media",
        ASPECT[aspect],
        src === undefined ? PLACEHOLDER_TONE[tone] : undefined,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {src === undefined ? (
        <Icon name={icon} size="xl" tone={PLACEHOLDER_ICON[tone]} />
      ) : (
        <StyledImage
          className="h-full w-full"
          contentFit="cover"
          source={{ uri: src }}
          transition={200}
        />
      )}
    </View>
  );
}
