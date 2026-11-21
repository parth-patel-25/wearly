import { ConflictException } from "@nestjs/common";
import { db } from "@wearly/db/client";
import { rentals } from "@wearly/db/schema/rentals";
import { RENTAL_STATUSES } from "@wearly/shared/enums";
import { addDaysToIsoDay } from "@wearly/shared/rentals/pricing";
import { and, eq, gte, inArray, lte, ne } from "drizzle-orm";

/**
 * Dates are held by every non-terminal rental except the states where the piece
 * is definitively not with the renter. A completed rental still blocks its own
 * past window, which is harmless; an active or disputed one must block a
 * double-booking.
 */
const BLOCKING_STATUSES = [
  RENTAL_STATUSES.REQUESTED,
  RENTAL_STATUSES.ACCEPTED,
  RENTAL_STATUSES.MEETUP_PENDING,
  RENTAL_STATUSES.MEETUP_SCHEDULED,
  RENTAL_STATUSES.AT_MEETUP,
  RENTAL_STATUSES.HANDOVER_PENDING,
  RENTAL_STATUSES.ACTIVE,
  RENTAL_STATUSES.RETURN_PENDING,
  RENTAL_STATUSES.RETURNED,
  RENTAL_STATUSES.DISPUTED,
] as const;

const MAX_WINDOW_DAYS = 120;

function blockedDayIn(
  blockedDays: string[] | null,
  startDate: string,
  endDate: string
): string | null {
  if (!blockedDays?.length) {
    return null;
  }
  const blocked = new Set(blockedDays);
  let day = startDate;
  for (let index = 0; index < MAX_WINDOW_DAYS; index += 1) {
    if (blocked.has(day)) {
      return day;
    }
    if (day >= endDate) {
      return null;
    }
    day = addDaysToIsoDay(day, 1);
  }
  return null;
}

/**
 * Re-checks the two things that can change between request and acceptance: the
 * lender's blocked days and another renter's overlapping request.
 *
 * Throws `409` so the lender's app can refetch instead of silently accepting a
 * double-booking.
 */
export async function assertDatesAvailable({
  blockedDays,
  endDate,
  excludeRentalId,
  listingId,
  startDate,
}: {
  blockedDays: string[] | null;
  endDate: string;
  excludeRentalId?: string;
  listingId: string;
  startDate: string;
}): Promise<void> {
  const blocked = blockedDayIn(blockedDays, startDate, endDate);
  if (blocked) {
    throw new ConflictException(
      `The lender has blocked ${blocked}. Choose another date.`
    );
  }

  const filters = [
    eq(rentals.listingId, listingId),
    inArray(rentals.status, [...BLOCKING_STATUSES]),
    lte(rentals.startDate, endDate),
    gte(rentals.endDate, startDate),
  ];

  if (excludeRentalId) {
    filters.push(ne(rentals.id, excludeRentalId));
  }

  const [overlap] = await db
    .select({ id: rentals.id })
    .from(rentals)
    .where(and(...filters))
    .limit(1);

  if (overlap) {
    throw new ConflictException(
      "Those days are no longer available. Choose another date."
    );
  }
}
