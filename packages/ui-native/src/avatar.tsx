import { Image } from "expo-image";
import { type ReactNode, useState } from "react";
import { View } from "react-native";
import { withUniwind } from "uniwind";

import { Icon } from "./icon";
import type { TextVariant } from "./text";
import { Text } from "./text";

/**
 * Avatars.
 *
 * A photo when the account has one, and a soft rose monogram when it does not.
 * Monograms are honest — they never imply a photo that does not exist — and
 * they keep a row of avatars from turning into broken images when a provider
 * gives no picture. A photo that fails to load falls back to the monogram
 * rather than leaving a hole.
 *
 * `expo-image` does not accept `className` directly, so it is wrapped through
 * `withUniwind` once at module scope, exactly as `media.tsx` does.
 */

const StyledImage = withUniwind(Image);

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
  /** Profile photo. Absent or failed falls back to the monogram. */
  src?: string;
}

const WORD_SPLIT = /\s+/;

/** Up to two initials from a display name. */
function initialsOf(name: string): string {
  const parts = name.trim().split(WORD_SPLIT).filter(Boolean);
  const first = parts.at(0)?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts.at(-1)?.charAt(0) ?? "") : "";
  return (first + last).toUpperCase();
}

export function Avatar({ name, size = "md", src }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = name === undefined ? "" : initialsOf(name);
  const hasInitials = initials.length > 0;
  const showPhoto = src !== undefined && src.length > 0 && !failed;

  let content: ReactNode;
  if (showPhoto) {
    content = (
      <StyledImage
        className="h-full w-full"
        contentFit="cover"
        onError={() => setFailed(true)}
        source={{ uri: src }}
        transition={200}
      />
    );
  } else if (hasInitials) {
    content = (
      <Text tone="accent-foreground" variant={SIZES[size].text as TextVariant}>
        {initials}
      </Text>
    );
  } else {
    content = (
      <Icon
        name="user"
        size={SIZES[size].icon as "lg" | "md" | "sm"}
        tone="accent-foreground"
      />
    );
  }

  return (
    <View
      accessibilityLabel={name}
      accessibilityRole="image"
      className={`${SIZES[size].className} items-center justify-center overflow-hidden rounded-avatar bg-accent`}
    >
      {content}
    </View>
  );
}
