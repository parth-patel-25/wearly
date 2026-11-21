import { useSession } from "@core/providers/session-provider";
import { ROUTES, rentalFor } from "@core/routing/routes";
import { RentalCard } from "@features/rental/components/rental-card";
import type { RentalRole } from "@features/rental/hooks/use-rentals";
import { useRentals } from "@features/rental/hooks/use-rentals";
import {
  GROUP_LABEL,
  GROUP_ORDER,
  groupRentals,
} from "@features/rental/lib/rental-status";
import { Button, IconButton } from "@wearly/ui-native/button";
import { EmptyState } from "@wearly/ui-native/display";
import { Spinner } from "@wearly/ui-native/spinner";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

const ROLES: readonly { label: string; value: RentalRole }[] = [
  { label: "Renting", value: "renter" },
  { label: "Lending", value: "lender" },
];

/**
 * Your rentals.
 *
 * A secondary screen, not a tab: it owns its back row and is reached from
 * Profile, the Home rental card, Activity and the post-request confirmation.
 * Two roles, one screen. Groups are derived from the server status, and each
 * card states what is happening and who acts next. Actions themselves live on
 * the rental detail, where the full context is on screen.
 *
 * The session has three states, not two. While the cookie is still being read
 * the screen shows a spinner; the guest empty state is only for an account
 * that is genuinely absent, never for one that has not answered yet.
 */
export default function RentalsScreen() {
  const router = useRouter();
  const { state } = useSession();
  const [role, setRole] = useState<RentalRole>("renter");
  const { data, error, isPending, refetch } = useRentals(role);

  const groups = groupRentals(data?.items ?? []);
  const total = data?.items.length ?? 0;

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
            Rentals
          </Text>
        </View>
        <View aria-hidden className="size-12" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-gutter pt-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          <Text variant="headingXl">Your rentals</Text>
          <View className="flex-row gap-2">
            {ROLES.map((option) => (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: role === option.value }}
                className={`rounded-pill px-4 py-2 ${role === option.value ? "bg-primary" : "bg-muted"}`}
                key={option.value}
                onPress={() => setRole(option.value)}
              >
                <Text
                  tone={
                    role === option.value
                      ? "primary-foreground"
                      : "muted-foreground"
                  }
                  variant="label"
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

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
            body="Rentals belong to an account, so they follow you between devices."
            icon="user"
            title="Sign in to see your rentals"
          />
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
                : "Could not load your rentals."}
            </Text>
            <Button onPress={() => refetch()} variant="outline">
              Try again
            </Button>
          </View>
        ) : null}

        {state.isAuthenticated && !(isPending || error) && total === 0 ? (
          <EmptyState
            action={
              <Button onPress={() => router.push(ROUTES.discover)}>
                {role === "renter" ? "Browse pieces" : "See your listings"}
              </Button>
            }
            body={
              role === "renter"
                ? "Nothing is booked yet. When you request a piece it will live here, from the first message to the return."
                : "When someone asks to rent a piece of yours, the request lands here."
            }
            icon="bag"
            title={
              role === "renter"
                ? "Your wardrobe adventures start here."
                : "Nothing lent out yet."
            }
          />
        ) : null}

        {state.isAuthenticated && !(isPending || error)
          ? GROUP_ORDER.map((group) => {
              const rentals = groups[group];
              if (rentals.length === 0) {
                return null;
              }
              return (
                <View className="gap-3" key={group}>
                  <Text tone="muted-foreground" variant="label">
                    {GROUP_LABEL[group]}
                  </Text>
                  {rentals.map((rental) => (
                    <RentalCard
                      key={rental.id}
                      onOpen={() => router.push(rentalFor(rental.id))}
                      rental={rental}
                    />
                  ))}
                </View>
              );
            })
          : null}
      </ScrollView>
    </View>
  );
}
