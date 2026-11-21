import type { meetupProposals } from "@wearly/db/schema/meetups";
import type {
  Listing,
  RentalMeetup,
  RentalPayment,
  RentalSummary,
} from "@wearly/shared/api/types";
import type { RentalParticipantRole } from "@wearly/shared/enums";
import type { RentalRow } from "./rental-access.js";

export interface Counterparty {
  id: string;
  image: string | null;
  name: string;
}

/** Payment is separate from rental status; the response keeps it that way. */
export function paymentOf(row: RentalRow): RentalPayment {
  return {
    authorizedAt: row.authorizedAt?.toISOString() ?? null,
    capturedAt: row.capturedAt?.toISOString() ?? null,
    mode: row.paymentProvider ? "provider" : "placeholder",
    provider: row.paymentProvider,
    refundedAt: row.refundedAt?.toISOString() ?? null,
    status: row.paymentStatus as RentalPayment["status"],
    voidedAt: row.voidedAt?.toISOString() ?? null,
  };
}

export function toMeetup(
  row: typeof meetupProposals.$inferSelect
): RentalMeetup {
  return {
    areaLabel: row.areaLabel,
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    note: row.note,
    placeName: row.placeName,
    proposedById: row.proposedById,
    respondedAt: row.respondedAt?.toISOString() ?? null,
    scheduledAt: row.scheduledAt.toISOString(),
    status: row.status as RentalMeetup["status"],
  };
}

/**
 * The shared list/detail shape. Coordinates are already removed from `listing`
 * by the listing mapper; this function never sees a private address.
 */
export function toRentalSummary({
  counterparty,
  listing,
  meetup,
  role,
  row,
}: {
  counterparty: Counterparty;
  listing: Listing;
  meetup: RentalMeetup | null;
  role: RentalParticipantRole;
  row: RentalRow;
}): RentalSummary {
  return {
    acceptedAt: row.acceptedAt?.toISOString() ?? null,
    activatedAt: row.activatedAt?.toISOString() ?? null,
    counterparty,
    createdAt: row.createdAt.toISOString(),
    currency: row.currency,
    days: row.days,
    endDate: row.endDate,
    id: row.id,
    listing,
    meetup,
    payment: paymentOf(row),
    requestedAt: row.requestedAt.toISOString(),
    returnDueAt: row.returnDueAt?.toISOString() ?? null,
    role,
    startDate: row.startDate,
    status: row.status as RentalSummary["status"],
    totalRupees: row.totalRupees,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function counterpartyIdFor(
  row: RentalRow,
  role: RentalParticipantRole
): string {
  return role === "renter" ? row.lenderId : row.renterId;
}

/** Missing users (deleted accounts) fall back to neutral copy. */
export function counterpartyFrom(
  row: { image: string | null; name: string } | undefined,
  id: string
): Counterparty {
  return {
    id,
    image: row?.image ?? null,
    name: row?.name ?? "Wearly member",
  };
}
