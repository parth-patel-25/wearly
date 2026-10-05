import { useSession } from "@core/providers/session-provider";
import { ROUTES } from "@core/routing/routes";

import { Button } from "@wearly/ui-native/button";
import { Card, Panel } from "@wearly/ui-native/card";
import { EmptyState } from "@wearly/ui-native/display";
import type { IconName } from "@wearly/ui-native/icon";
import { Icon } from "@wearly/ui-native/icon";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { View } from "react-native";

/**
 * List a piece.
 *
 * Wearly is two-sided, so this screen is a first-class destination: the third
 * tab, a hanger in the bar, and an ordinary entry in the tab navigator. It used
 * to be reached through a centre `+` that was a button rather than a place, which
 * meant it had no tab of its own and the bar's slots were not the same width.
 *
 * The guided listing flow is Phase 3 and is not built yet, so this screen shows
 * the shape of it — five calm steps and what each one asks — rather than pretending
 * to be a working form.
 *
 * A half-built form that accepts input and then throws it away is worse than an
 * honest outline, so the buttons are labelled as what they are.
 */

const STEPS: readonly { icon: IconName; label: string; detail: string }[] = [
  {
    detail: "Four photos, front and back. No filter.",
    icon: "camera",
    label: "Photos",
  },
  {
    detail: "What it is, and what category it belongs to.",
    icon: "shirt",
    label: "The piece",
  },
  {
    detail: "Size, and an honest description of its condition.",
    icon: "sparkles",
    label: "Size and condition",
  },
  {
    detail: "Your price per day, and your refundable deposit.",
    icon: "truck",
    label: "Price",
  },
  {
    detail: "Which days it is free, and how you hand it over.",
    icon: "calendar",
    label: "Availability",
  },
];

export default function ListScreen() {
  const router = useRouter();
  const { state } = useSession();

  return (
    <View className="flex-1 gap-8 bg-background px-gutter pt-6">
      <View className="gap-1">
        <Text variant="headingXl">Share something good</Text>
        <Text tone="muted-foreground" variant="bodyMd">
          Your wardrobe does more good out twice than on once.
        </Text>
      </View>

      {state.isAuthenticated ? (
        <Panel
          subtitle="Five steps, and you can stop at any of them"
          title="How listing works"
        >
          <View className="flex-col">
            {STEPS.map((step) => (
              <View
                className="flex-row items-start gap-3 py-2"
                key={step.label}
              >
                <View className="size-9 items-center justify-center rounded-pill bg-accent">
                  <Icon name={step.icon} size="sm" tone="accent-foreground" />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text variant="bodySm">{step.label}</Text>
                  <Text tone="muted-foreground" variant="caption">
                    {step.detail}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Panel>
      ) : (
        <EmptyState
          action={
            <Button onPress={() => router.push(ROUTES.discover)} size="md">
              Keep browsing
            </Button>
          }
          body="Listing needs an account, so the lender can be paid and so renters know who they are dealing with. You can do that in a moment."
          icon="plus"
          title="Have something beautiful to share?"
        />
      )}

      {state.isAuthenticated ? (
        <Card className="gap-3 p-5">
          <Text tone="muted-foreground" variant="bodySm">
            The listing flow itself is the next build phase. Nothing here
            accepts input yet, because a form that quietly discards what you
            typed is worse than an honest outline.
          </Text>
          <Button disabled size="md" variant="soft">
            Start a listing
          </Button>
        </Card>
      ) : null}
    </View>
  );
}
