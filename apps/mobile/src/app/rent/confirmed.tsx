import { ROUTES, rentalFor } from "@core/routing/routes";
import { useRental } from "@features/rental/hooks/use-rentals";
import { listingToPiece } from "@shared/data/listing-to-piece";
import { formatDate } from "@shared/lib/format-date";
import { RENTAL_STATUSES } from "@wearly/shared/enums";
import { Button } from "@wearly/ui-native/button";
import { Card, Panel } from "@wearly/ui-native/card";
import { Icon } from "@wearly/ui-native/icon";
import { Media } from "@wearly/ui-native/media";
import { Spinner } from "@wearly/ui-native/spinner";
import { KeyValueRow, PriceRow } from "@wearly/ui-native/status";
import { Text } from "@wearly/ui-native/text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View } from "react-native";

/**
 * Request sent.
 *
 * Not a confirmation of a rental. The lender still has to accept, the two
 * people still have to agree where to meet, and only then does anything start.
 * The copy says exactly that, and the payment block says nothing was charged.
 */
export default function RequestSentScreen() {
  const router = useRouter();
  const { rentalId } = useLocalSearchParams<{ rentalId?: string }>();
  const id = typeof rentalId === "string" ? rentalId : "";
  const { data: rental, error, isPending, refetch } = useRental(id);

  if (id.length === 0) {
    return (
      <Centered
        action={
          <Button onPress={() => router.replace(ROUTES.discover)}>
            Find something to rent
          </Button>
        }
        body="The request you were looking for is no longer on this screen."
        title="Nothing to show here"
      />
    );
  }

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Spinner />
      </View>
    );
  }

  if (error || !rental) {
    return (
      <Centered
        action={<Button onPress={() => refetch()}>Try again</Button>}
        body={
          error instanceof Error
            ? error.message
            : "We could not load the request you just sent."
        }
        title="One moment"
      />
    );
  }

  const piece = listingToPiece(rental.listing);

  /**
   * Both CTAs leave the request flow entirely. `dismissAll` pops the date
   * picker and review screen back to the tabs, so back from the destination
   * lands on Home rather than on a stale date sheet whose draft was cleared
   * when the request succeeded.
   */
  const openRental = () => {
    router.dismissAll();
    router.push(rentalFor(rental.id));
  };
  const openAllRentals = () => {
    router.dismissAll();
    router.push(ROUTES.rentals);
  };

  return (
    <View className="flex-1 bg-background pt-safe">
      <ScrollView
        contentContainerClassName="gap-8 px-gutter pt-14 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center gap-5">
          <View className="size-16 items-center justify-center rounded-pill bg-success-background">
            <Icon name="check" size="lg" tone="success" />
          </View>
          <View className="items-center gap-2">
            <Text className="text-center" variant="headingXl">
              Request sent
            </Text>
            <Text
              className="text-center"
              tone="muted-foreground"
              variant="bodyMd"
            >
              {`${rental.counterparty.name} has 48 hours to accept. Nothing is booked until they do.`}
            </Text>
          </View>
        </View>

        <Card className="flex-row items-center gap-4 p-4">
          <View className="w-20 overflow-hidden rounded-media">
            <Media aspect="1/1" src={piece.images[0]} tone={piece.gallery[0]} />
          </View>
          <View className="flex-1 gap-1">
            <Text numberOfLines={2} variant="bodyMd">
              {piece.name}
            </Text>
            <Text tone="muted-foreground" variant="caption">
              {`${formatDate(rental.startDate)} → ${formatDate(rental.endDate)}`}
            </Text>
            {piece.areaLabel.length > 0 ? (
              <Text tone="muted-foreground" variant="caption">
                {`Meet in ${piece.areaLabel}`}
              </Text>
            ) : null}
          </View>
        </Card>

        <Panel title="What happens next">
          <KeyValueRow label="Accept or decline" value="Within 48 hours" />
          <KeyValueRow label="Where" value="A public place you agree on" />
          <KeyValueRow label="Rental starts" value="When you confirm receipt" />
          <PriceRow
            hint={`${rental.days} ${rental.days === 1 ? "day" : "days"}, fixed now`}
            label="If accepted"
            value={`₹${rental.totalRupees.toLocaleString("en-IN")}`}
          />
        </Panel>

        <Card className="flex-row items-start gap-3 p-5" variant="muted">
          <Icon name="lock" size="sm" tone="muted-foreground" />
          <Text className="flex-1" tone="muted-foreground" variant="bodySm">
            Payment protection is not connected in this build, so sending this
            did not charge or reserve anything. A real provider would authorize
            the amount only after the lender accepts.
          </Text>
        </Card>

        {rental.status === RENTAL_STATUSES.REQUESTED ? null : (
          <Text tone="muted-foreground" variant="bodySm">
            This request has already moved on. Open it to see the latest state.
          </Text>
        )}
      </ScrollView>

      <View className="gap-3 border-border border-t bg-card px-gutter pt-5 pb-10">
        <Button onPress={openRental} size="lg">
          Open the request
        </Button>
        <Button onPress={openAllRentals} size="sm" variant="ghost">
          See all my rentals
        </Button>
      </View>
    </View>
  );
}

function Centered({
  action,
  body,
  title,
}: {
  action: React.ReactNode;
  body: string;
  title: string;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background px-gutter">
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
