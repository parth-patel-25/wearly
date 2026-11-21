import { RENTAL_ACTIONS, type RentalAction } from "../enums/rental-actions.js";
import { RENTAL_STATUSES, type RentalStatus } from "../enums/rental-status.js";
import { canPerformRentalAction } from "./state-machine.js";

/**
 * Capabilities are what the API returns and the app renders.
 *
 * Exposing named decisions instead of raw status checks keeps permission logic
 * out of JSX and in one place. The server is still the security boundary; these
 * booleans only decide which controls appear.
 */
export interface RentalCapabilities {
  canAccept: boolean;
  canAcceptMeetup: boolean;
  canAcknowledgeHandover: boolean;
  canCancel: boolean;
  canCheckIn: boolean;
  canConfirmHandover: boolean;
  canConfirmReturn: boolean;
  canDecline: boolean;
  canMarkReturned: boolean;
  canOpenDispute: boolean;
  canProposeMeetup: boolean;
  canReportIssue: boolean;
  canReportNoShow: boolean;
  canRetryPayment: boolean;
  canStartInspection: boolean;
}

export function capabilitiesForRental(
  status: RentalStatus,
  role: "renter" | "lender"
): RentalCapabilities {
  const can = (action: RentalAction) =>
    canPerformRentalAction(status, action, role);

  return {
    canAccept: can(RENTAL_ACTIONS.ACCEPT),
    canAcceptMeetup: can(RENTAL_ACTIONS.ACCEPT_MEETUP),
    canAcknowledgeHandover:
      role === "lender" &&
      (status === RENTAL_STATUSES.AT_MEETUP ||
        status === RENTAL_STATUSES.HANDOVER_PENDING),
    canCancel: can(RENTAL_ACTIONS.CANCEL),
    canCheckIn: can(RENTAL_ACTIONS.CHECK_IN),
    canConfirmHandover: can(RENTAL_ACTIONS.CONFIRM_HANDOVER),
    canConfirmReturn: can(RENTAL_ACTIONS.CONFIRM_RETURN),
    canDecline: can(RENTAL_ACTIONS.DECLINE),
    canMarkReturned: can(RENTAL_ACTIONS.MARK_RETURNED),
    canOpenDispute: can(RENTAL_ACTIONS.OPEN_DISPUTE),
    canProposeMeetup: can(RENTAL_ACTIONS.PROPOSE_MEETUP),
    canReportIssue: can(RENTAL_ACTIONS.REPORT_ISSUE),
    canReportNoShow: can(RENTAL_ACTIONS.REPORT_NO_SHOW),
    canRetryPayment: can(RENTAL_ACTIONS.RETRY_PAYMENT),
    canStartInspection: can(RENTAL_ACTIONS.START_INSPECTION),
  };
}
