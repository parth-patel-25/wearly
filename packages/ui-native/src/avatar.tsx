import { View } from "react-native";

import { Icon } from "./icon";
import type { TextVariant } from "./text";
import { Text } from "./text";

/**
 * Avatars.
 *
 * There is no profile photo in the prototype, so the fallback is a soft rose
 * circle with the person's initials. Monograms are honest — they never imply a
 * photo that does not exist — and they keep the profile screen from turning into
 * a row of broken images.
 */

const SIZES = {
  lg: { className: "size-14", icon: "md", text: "bodyMd" },
  md: { className: "size-11", icon: "md", text: "bodySm" },
  sm: { className: "size-8", icon: "sm", text: "bodySm" },
  xl: { className: "size-24", icon: "lg", text: "headingMd" },
} as const;

export type AvatarSize = keyof typeof SIZES;

export interface AvatarProps {
  name?: string;
  size?: AvatarSize;
}

const WORD_SPLIT = /\s+/;

/** Up to two initials from a display name. */
function initialsOf(name: string): string {
  const parts = name.trim().split(WORD_SPLIT).filter(Boolean);
  const first = parts.at(0)?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts.at(-1)?.charAt(0) ?? "") : "";
  return (first + last).toUpperCase();
}

export function Avatar({ name, size = "md" }: AvatarProps) {
  const initials = name === undefined ? "" : initialsOf(name);
  const hasInitials = initials.length > 0;

  return (
    <View
      accessibilityLabel={name}
      accessibilityRole="image"
      className={`${SIZES[size].className} items-center justify-center rounded-avatar bg-accent`}
    >
      {hasInitials ? (
        <Text
          tone="accent-foreground"
          variant={SIZES[size].text as TextVariant}
        >
          {initials}
        </Text>
      ) : (
        <Icon
          name="user"
          size={SIZES[size].icon as "lg" | "md" | "sm"}
          tone="accent-foreground"
        />
      )}
    </View>
  );
}
