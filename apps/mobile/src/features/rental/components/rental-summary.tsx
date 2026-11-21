import { listingToPiece } from "@shared/data/listing-to-piece";
import type { RentalSummary } from "@wearly/shared/api/types";
import { Avatar } from "@wearly/ui-native/avatar";
import { Card } from "@wearly/ui-native/card";
import { Icon } from "@wearly/ui-native/icon";
import { Media } from "@wearly/ui-native/media";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";
import { rentalStatusLine } from "../lib/rental-status";

/** The piece, plus the one sentence that says where the rental stands. */
export function RentalStatusCard({ rental }: { rental: RentalSummary }) {
  const piece = listingToPiece(rental.listing);
  const status = rentalStatusLine(rental);

  return (
    <Card className="gap-4 p-4">
      <View className="flex-row gap-4">
        <View className="w-24 overflow-hidden rounded-media">
          <Media aspect="1/1" src={piece.images[0]} tone={piece.gallery[0]} />
        </View>
        <View className="flex-1 gap-1">
          <Text numberOfLines={2} variant="headingSm">
            {piece.name}
          </Text>
          <Text variant="label">{status.label}</Text>
          <Text tone="muted-foreground" variant="bodySm">
            {status.detail}
          </Text>
        </View>
      </View>
    </Card>
  );
}

export function RentalCounterpartyCard({ rental }: { rental: RentalSummary }) {
  const piece = listingToPiece(rental.listing);
  const relationship =
    rental.role === "renter" ? "Lending to you" : "Renting from you";

  return (
    <Card className="flex-row items-center gap-4 p-4">
      <Avatar
        name={rental.counterparty.name}
        size="lg"
        src={rental.counterparty.image ?? undefined}
      />
      <View className="flex-1 gap-1">
        <Text variant="bodyMd">{rental.counterparty.name}</Text>
        <Text tone="muted-foreground" variant="caption">
          {relationship}
        </Text>
        {piece.areaLabel.length > 0 ? (
          <View className="flex-row items-center gap-1">
            <Icon name="map-pin" size="xs" tone="muted-foreground" />
            <Text tone="muted-foreground" variant="caption">
              {piece.areaLabel}
            </Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
}
