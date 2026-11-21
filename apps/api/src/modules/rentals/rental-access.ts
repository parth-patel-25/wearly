import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { db } from "@wearly/db/client";
import { rentals } from "@wearly/db/schema/rentals";
import type { RentalParticipantRole } from "@wearly/shared/enums";
import { participantRoleFor } from "@wearly/shared/rentals/state-machine";
import { eq } from "drizzle-orm";

export type RentalRow = typeof rentals.$inferSelect;

/** The transaction handle drizzle passes to `db.transaction`. */
export type RentalTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export interface LoadedRental {
  rental: RentalRow;
  role: RentalParticipantRole;
}

/**
 * One read path for authorization.
 *
 * A rental is private to its two participants. A stranger gets `404`, not
 * `403`, so rental ids cannot be probed for existence.
 */
export async function loadRentalForParticipant(
  rentalId: string,
  userId: string
): Promise<LoadedRental> {
  const [rental] = await db
    .select()
    .from(rentals)
    .where(eq(rentals.id, rentalId))
    .limit(1);

  if (!rental) {
    throw new NotFoundException("Rental not found");
  }

  const role = participantRoleFor(userId, {
    lenderId: rental.lenderId,
    renterId: rental.renterId,
  });

  if (!role) {
    throw new NotFoundException("Rental not found");
  }

  return { rental, role };
}

/** For service-internal checks where a missing participant is a bug. */
export function requireParticipant(role: RentalParticipantRole | null): void {
  if (!role) {
    throw new ForbiddenException("You are not part of this rental");
  }
}
