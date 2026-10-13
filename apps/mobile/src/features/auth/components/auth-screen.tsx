import { FontAwesome6 } from "@expo/vector-icons";
import { LoginForm, SignUpForm } from "@features/auth/components/auth-forms";
import type { AuthTab } from "@features/auth/components/segmented-tabs";
import { SegmentedTabs } from "@features/auth/components/segmented-tabs";
import {
  GoogleGlyph,
  SocialButton,
} from "@features/auth/components/social-button";
import { IconButton } from "@wearly/ui-native/button";
import { useSlideIn } from "@wearly/ui-native/motion";
import { Text } from "@wearly/ui-native/text";
import { useToneColor } from "@wearly/ui-native/tone";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated from "react-native-reanimated";

/**
 * Auth — log in or sign up, one screen, two tabs.
 *
 * The rose banner greets the tab you are on, and the sheet below carries the
 * switch: a segmented control, the active form, the social pair, and a footer
 * link that swaps tabs instead of pushing another screen. One push, no
 * back-stack of near-identical forms.
 *
 * Switching is a slide, not a swap — the calendar's month-paging contract.
 * The heading and the form share one `useSlideIn` style keyed to the tab:
 * signup enters from the right, login from the left, so the direction always
 * matches the way the pill travelled. The socials and the footer are the same
 * on both tabs, so they stay put; sliding them would imply they changed.
 *
 * The tab state lives here, seeded from the route param — `/auth?tab=signup`
 * opens on signup, but which tab is *active* is the screen's own decision.
 * Each tab owns its schema, so a signup password rule never leaks into login.
 */

interface TabSpec {
  action: string;
  heading: string;
  prompt: string;
  to: AuthTab;
}

const TAB_SPEC: Record<AuthTab, TabSpec> = {
  login: {
    action: "Sign up",
    heading: "Welcome back",
    prompt: "Don't have an account?",
    to: "signup",
  },
  signup: {
    action: "Log In",
    heading: "Create your account",
    prompt: "Already have an account?",
    to: "login",
  },
};

function SocialRow() {
  const foreground = useToneColor("foreground");

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-3">
        <View className="h-px flex-1 bg-border" />
        <Text tone="muted-foreground" variant="caption">
          or
        </Text>
        <View className="h-px flex-1 bg-border" />
      </View>
      <View className="gap-3">
        <SocialButton icon={<GoogleGlyph />} label="Sign in with Google" />
        <SocialButton
          icon={<FontAwesome6 color={foreground} name="apple" size={18} />}
          label="Sign in with Apple"
        />
      </View>
    </View>
  );
}

export interface AuthScreenProps {
  /** Which tab the route opened on; the screen owns it from there. */
  initialTab?: AuthTab;
}

export function AuthScreen({ initialTab = "login" }: AuthScreenProps) {
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const spec = TAB_SPEC[tab];
  // Direction follows travel: signup is "next" (from the right), login
  // "previous" (from the left) — and both change together with the tab, so
  // one effect replay handles every switch.
  const slideStyle = useSlideIn({
    direction: tab === "signup" ? 1 : -1,
    resetKey: tab,
  });

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="flex flex-col"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-b-3xl bg-primary pt-safe">
          <View className="gap-6 px-gutter pt-4 pb-8">
            <IconButton
              accessibilityLabel="Go back"
              icon="arrow-left"
              onPress={() => router.back()}
              variant="outline"
            />
            <Animated.View style={slideStyle}>
              <Text
                className="text-center"
                tone="primary-foreground"
                variant="headingLg"
              >
                {spec.heading}
              </Text>
            </Animated.View>
          </View>
        </View>

        <View className="-mt-5 flex-col gap-7 rounded-t-5xl bg-background px-gutter pt-6 pb-10 shadow-float">
          <SegmentedTabs active={tab} onChange={setTab} />
          <Animated.View style={slideStyle}>
            {tab === "login" ? <LoginForm /> : <SignUpForm />}
          </Animated.View>
          <SocialRow />

          <View className="flex-row items-center justify-center gap-1">
            <Text tone="muted-foreground" variant="bodySm">
              {spec.prompt}
            </Text>
            <Pressable hitSlop={8} onPress={() => setTab(spec.to)}>
              <Text className="font-medium" tone="primary" variant="bodySm">
                {spec.action}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
