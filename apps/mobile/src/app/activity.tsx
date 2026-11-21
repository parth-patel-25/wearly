import { useSession } from "@core/providers/session-provider";
import { ROUTES, rentalFor } from "@core/routing/routes";
import { RentalCard } from "@features/rental/components/rental-card";
import { useAllRentals } from "@features/rental/hooks/use-rentals";
import { selectAttention } from "@features/rental/lib/rental-attention";
import { Button, IconButton } from "@wearly/ui-native/button";
import { EmptyState } from "@wearly/ui-native/display";
import { Spinner } from "@wearly/ui-native/spinner";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";

/**
 * Activity — the bell's destination.
 *
 * Not an inbox: there is no notification store, no unread count and no event
 * feed on the server. This is the existing rental list filtered to the states
 * that actually ask something of the person, sorted by urgency. Every row maps
 * to a real status and opens `/rental/[id]`, so the screen cannot invent an
 * event the API does not have.
 */
export default function ActivityScreen() {
  const router = useRouter();
  const { state } = useSession();
  const { data, error, isPending, refetch } = useAllRentals();
  const items = selectAttention(data?.items ?? []);

  return (
    <View className="flex-1 bg-background pt-safe">
      <View className="flex-row items-center px-gutter pt-4 pb-2">
        <IconButton
          accessibilityLabel="Go back"
          icon="arrow-left"
          onPress={() => router.back()}
          variant="outline"
        />
        <View className="flex-1 items-center">
          <Text numberOfLines={1} variant="headingSm">
            Activity
          </Text>
        </View>
        <View aria-hidden className="size-12" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-gutter pt-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {state.sessionStatus === "pending" ? (
          <View className="items-center py-12">
            <Spinner />
          </View>
        ) : null}

        {state.sessionStatus === "unauthenticated" ? (
          <EmptyState
            action={
              <Button onPress={() => router.push(ROUTES.signIn)}>
                Sign in
              </Button>
            }
            body="Rental updates belong to an account, so they follow you between devices."
            icon="user"
            title="Sign in to see rental activity"
          />
        ) : null}

        {state.isAuthenticated && isPending ? (
          <View className="items-center py-12">
            <Spinner />
          </View>
        ) : null}

        {state.isAuthenticated && error ? (
          <View className="items-center gap-4 py-8">
            <Text
              className="text-center"
              tone="muted-foreground"
              variant="bodyMd"
            >
              {error instanceof Error
                ? error.message
                : "Could not load your rental activity."}
            </Text>
            <Button onPress={() => refetch()} variant="outline">
              Try again
            </Button>
          </View>
        ) : null}

        {state.isAuthenticated &&
        !(isPending || error) &&
        items.length === 0 ? (
          <EmptyState
            body="When a rental needs a decision or a deadline, it will appear here."
            icon="bell"
            title="You're all caught up"
          />
        ) : null}

        {state.isAuthenticated && !(isPending || error) && items.length > 0 ? (
          <>
            <View className="gap-1">
              <Text variant="headingXl">Needs your attention</Text>
              <Text tone="muted-foreground" variant="bodySm">
                Only rentals with a decision or a deadline.
              </Text>
            </View>
            <View className="gap-3">
              {items.map(({ rental }) => (
                <RentalCard
                  key={rental.id}
                  onOpen={() => router.push(rentalFor(rental.id))}
                  rental={rental}
                />
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
