import { FontAwesome6 } from "@expo/vector-icons";
import {
  FlowMarkBaseSvg,
  FlowMarkFlourishSvg,
  LOGO_ASPECT,
} from "@features/splash/components/wearly-flow-mark";
import { FLOW_MARK_DARK, FLOW_MARK_LIGHT } from "@features/splash/splash-theme";
import { Button, IconButton } from "@wearly/ui-native/button";
import { AnimatedPressable, usePressScale } from "@wearly/ui-native/motion";
import { Screen } from "@wearly/ui-native/screen";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useUniwind } from "uniwind";

/**
 * Sign in / create account.
 *
 * The full-screen answer to the two moments that need one: a guest on Profile
 * who wants an account, and a guest at checkout who is one tap from paying.
 * Both used to be dead ends or a modal — a pushed route keeps the back
 * gesture honest, so nothing about this screen traps anyone.
 *
 * It is deliberately ask-first: brand lockup, headline, then the two social
 * options before the account button, because the fastest path through a
 * sign-up wall is the one the user was already carrying in their pocket. The
 * terms caption sits under the primary action, never above it.
 *
 * UI only for now — the buttons carry press feedback and no auth wiring, so a
 * guest stays a guest even after "signing in". The real session flip lands with
 * the actual auth flow.
 */

const FACEBOOK_COLOR = "#1877F2";

/** Wordmark type size (`headingMd`), so the mark matches the title. */
const MARK_HEIGHT = 24;

/**
 * The original four-colour Google G. FontAwesome's free `google` glyph is a
 * single path — monochrome blue is not the Google mark — so the brand colours
 * are drawn here as the approved artwork.
 */
function GoogleGlyph() {
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

/**
 * The approved flow mark at the wordmark's optical size. Both layers are the
 * splash's generated geometry — base (W + lower leaf) with the flourish leaf
 * overlaid, the same composition the splash logo uses.
 */
function BrandMark() {
  const { theme } = useUniwind();
  const palette = theme === "dark" ? FLOW_MARK_DARK : FLOW_MARK_LIGHT;
  const width = MARK_HEIGHT / LOGO_ASPECT;

  return (
    <View aria-hidden>
      <FlowMarkBaseSvg palette={palette} width={width} />
      <View className="absolute inset-0" pointerEvents="none">
        <FlowMarkFlourishSvg palette={palette} width={width} />
      </View>
    </View>
  );
}

const SOCIALS = [
  { icon: <GoogleGlyph />, label: "Sign in with Google" },
  {
    icon: <FontAwesome6 color={FACEBOOK_COLOR} name="facebook" size={18} />,
    label: "Sign in with Facebook",
  },
] as const;

interface SocialButtonProps {
  icon: ReactNode;
  label: string;
}

/**
 * An outlined pill with a brand glyph. Composed rather than reusing `Button`
 * because the glyph sits beside the label and carries its own brand artwork,
 * which the in-house `Icon` glyph set has no glyphs for.
 */
function SocialButton({ icon, label }: SocialButtonProps) {
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

export default function SignInScreen() {
  const router = useRouter();

  return (
    <Screen
      className="flex-1 bg-background"
      contentClassName="flex grow flex-col"
      scrollable={false}
    >
      <View className="px-gutter pt-4">
        <IconButton
          accessibilityLabel="Go back"
          icon="arrow-left"
          onPress={() => router.back()}
          variant="outline"
        />
      </View>

      <View className="flex-1 justify-center gap-8 px-gutter">
        <View className="items-center gap-5">
          <View className="flex-row items-center gap-1">
            <BrandMark />
            <Text variant="headingMd">early</Text>
          </View>
          <Text className="text-center" variant="headingXl">
            Sign In & Take Control of Your Wardrobe!
          </Text>
        </View>

        <View className="gap-3">
          {SOCIALS.map((social) => (
            <SocialButton key={social.label} {...social} />
          ))}
        </View>

        <View className="flex-row items-center gap-3">
          <View className="h-px flex-1 bg-border" />
          <Text tone="muted-foreground" variant="caption">
            or
          </Text>
          <View className="h-px flex-1 bg-border" />
        </View>

        <Button size="lg">Create account</Button>

        <Text className="text-center" tone="muted-foreground" variant="caption">
          By signing up, you agree to our Terms, Privacy Policy, and Cookie Use.
        </Text>
      </View>

      <View className="flex-row items-center justify-center gap-1 px-gutter pt-4 pb-10">
        <Text tone="muted-foreground" variant="bodySm">
          Already have an account?
        </Text>
        <Text className="font-medium" variant="bodySm">
          Log In
        </Text>
      </View>
    </Screen>
  );
}
