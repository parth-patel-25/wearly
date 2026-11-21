import type { RentalDetail } from "@wearly/shared/api/types";
import { Card, Panel } from "@wearly/ui-native/card";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";
import { rentalApi } from "../services/rental-api";
import { PaymentNote } from "./payment-note";
import { RentalActionBar } from "./rental-action-bar";
import { RentalHandoverPanel } from "./rental-handover-panel";
import { RentalMeetupPanel } from "./rental-meetup-panel";
import { RentalPricePanel } from "./rental-price-panel";
import { RentalReturnPanel } from "./rental-return-panel";
import type { RentalSheetName } from "./rental-sheets";
import { RentalCounterpartyCard, RentalStatusCard } from "./rental-summary";
import { RentalTimeline } from "./rental-timeline";

interface RentalOverviewProps {
  error: string | null;
  isPending: boolean;
  onOpenSheet: (sheet: RentalSheetName) => void;
  rental: RentalDetail;
  run: (action: () => Promise<RentalDetail>) => void;
}

/** Everything the rental detail scrolls through. Sheets own the inputs. */
export function RentalOverview({
  error,
  isPending,
  onOpenSheet,
  rental,
  run,
}: RentalOverviewProps) {
  return (
    <View className="gap-8 px-gutter pb-10">
      <RentalStatusCard rental={rental} />
      <RentalCounterpartyCard rental={rental} />

      <RentalMeetupPanel
        canAcceptMeetup={rental.capabilities.canAcceptMeetup}
        canCheckIn={rental.capabilities.canCheckIn}
        canProposeMeetup={rental.capabilities.canProposeMeetup}
        isPending={isPending}
        meetup={rental.meetup}
        onAccept={() =>
          rental.meetup &&
          run(() => rentalApi.acceptMeetup(rental.id, rental.meetup?.id ?? ""))
        }
        onCheckIn={() => run(() => rentalApi.checkIn(rental.id))}
        onPropose={() => onOpenSheet("meetup")}
      />

      <RentalHandoverPanel
        isPending={isPending}
        onAcknowledge={() =>
          run(() => rentalApi.acknowledgeHandover(rental.id))
        }
        onConfirmHandover={() => onOpenSheet("handover")}
        onReportIssue={() => onOpenSheet("issue")}
        onStartInspection={() =>
          run(() => rentalApi.startInspection(rental.id))
        }
        rental={rental}
      />

      <RentalReturnPanel
        isPending={isPending}
        onConfirmReturn={() => run(() => rentalApi.confirmReturn(rental.id))}
        onMarkReturned={() => run(() => rentalApi.markReturned(rental.id))}
        rental={rental}
      />

      <RentalPricePanel rental={rental} />
      <PaymentNote payment={rental.payment} />

      {rental.cancellation ? (
        <Card className="gap-1 p-4" variant="muted">
          <Text variant="headingSm">Cancelled</Text>
          <Text tone="muted-foreground" variant="bodySm">
            {rental.cancellation.reason ?? "No reason was given."}
          </Text>
        </Card>
      ) : null}

      {rental.dispute ? (
        <Card className="gap-1 p-4" variant="muted">
          <Text variant="headingSm">Problem reported</Text>
          <Text tone="muted-foreground" variant="bodySm">
            {rental.dispute.details}
          </Text>
          <Text tone="muted-foreground" variant="caption">
            {`Status: ${rental.dispute.status}. Support reviews the timeline; nothing is refunded automatically.`}
          </Text>
        </Card>
      ) : null}

      <Panel title="What happened">
        <RentalTimeline
          counterparty={rental.counterparty}
          events={rental.timeline}
        />
      </Panel>

      {error ? (
        <Text accessibilityRole="alert" tone="destructive" variant="bodySm">
          {error}
        </Text>
      ) : null}

      <RentalActionBar
        handlers={{
          accept: () => run(() => rentalApi.accept(rental.id)),
          cancel: () => onOpenSheet("cancel"),
          decline: () => onOpenSheet("decline"),
          dispute: () => onOpenSheet("dispute"),
          noShow: () => onOpenSheet("no-show"),
          retryPayment: () => run(() => rentalApi.retryPayment(rental.id)),
        }}
        isPending={isPending}
        rental={rental}
      />
    </View>
  );
}
