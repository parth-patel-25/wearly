import { useSession } from "@core/providers/session-provider";
import { ROUTES } from "@core/routing/routes";
import { ListingEmptyState } from "@features/listing/components/listing-empty-state";
import { conditionLabel } from "@shared/data/catalogue";
import { normaliseCondition } from "@shared/data/listing-to-piece";
import type { ListRenderItem } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { API_ROUTES } from "@wearly/shared/api/routes";
import type { Listing } from "@wearly/shared/api/types";
import { AppList } from "@wearly/ui-native/app-list";
import { Button } from "@wearly/ui-native/button";
import { Card } from "@wearly/ui-native/card";
import { EmptyState } from "@wearly/ui-native/display";
import { Spinner } from "@wearly/ui-native/spinner";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { Image, View } from "react-native";
import { authClient } from "@/lib/auth-client";

export default function ListScreen() {
  const router = useRouter();
  const { state } = useSession();

  const {
    data: listings,
    error: listingsError,
    isLoading,
    refetch,
  } = useQuery<Listing[]>({
    enabled: state.isAuthenticated,
    queryFn: async () => {
      const apiBase =
        process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";
      const res = (await authClient.$fetch(
        `${apiBase}${API_ROUTES.LISTINGS.BASE}`
      )) as {
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

  if (state.sessionStatus === "pending") {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Spinner />
      </View>
    );
  }

  if (state.sessionStatus === "unauthenticated") {
    return (
      <View className="flex-1 gap-6 bg-background px-6 pt-5">
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

  const renderItem: ListRenderItem<Listing> = ({ item }) => (
    <ListingCard listing={item} />
  );

  const startListing = () => router.push("/list/new");
  const emptyState = (
    <ListingEmptyState
      error={listingsError}
      isLoading={isLoading}
      onRetry={() => refetch()}
      onStart={startListing}
    />
  );

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-6 pt-5 pb-3">
          <Text variant="headingXl">Your listings</Text>
          {(listings ?? []).length > 0 ? (
            <Text tone="muted-foreground" variant="caption">
              {(listings ?? []).length} live
            </Text>
          ) : null}
        </View>
        <AppList
          className="px-4"
          data={listings ?? []}
          emptyState={emptyState}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          separator={<View className="h-4" />}
        />
      </View>
      {(listings ?? []).length > 0 ? (
        <View className="px-6 pt-3 pb-4">
          <Button
            onPress={() => router.push("/list/new")}
            size="md"
            variant="soft"
          >
            List another item
          </Button>
        </View>
      ) : null}
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
          style={{ borderRadius: 12, height: 160, width: "100%" }}
        />
      ) : null}
      <View className="gap-1">
        <Text variant="headingSm">{listing.title}</Text>
        <Text tone="muted-foreground" variant="bodySm">
          {listing.category} · {listing.size} · {conditionLabel(normaliseCondition(listing.condition))}
        </Text>
        <Text variant="bodyMd">₹{listing.pricePerDay}/day</Text>
      </View>
    </Card>
  );
}
