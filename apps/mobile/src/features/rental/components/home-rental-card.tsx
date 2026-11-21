import { listingToPiece } from "@shared/data/listing-to-piece";
import type { RentalSummary } from "@wearly/shared/api/types";
import { RENTAL_STATUSES } from "@wearly/shared/enums";
import { Button } from "@wearly/ui-native/button";
import { Card } from "@wearly/ui-native/card";
import { Media } from "@wearly/ui-native/media";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

import type { RentalAttention } from "../lib/rental-attention";

interface HomeRentalCardProps {
  attention: RentalAttention;
  onOpen: () => void;
}

/**
 * The one rental Home interrupts for.
 *
 * Compact by design: a thumbnail, what is happening, the piece, and the single
 * next step. It links straight to that rental, never to the generic list, so a
 * return due tomorrow costs one tap. It only mounts when the API reports
 * something that clears `HOME_MIN_PRIORITY` — Home is a magazine first.
 */
export function HomeRentalCard({ attention, onOpen }: HomeRentalCardProps) {
  const piece = listingToPiece(attention.rental.listing);
  const isNewRequest = isNewRequestFor(attention.rental);

  return (
    <Card className="gap-3 p-4" variant="soft">
      <View className="flex-row items-center gap-3">
        <View className="w-16 overflow-hidden rounded-media">
          <Media aspect="1/1" src={piece.images[0]} tone={piece.gallery[0]} />
        </View>
        <View className="flex-1 gap-1">
          <Text tone="accent-foreground" variant="label">
            {attention.label}
          </Text>
          <Text numberOfLines={2} variant="bodyMd">
            {piece.name}
          </Text>
          <Text tone="accent-foreground" variant="caption">
            {attention.detail}
          </Text>
        </View>
      </View>
      <Button onPress={onOpen}>
        {isNewRequest ? "Review request" : "View rental"}
      </Button>
    </Card>
  );
}

function isNewRequestFor(rental: RentalSummary): boolean {
  return (
    rental.role === "lender" && rental.status === RENTAL_STATUSES.REQUESTED
  );
}
