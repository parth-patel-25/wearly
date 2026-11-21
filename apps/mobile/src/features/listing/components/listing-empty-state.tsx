import { Button } from "@wearly/ui-native/button";
import { Card, Panel } from "@wearly/ui-native/card";
import type { IconName } from "@wearly/ui-native/icon";
import { Icon } from "@wearly/ui-native/icon";
import { Skeleton } from "@wearly/ui-native/skeleton";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

const STEPS: readonly { detail: string; icon: IconName; label: string }[] = [
  {
    detail: "Four photos, front and back. No filter.",
    icon: "camera",
    label: "Photos",
  },
  {
    detail: "What it is, and the area you will meet in.",
    icon: "shirt",
    label: "The piece",
  },
  {
    detail: "Size, and an honest description of its condition.",
    icon: "sparkles",
    label: "Size and condition",
  },
  {
    detail: "Your price per day. Cleaning is included.",
    icon: "sparkles",
    label: "Price",
  },
  {
    detail: "Which days it is free, and how you hand it over in person.",
    icon: "calendar",
    label: "Availability",
  },
];

const SKELETONS = ["first", "second", "third"] as const;

interface ListingEmptyStateProps {
  error: unknown;
  isLoading: boolean;
  onRetry: () => void;
  onStart: () => void;
}

/** Loading, failure, and "nothing yet" are three different messages. */
export function ListingEmptyState({
  error,
  isLoading,
  onRetry,
  onStart,
}: ListingEmptyStateProps) {
  if (isLoading) {
    return (
      <View className="gap-4 pt-5">
        {SKELETONS.map((slot) => (
          <View
            className="gap-3 rounded-card border border-border bg-card p-4"
            key={slot}
          >
            <Skeleton className="h-40 w-full rounded-card" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </View>
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center justify-center gap-3 pt-5">
        <Text tone="destructive" variant="bodySm">
          {error instanceof Error ? error.message : "Failed to load listings"}
        </Text>
        <Button onPress={onRetry} size="sm" variant="soft">
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View className="gap-5 pt-5">
      <Panel
        subtitle="Five steps, and you can stop at any of them"
        title="How listing works"
      >
        <View className="flex-col">
          {STEPS.map((step) => (
            <View className="flex-row items-start gap-3 py-2" key={step.label}>
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
      <Card className="gap-3 p-5">
        <Text tone="muted-foreground" variant="bodySm">
          Start with photos, then add the details renters ask about. You can
          leave at any step and come back.
        </Text>
        <Button onPress={onStart} size="md">
          Start a listing
        </Button>
      </Card>
    </View>
  );
}
