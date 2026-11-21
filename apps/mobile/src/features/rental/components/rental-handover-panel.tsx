import { formatDate } from "@shared/lib/format-date";
import type { RentalDetail } from "@wearly/shared/api/types";
import { RENTAL_STATUSES } from "@wearly/shared/enums";
import { Button } from "@wearly/ui-native/button";
import { Panel } from "@wearly/ui-native/card";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

interface RentalHandoverPanelProps {
  isPending: boolean;
  onAcknowledge: () => void;
  onConfirmHandover: () => void;
  onReportIssue: () => void;
  onStartInspection: () => void;
  rental: RentalDetail;
}

/**
 * The moment the rental starts. The renter confirms receipt; the lender's
 * acknowledgement is recorded but never blocks activation.
 */
export function RentalHandoverPanel({
  isPending,
  onAcknowledge,
  onConfirmHandover,
  onReportIssue,
  onStartInspection,
  rental,
}: RentalHandoverPanelProps) {
  const atMeetup =
    rental.status === RENTAL_STATUSES.AT_MEETUP ||
    rental.status === RENTAL_STATUSES.HANDOVER_PENDING;

  if (!atMeetup) {
    return null;
  }

  return (
    <Panel subtitle="Inspect the piece before you confirm" title="Handover">
      <View className="gap-1">
        <Text variant="bodyMd">
          {rental.role === "renter"
            ? "Only you can start the rental."
            : "The renter confirms receipt on their phone."}
        </Text>
        <Text tone="muted-foreground" variant="bodySm">
          A rental is never activated just because a request was accepted.
        </Text>
        {rental.handoverAcknowledgedAt ? (
          <Text tone="muted-foreground" variant="caption">
            {`Lender acknowledged on ${formatDate(rental.handoverAcknowledgedAt)}.`}
          </Text>
        ) : null}
      </View>

      {rental.capabilities.canStartInspection ? (
        <Button
          disabled={isPending}
          onPress={onStartInspection}
          size="md"
          variant="outline"
        >
          Start inspection
        </Button>
      ) : null}

      {rental.capabilities.canConfirmHandover ? (
        <Button disabled={isPending} onPress={onConfirmHandover} size="md">
          Confirm receipt
        </Button>
      ) : null}

      {rental.capabilities.canAcknowledgeHandover ? (
        <Button
          disabled={isPending}
          onPress={onAcknowledge}
          size="md"
          variant="outline"
        >
          {rental.handoverAcknowledgedAt
            ? "Acknowledged"
            : "I handed the piece over"}
        </Button>
      ) : null}

      {rental.capabilities.canReportIssue ? (
        <Button onPress={onReportIssue} size="sm" variant="ghost">
          Something is wrong with the piece
        </Button>
      ) : null}
    </Panel>
  );
}
