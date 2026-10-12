import { AnimatedPressable, usePressScale } from "@wearly/ui-native/motion";
import { Text } from "@wearly/ui-native/text";
import type { ReactNode } from "react";
import Svg, { Path } from "react-native-svg";

/**
 * Social sign-in buttons.
 *
 * Composed rather than reusing `Button` because the glyph sits beside the
 * label and carries its own brand artwork, which the in-house `Icon` glyph set
 * has no glyphs for. Google gets its original four colours — the FontAwesome
 * free `google` glyph is a single path, and monochrome blue is not the Google
 * mark.
 */

export function GoogleGlyph() {
  return (
    <Svg height={18} viewBox="0 0 48 48" width={18}>
      <Path
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
        fill="#4285F4"
      />
      <Path
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
        fill="#34A853"
      />
      <Path
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
        fill="#FBBC05"
      />
      <Path
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
        fill="#EA4335"
      />
    </Svg>
  );
}

interface SocialButtonProps {
  icon: ReactNode;
  label: string;
}

export function SocialButton({ icon, label }: SocialButtonProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.97);

  return (
    <AnimatedPressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className="h-touch w-full flex-row items-center justify-center gap-3 rounded-button border border-border bg-card px-6 active:bg-muted"
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={animatedStyle}
    >
      {icon}
      <Text variant="bodyLg">{label}</Text>
    </AnimatedPressable>
  );
}
