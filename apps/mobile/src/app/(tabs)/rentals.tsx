import type { ConfirmedRental } from "@core/providers/session-provider";
import { useSession } from "@core/providers/session-provider";
import { ROUTES } from "@core/routing/routes";
import { countDays } from "@features/rental/validations/rental.schema";
import { findPiece, formatRupees } from "@shared/data/catalogue";
import { Button } from "@wearly/ui-native/button";
import { Card } from "@wearly/ui-native/card";
import { EmptyState } from "@wearly/ui-native/display";
import { Media } from "@wearly/ui-native/media";
import { PriceRow, StatusPill } from "@wearly/ui-native/status";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { View } from "react-native";

/**
 * My rentals.
 *
 * One large card per rental, never a table. A renter has a handful of things out
 * at a time, and a table would make three rows look like a ledger.
 *
 * The empty state is the common case in a prototype, so it is designed rather
 * than tolerated: a garment silhouette, a line that invites, and one button. The
 * populated layout is reachable by completing a rental, which is exactly the
 * path a real user takes.
 */

const PROTOTYPE_NOTE =
  "This is a prototype, so there are no real bookings. Complete a rental from any product page and it appears here.";

export default function RentalsScreen() {
  const router = useRouter();
  const { state } = useSession();

  return (
    <View className="flex-1 gap-8 bg-background px-gutter pt-6">
      <View className="flex-row items-center justify-between">
        <Text variant="headingXl">Your rentals</Text>
        {state.lastRental ? (
          <Text tone="muted-foreground" variant="caption">
            1 active
          </Text>
        ) : null}
      </View>

      {state.lastRental ? (
        <RentalCard rental={state.lastRental} />
      ) : (
        <EmptyState
          action={
            <Button onPress={() => router.push(ROUTES.discover)} size="md">
              Browse pieces
            </Button>
          }
          body="Nothing is booked yet. When you rent something it will live here, with its dates and its return."
          icon="bag"
          title="Your wardrobe adventures start here."
        />
      )}

      <Text tone="muted-foreground" variant="caption">
        {PROTOTYPE_NOTE}
      </Text>
    </View>
  );
}

interface RentalCardProps {
  rental: ConfirmedRental;
}

function RentalCard({ rental }: RentalCardProps) {
  const piece = findPiece(rental.pieceId);

  if (!piece) {
    return null;
  }

  const days = countDays(rental.start, rental.end);

  return (
    <Card className="gap-4 p-4">
      <View className="w-full overflow-hidden rounded-media">
        <Media aspect="16/9" src={piece.images[0]} tone={piece.gallery[0]} />
      </View>

      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text variant="headingSm">{piece.name}</Text>
          <Text tone="muted-foreground" variant="caption">
            {`${rental.start} → ${rental.end} · ${days} ${days === 1 ? "day" : "days"}`}
          </Text>
        </View>
        <StatusPill status="active" />
      </View>

      <View className="flex-col gap-2 rounded-card bg-muted p-4">
        <PriceRow
          emphasis="muted"
          label="Deposit held"
          value={formatRupees(piece.deposit)}
        />
        <PriceRow
          emphasis="muted"
          label={rental.method === "pickup" ? "Collect from" : "Delivering to"}
          value={
            rental.method === "pickup"
              ? piece.lender.neighbourhood
              : "Your saved address"
          }
        />
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button size="sm" variant="outline">
            Message lender
          </Button>
        </View>
        <View className="flex-1">
          <Button size="sm" variant="soft">
            Return it
          </Button>
        </View>
      </View>
    </Card>
  );
}
