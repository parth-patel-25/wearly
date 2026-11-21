import type { RentalEvent } from "@wearly/shared/api/types";
import { RENTAL_ACTIONS } from "@wearly/shared/enums";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

const EVENT_LABEL: Record<string, string> = {
  [RENTAL_ACTIONS.ACCEPT]: "Lender accepted the request",
  [RENTAL_ACTIONS.ACCEPT_MEETUP]: "Meetup confirmed",
  [RENTAL_ACTIONS.CANCEL]: "Rental cancelled",
  [RENTAL_ACTIONS.CHECK_IN]: "Checked in at the meetup",
  [RENTAL_ACTIONS.CONFIRM_HANDOVER]: "Handover confirmed — rental started",
  [RENTAL_ACTIONS.CONFIRM_RETURN]: "Return confirmed",
  [RENTAL_ACTIONS.DECLINE]: "Lender declined the request",
  [RENTAL_ACTIONS.EXPIRE]: "Request expired",
  [RENTAL_ACTIONS.MARK_RETURNED]: "Marked as returned",
  [RENTAL_ACTIONS.OPEN_DISPUTE]: "Dispute opened",
  [RENTAL_ACTIONS.PROPOSE_MEETUP]: "Meetup proposed",
  [RENTAL_ACTIONS.REPORT_ISSUE]: "Issue reported",
  [RENTAL_ACTIONS.REPORT_NO_SHOW]: "No-show reported",
  [RENTAL_ACTIONS.REQUEST]: "Request sent",
  [RENTAL_ACTIONS.RESOLVE_DISPUTE]: "Dispute resolved",
  [RENTAL_ACTIONS.RETRY_PAYMENT]: "Payment retried",
  [RENTAL_ACTIONS.RETURN_DUE]: "Return became due",
  [RENTAL_ACTIONS.START_INSPECTION]: "Inspection started",
  handover_acknowledged: "Lender acknowledged the handover",
};

function when(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(date);
}

interface RentalTimelineProps {
  counterparty: { id: string; name: string };
  events: readonly RentalEvent[];
}

/** A record of what actually happened. Never a forecast of what might. */
export function RentalTimeline({ counterparty, events }: RentalTimelineProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <View className="gap-4">
      {events.map((event, index) => (
        <View className="flex-row gap-3" key={event.id}>
          <View className="items-center pt-1">
            <View className="size-2 rounded-pill bg-primary" />
            {index < events.length - 1 ? (
              <View className="w-px flex-1 bg-border" />
            ) : null}
          </View>
          <View className="flex-1 gap-1 pb-1">
            <Text variant="bodySm">{EVENT_LABEL[event.type] ?? "Updated"}</Text>
            <Text tone="muted-foreground" variant="caption">
              {eventLine(event, counterparty)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function eventLine(
  event: RentalEvent,
  counterparty: { id: string; name: string }
): string {
  const timestamp = when(event.createdAt);
  if (event.actorId === null || event.actorId === undefined) {
    return timestamp;
  }
  const actor = event.actorId === counterparty.id ? counterparty.name : "You";
  return `${actor} · ${timestamp}`;
}
