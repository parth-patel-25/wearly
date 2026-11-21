import { useSession } from "@core/providers/session-provider";
import { ROUTES } from "@core/routing/routes";
import { RentalOverview } from "@features/rental/components/rental-overview";
import type { RentalSheetName } from "@features/rental/components/rental-sheets";
import {
  type RentalSheetKind,
  RentalSheets,
} from "@features/rental/components/rental-sheets";
import { useRentalAction } from "@features/rental/hooks/use-rental-action";
import { useRental } from "@features/rental/hooks/use-rentals";
import { Button, IconButton } from "@wearly/ui-native/button";
import { Text } from "@wearly/ui-native/text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

/**
 * Rental detail.
 *
 * The status is the hero, the next action is the only primary button, and every
 * secondary action is honest about what it does. All permission decisions come
 * from `rental.capabilities`, computed by the API.
 */
export default function RentalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const rentalId = typeof id === "string" ? id : "";
  const router = useRouter();
  const { state } = useSession();
  const { data: rental, error, isPending, refetch } = useRental(rentalId);
  const action = useRentalAction();
  const [sheet, setSheet] = useState<RentalSheetKind>("none");

  const openSheet = (next: RentalSheetName) => setSheet(next);

  return (
    <View className="flex-1 bg-background pt-safe">
      <View className="flex-row items-center px-gutter pt-4 pb-4">
        <IconButton
          accessibilityLabel="Go back"
          icon="arrow-left"
          onPress={() => router.back()}
          variant="outline"
        />
        <View className="flex-1 items-center">
          <Text numberOfLines={1} variant="headingSm">
            Rental
          </Text>
        </View>
        <View aria-hidden className="size-12" />
      </View>

      {state.sessionStatus === "unauthenticated" ? (
        <Centered
          action={
            <Button onPress={() => router.push(ROUTES.signIn)}>Sign in</Button>
          }
          body="Rentals are private to the two people in them."
          title="Sign in to open this rental"
        />
      ) : null}

      {state.sessionStatus === "pending" ? (
        <Centered body="Loading the latest state." title="One moment" />
      ) : null}

      {state.isAuthenticated && isPending ? (
        <Centered body="Loading the latest state." title="One moment" />
      ) : null}

      {state.isAuthenticated && error ? (
        <Centered
          action={<Button onPress={() => refetch()}>Try again</Button>}
          body={error instanceof Error ? error.message : "Try again."}
          title="We could not open this rental"
        />
      ) : null}

      {state.isAuthenticated && rental ? (
        <>
          <ScrollView showsVerticalScrollIndicator={false}>
            <RentalOverview
              error={action.error}
              isPending={action.isPending}
              onOpenSheet={openSheet}
              rental={rental}
              run={action.run}
            />
          </ScrollView>
          <RentalSheets
            isPending={action.isPending}
            onClose={() => setSheet("none")}
            onOpenSheet={openSheet}
            rental={rental}
            run={action.run}
            sheet={sheet}
          />
        </>
      ) : null}
    </View>
  );
}

function Centered({
  action,
  body,
  title,
}: {
  action?: React.ReactNode;
  body: string;
  title: string;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-gutter">
      <Text className="text-center" variant="headingMd">
        {title}
      </Text>
      <Text className="text-center" tone="muted-foreground" variant="bodyMd">
        {body}
      </Text>
      {action}
    </View>
  );
}
