import type { ViewProps } from "react-native";
import { View } from "react-native";

import { Icon } from "./icon";
import type { IconName } from "./icon-glyphs";

/**
 * Media placeholders.
 *
 * The prototype has no photography, and inventing fake product photos would be
 * worse than admitting there are none. So imagery is a soft, token-coloured
 * block with a garment silhouette: it looks deliberate, it keeps the layout
 * honest, and swapping in real images later is a one-line change at the call
 * site.
 *
 * Tones are drawn from the existing semantic set rather than new colours, which
 * is what makes a grid of placeholders look composed instead of random.
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
  tone?: PlaceholderTone;
}

const ASPECT = {
  "1/1": "aspect-square",
  "3/4": "aspect-3/4",
  "4/5": "aspect-4/5",
  "16/9": "aspect-video",
} as const;

/** A soft block standing in for a photograph. */
export function Media({
  aspect = "4/5",
  className,
  icon = "shirt",
  tone = "muted",
  ...rest
}: MediaProps) {
  return (
    <View
      className={[
        "w-full items-center justify-center overflow-hidden rounded-media",
        ASPECT[aspect],
        PLACEHOLDER_TONE[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <Icon name={icon} size="xl" tone={PLACEHOLDER_ICON[tone]} />
    </View>
  );
}
