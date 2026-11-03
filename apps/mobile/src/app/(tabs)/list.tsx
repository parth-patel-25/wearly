import { useSession } from "@core/providers/session-provider";
import { ROUTES } from "@core/routing/routes";

import { Button } from "@wearly/ui-native/button";
import { Card, Panel } from "@wearly/ui-native/card";
import { EmptyState } from "@wearly/ui-native/display";
import type { IconName } from "@wearly/ui-native/icon";
import { Icon } from "@wearly/ui-native/icon";
import { Text } from "@wearly/ui-native/text";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import type { Listing } from "@wearly/shared/api/types";
import { useRouter } from "expo-router";
import { ActivityIndicator, Image, View } from "react-native";

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

  const { data: listings, error: listingsError, isLoading, refetch } = useQuery<Listing[]>({
    enabled: state.isAuthenticated,
    queryFn: async () => {
      const apiBase = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";
      const res = (await authClient.$fetch(`${apiBase}/api/listings`)) as {
        data?: Listing[];
        error?: { message?: string };
      };
      if (res.error || !Array.isArray(res.data)) {
        throw new Error(res.error?.message ?? "Failed to load listings");
      }
      return res.data;
    },
    queryKey: ["my-listings"],
  });

  if (!state.isAuthenticated) {
    return (
      <View className="flex-1 gap-8 bg-background px-gutter pt-6">
        <View className="gap-1">
          <Text variant="headingXl">Share something good</Text>
          <Text tone="muted-foreground" variant="bodyMd">
            Your wardrobe does more good out twice than on once.
          </Text>
        </View>
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
      </View>
    );
  }

  return (
    <View className="flex-1 gap-6 bg-background px-gutter pt-6">
      <View className="flex-row items-center justify-between">
        <Text variant="headingXl">Your listings</Text>
        {(listings ?? []).length > 0 ? (
          <Text tone="muted-foreground" variant="caption">
            {(listings ?? []).length} live
          </Text>
        ) : null}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#C54B75" size="large" />
        </View>
      ) : listingsError ? (
        <View className="flex-1 items-center justify-center gap-3">
          <Text tone="destructive" variant="bodySm">
            {listingsError instanceof Error ? listingsError.message : "Failed to load listings"}
          </Text>
          <Button onPress={() => refetch()} size="sm" variant="soft">
            Retry
          </Button>
        </View>
      ) : (listings ?? []).length === 0 ? (
        <View className="gap-6">
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
          <Card className="gap-3 p-5">
            <Text tone="muted-foreground" variant="bodySm">
              The listing flow itself is the next build phase. Nothing here
              accepts input yet, because a form that quietly discards what you
              typed is worse than an honest outline.
            </Text>
            <Button
              onPress={() => router.push("/list/new" as any)}
              size="md"
            >
              Start a listing
            </Button>
          </Card>
        </View>
      ) : (
        <View className="gap-4">
          {(listings ?? []).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
          <Button
            onPress={() => router.push("/list/new" as any)}
            size="md"
            variant="soft"
          >
            List another item
          </Button>
        </View>
      )}
    </View>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const cover = listing.photos?.[0];
  return (
    <Card className="gap-3 p-4">
      {cover ? (
        <Image
          source={{ uri: cover }}
          style={{ width: "100%", height: 160, borderRadius: 12 }}
        />
      ) : null}
      <View className="gap-1">
        <Text variant="headingSm">{listing.title}</Text>
        <Text tone="muted-foreground" variant="bodySm">
          {listing.category} · {listing.size} · {listing.condition}
        </Text>
        <Text variant="bodyMd">₹{listing.pricePerDay}/day</Text>
      </View>
    </Card>
  );
}
