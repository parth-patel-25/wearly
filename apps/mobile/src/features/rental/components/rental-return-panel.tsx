import { formatDate } from "@shared/lib/format-date";
import type { RentalDetail } from "@wearly/shared/api/types";
import { RENTAL_STATUSES } from "@wearly/shared/enums";
import { Button } from "@wearly/ui-native/button";
import { Panel } from "@wearly/ui-native/card";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

interface RentalReturnPanelProps {
  isPending: boolean;
  onConfirmReturn: () => void;
  onMarkReturned: () => void;
  rental: RentalDetail;
}

/** Return is confirmed by both sides. No deposit, no payout UI in this build. */
export function RentalReturnPanel({
  isPending,
  onConfirmReturn,
  onMarkReturned,
  rental,
}: RentalReturnPanelProps) {
  if (
    rental.status !== RENTAL_STATUSES.ACTIVE &&
    rental.status !== RENTAL_STATUSES.RETURN_PENDING &&
    rental.status !== RENTAL_STATUSES.RETURNED
  ) {
    return null;
  }

  return (
    <Panel title="Return">
      <View className="gap-1">
        <Text variant="bodyMd">
          {rental.returnDueAt
            ? `Due back by ${formatDate(rental.returnDueAt)}`
            : "The return date is set when the rental starts."}
        </Text>
        <Text tone="muted-foreground" variant="bodySm">
          Hand the piece back in person, then mark it returned. The lender
          confirms the other half.
        </Text>
      </View>

      {rental.capabilities.canMarkReturned ? (
        <Button disabled={isPending} onPress={onMarkReturned} size="md">
          {isPending ? "Saving…" : "I returned the piece"}
        </Button>
      ) : null}

      {rental.capabilities.canConfirmReturn ? (
        <Button disabled={isPending} onPress={onConfirmReturn} size="md">
          {isPending ? "Saving…" : "I received it back"}
        </Button>
      ) : null}
    </Panel>
  );
}
