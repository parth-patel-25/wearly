import { authTab } from "@core/routing/routes";
import { BrandMark } from "@features/auth/components/brand-mark";
import {
  FacebookGlyph,
  GoogleGlyph,
  SocialButton,
} from "@features/auth/components/social-button";
import { useAuth } from "@features/auth/hooks/use-auth";
import { Button, IconButton } from "@wearly/ui-native/button";
import { Screen } from "@wearly/ui-native/screen";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

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
 * The account actions are not dead ends either: "Create account" pushes
 * `/auth` on the signup tab, and the footer's "Log In" the same screen on the
 * login tab, where the fields and the swipe control live.
 */

const SOCIALS = [
  { icon: <GoogleGlyph />, label: "Sign in with Google", provider: "google" },
  {
    icon: <FacebookGlyph />,
    label: "Sign in with Facebook",
    provider: "facebook",
  },
] as const;

export default function SignInScreen() {
  const router = useRouter();
  const { socialSignIn } = useAuth();

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
            <SocialButton
              icon={social.icon}
              key={social.label}
              label={social.label}
              onPress={() => socialSignIn(social.provider)}
            />
          ))}
        </View>

        <View className="flex-row items-center gap-3">
          <View className="h-px flex-1 bg-border" />
          <Text tone="muted-foreground" variant="caption">
            or
          </Text>
          <View className="h-px flex-1 bg-border" />
        </View>

        <Button onPress={() => router.push(authTab("signup"))} size="lg">
          Create account
        </Button>

        <Text className="text-center" tone="muted-foreground" variant="caption">
          By signing up, you agree to our Terms, Privacy Policy, and Cookie Use.
        </Text>
      </View>

      <View className="flex-row items-center justify-center gap-1 px-gutter pt-4 pb-10">
        <Text tone="muted-foreground" variant="bodySm">
          Already have an account?
        </Text>
        <Pressable hitSlop={8} onPress={() => router.push(authTab("login"))}>
          <Text className="font-medium" variant="bodySm">
            Log In
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
