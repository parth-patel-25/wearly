import type { RentalDetail } from "@wearly/shared/api/types";
import { rentalApi } from "../services/rental-api";
import { DisputeSheet } from "./dispute-sheet";
import { HandoverSheet } from "./handover-sheet";
import { MeetupSheet } from "./meetup-sheet";
import { ReasonSheet } from "./reason-sheet";

export type RentalSheetName =
  | "meetup"
  | "handover"
  | "cancel"
  | "decline"
  | "no-show"
  | "dispute"
  | "issue";

export type RentalSheetKind = "none" | RentalSheetName;

interface RentalSheetsProps {
  isPending: boolean;
  onClose: () => void;
  onOpenSheet: (sheet: RentalSheetName) => void;
  rental: RentalDetail;
  run: (action: () => Promise<RentalDetail>) => void;
  sheet: RentalSheetKind;
}

/**
 * The rental's input surfaces. Each sheet closes as soon as it has handed the
 * decision to the API; the detail screen shows the result (or the error).
 */
export function RentalSheets({
  isPending,
  onClose,
  onOpenSheet,
  rental,
  run,
  sheet,
}: RentalSheetsProps) {
  const submit = (action: () => Promise<RentalDetail>) => {
    onClose();
    run(action);
  };

  return (
    <>
      <MeetupSheet
        defaultArea={rental.listing.areaLabel ?? ""}
        isPending={isPending}
        onClose={onClose}
        onSubmit={(input) =>
          submit(() => rentalApi.proposeMeetup(rental.id, input))
        }
        open={sheet === "meetup"}
      />

      <HandoverSheet
        days={rental.days}
        isPending={isPending}
        onClose={onClose}
        onConfirm={() =>
          submit(() =>
            rentalApi.confirmHandover(rental.id, {
              conditionAccepted: true,
              itemReceived: true,
            })
          )
        }
        onReportIssue={() => onOpenSheet("issue")}
        open={sheet === "handover"}
      />

      <ReasonSheet
        confirmLabel="Cancel this rental"
        description="Both sides can cancel before the rental starts. Any payment hold is released."
        isPending={isPending}
        onClose={onClose}
        onSubmit={(reason) =>
          submit(() => rentalApi.cancel(rental.id, { reason }))
        }
        open={sheet === "cancel"}
        placeholder="Plans changed and we could not find a time."
        title="Cancel rental"
      />

      <ReasonSheet
        confirmLabel="Decline request"
        description="Declining closes this request. The renter sees that it was declined and the note you leave."
        isPending={isPending}
        onClose={onClose}
        onSubmit={(reason) =>
          submit(() => rentalApi.decline(rental.id, { reason }))
        }
        open={sheet === "decline"}
        placeholder="The piece is already committed for those days."
        title="Decline request"
      />

      <ReasonSheet
        confirmLabel="Report no-show"
        description="Only report this after the meetup time plus 30 minutes. Support sees the confirmed meetup."
        isPending={isPending}
        onClose={onClose}
        onSubmit={(reason) =>
          submit(() => rentalApi.reportNoShow(rental.id, { note: reason }))
        }
        open={sheet === "no-show"}
        placeholder="I waited at the agreed place for half an hour."
        title="Report a no-show"
      />

      <DisputeSheet
        confirmLabel="Report the problem"
        description="Tell us what is wrong with the piece or the handover. The rental pauses while it is reviewed."
        isPending={isPending}
        onClose={onClose}
        onSubmit={(input) =>
          submit(() => rentalApi.reportIssue(rental.id, input))
        }
        open={sheet === "issue"}
        title="Something is wrong"
      />

      <DisputeSheet
        confirmLabel="Open a dispute"
        description="Use this after the rental has started — damage, a missing return, or a piece that was not as described."
        isPending={isPending}
        onClose={onClose}
        onSubmit={(input) =>
          submit(() => rentalApi.openDispute(rental.id, input))
        }
        open={sheet === "dispute"}
        title="Open a dispute"
      />
    </>
  );
}
