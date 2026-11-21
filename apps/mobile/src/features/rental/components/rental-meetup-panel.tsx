import type { RentalMeetup } from "@wearly/shared/api/types";
import { MEETUP_STATUSES } from "@wearly/shared/enums";
import { Button } from "@wearly/ui-native/button";
import { Panel } from "@wearly/ui-native/card";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    weekday: "short",
  }).format(date);
}

interface RentalMeetupPanelProps {
  canAcceptMeetup: boolean;
  canCheckIn: boolean;
  canProposeMeetup: boolean;
  isPending: boolean;
  meetup: RentalMeetup | null | undefined;
  onAccept: () => void;
  onCheckIn: () => void;
  onPropose: () => void;
}

/** The agreed public place. There is never a pin, a map or an address here. */
export function RentalMeetupPanel({
  canAcceptMeetup,
  canCheckIn,
  canProposeMeetup,
  isPending,
  meetup,
  onAccept,
  onCheckIn,
  onPropose,
}: RentalMeetupPanelProps) {
  if (!meetup) {
    return canProposeMeetup ? (
      <Panel
        subtitle="A café, a mall, a station — never a home address"
        title="Meetup"
      >
        <Text tone="muted-foreground" variant="bodySm">
          Agree on a public place and a time. The other person can accept or
          suggest somewhere else.
        </Text>
        <Button onPress={onPropose} size="md" variant="outline">
          Propose a meetup
        </Button>
      </Panel>
    ) : null;
  }

  const isProposed = meetup.status === MEETUP_STATUSES.PROPOSED;

  return (
    <Panel
      subtitle={isProposed ? "Waiting for a reply" : "Confirmed"}
      title={meetup.placeName}
    >
      <View className="gap-1">
        <Text variant="bodyMd">{formatWhen(meetup.scheduledAt)}</Text>
        <Text tone="muted-foreground" variant="caption">
          {meetup.areaLabel}
        </Text>
        {meetup.note ? (
          <Text tone="muted-foreground" variant="bodySm">
            {meetup.note}
          </Text>
        ) : null}
      </View>

      <Text tone="muted-foreground" variant="caption">
        Meet in public. Never share your home address.
      </Text>

      {canAcceptMeetup ? (
        <Button disabled={isPending} onPress={onAccept} size="md">
          {isPending ? "Confirming…" : "Accept this meetup"}
        </Button>
      ) : null}

      {canCheckIn ? (
        <Button disabled={isPending} onPress={onCheckIn} size="md">
          {isPending ? "Checking in…" : "Check in when you arrive"}
        </Button>
      ) : null}

      {canProposeMeetup ? (
        <Button onPress={onPropose} size="sm" variant="ghost">
          Suggest another place
        </Button>
      ) : null}
    </Panel>
  );
}
