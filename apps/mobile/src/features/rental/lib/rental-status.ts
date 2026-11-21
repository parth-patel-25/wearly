import { formatDate } from "@shared/lib/format-date";
import type { RentalSummary } from "@wearly/shared/api/types";
import type { RentalStatus } from "@wearly/shared/enums";
import { RENTAL_STATUSES } from "@wearly/shared/enums";

/**
 * One honest sentence per state.
 *
 * The status is read from the server; this module only turns it into copy that
 * answers "what is happening, and who acts next". It never derives a transition
 * or adds an action the API did not grant.
 */

export type RentalGroup = "upcoming" | "active" | "past";

export interface StatusLine {
  /** One line of context under the piece name. */
  detail: string;
  /** Short label for the pill. */
  label: string;
}

export function rentalStatusLine(rental: RentalSummary): StatusLine {
  switch (rental.status) {
    case RENTAL_STATUSES.REQUESTED:
      return rental.role === "lender"
        ? { detail: "Accept or decline within 48 hours.", label: "New request" }
        : { detail: "The lender has 48 hours to respond.", label: "Waiting" };
    case RENTAL_STATUSES.ACCEPTED:
      return {
        detail: "Agree on a public place and a time.",
        label: "Accepted",
      };
    case RENTAL_STATUSES.MEETUP_PENDING:
      return {
        detail: "One of you proposed a meetup.",
        label: "Meetup proposed",
      };
    case RENTAL_STATUSES.MEETUP_SCHEDULED:
      return {
        detail: rental.meetup
          ? `${rental.meetup.placeName} · ${formatDate(rental.meetup.scheduledAt)}`
          : "A public place is confirmed.",
        label: "Meetup set",
      };
    case RENTAL_STATUSES.AT_MEETUP:
      return {
        detail: "Inspect the piece together.",
        label: "At the meetup",
      };
    case RENTAL_STATUSES.HANDOVER_PENDING:
      return rental.role === "renter"
        ? { detail: "Confirm you have the piece.", label: "Handover" }
        : { detail: "Waiting for the renter to confirm.", label: "Handover" };
    case RENTAL_STATUSES.ACTIVE:
      return {
        detail: rental.returnDueAt
          ? `Return by ${formatDate(rental.returnDueAt)}.`
          : "The rental is active.",
        label: "Active",
      };
    case RENTAL_STATUSES.RETURN_PENDING:
      return {
        detail:
          rental.role === "renter"
            ? "Hand it back, then mark it returned."
            : "Waiting for the renter to return it.",
        label: "Return due",
      };
    case RENTAL_STATUSES.RETURNED:
      return rental.role === "lender"
        ? { detail: "Confirm you have it back.", label: "Returned" }
        : { detail: "Waiting for the lender to confirm.", label: "Returned" };
    case RENTAL_STATUSES.DISPUTED:
      return {
        detail: "Support will review what happened.",
        label: "Disputed",
      };
    case RENTAL_STATUSES.COMPLETED:
      return { detail: "The rental is complete.", label: "Completed" };
    case RENTAL_STATUSES.CANCELLED:
      return { detail: "This rental was cancelled.", label: "Cancelled" };
    case RENTAL_STATUSES.DECLINED:
      return { detail: "The lender declined this request.", label: "Declined" };
    case RENTAL_STATUSES.EXPIRED:
      return {
        detail: "The lender did not respond in time.",
        label: "Expired",
      };
    case RENTAL_STATUSES.NO_SHOW:
      return { detail: "A no-show was reported.", label: "No-show" };
    case RENTAL_STATUSES.PAYMENT_FAILED:
      return {
        detail: "Payment did not complete. The rental has not started.",
        label: "Payment failed",
      };
    default:
      return { detail: "", label: "Rental" };
  }
}

const UPCOMING: readonly RentalStatus[] = [
  RENTAL_STATUSES.REQUESTED,
  RENTAL_STATUSES.ACCEPTED,
  RENTAL_STATUSES.MEETUP_PENDING,
  RENTAL_STATUSES.MEETUP_SCHEDULED,
];

const PAST: readonly RentalStatus[] = [
  RENTAL_STATUSES.COMPLETED,
  RENTAL_STATUSES.CANCELLED,
  RENTAL_STATUSES.DECLINED,
  RENTAL_STATUSES.EXPIRED,
  RENTAL_STATUSES.NO_SHOW,
  RENTAL_STATUSES.PAYMENT_FAILED,
];

export function rentalGroup(status: RentalStatus): RentalGroup {
  if (UPCOMING.includes(status)) {
    return "upcoming";
  }
  if (PAST.includes(status)) {
    return "past";
  }
  return "active";
}

export const GROUP_LABEL: Record<RentalGroup, string> = {
  active: "Active",
  past: "Past",
  upcoming: "Upcoming",
};

export const GROUP_ORDER: readonly RentalGroup[] = [
  "upcoming",
  "active",
  "past",
];

export function groupRentals(
  rentals: readonly RentalSummary[]
): Record<RentalGroup, RentalSummary[]> {
  const groups: Record<RentalGroup, RentalSummary[]> = {
    active: [],
    past: [],
    upcoming: [],
  };
  for (const rental of rentals) {
    groups[rentalGroup(rental.status)].push(rental);
  }
  return groups;
}
