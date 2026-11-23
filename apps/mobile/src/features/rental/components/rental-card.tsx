import { listingToPiece } from "@shared/data/listing-to-piece";
import { formatDateRange } from "@shared/lib/format-date";
import type { RentalSummary } from "@wearly/shared/api/types";
import { RENTAL_STATUSES } from "@wearly/shared/enums";
import { Avatar } from "@wearly/ui-native/avatar";
import { Button } from "@wearly/ui-native/button";
import { Card } from "@wearly/ui-native/card";
import { Media } from "@wearly/ui-native/media";
import { Text } from "@wearly/ui-native/text";
import { Pressable, View } from "react-native";
import { rentalStatusLine } from "../lib/rental-status";

interface RentalCardProps {
  onOpen: () => void;
  rental: RentalSummary;
}

/** One large card. The status line is the headline, not a badge in a corner. */
export function RentalCard({ onOpen, rental }: RentalCardProps) {
  const piece = listingToPiece(rental.listing);
  const status = rentalStatusLine(rental);
  const counterparty =
    rental.role === "renter"
      ? `From ${rental.counterparty.name}`
      : `With ${rental.counterparty.name}`;
  const isNewRequest =
    rental.role === "lender" && rental.status === RENTAL_STATUSES.REQUESTED;

  return (
    <Pressable
      accessibilityLabel={`${piece.name}, ${status.label}`}
      accessibilityRole="button"
      onPress={onOpen}
    >
      <Card className="gap-4 p-4">
        <View className="flex-row gap-4">
          <View className="w-20 overflow-hidden rounded-media">
            <Media aspect="1/1" src={piece.images[0]} tone={piece.gallery[0]} />
          </View>
          <View className="flex-1 gap-1">
            <Text numberOfLines={2} variant="bodyMd">
              {piece.name}
            </Text>
            <Text tone="muted-foreground" variant="caption">
              {formatDateRange(rental.startDate, rental.endDate)}
            </Text>
            <Text variant="label">{status.label}</Text>
            <Text tone="muted-foreground" variant="caption">
              {status.detail}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <Avatar
            name={counterparty}
            size="md"
            src={rental.counterparty.image ?? undefined}
          />
          <Text className="flex-1" tone="muted-foreground" variant="caption">
            {counterparty}
          </Text>
          <Button
            onPress={onOpen}
            size="sm"
            variant={isNewRequest ? "primary" : "soft"}
          >
            {isNewRequest ? "Review request" : "Open"}
          </Button>
        </View>
      </Card>
    </Pressable>
  );
}
