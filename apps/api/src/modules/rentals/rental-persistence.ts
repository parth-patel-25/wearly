import { ConflictException } from "@nestjs/common";
import { rentalEvents, rentals } from "@wearly/db/schema/rentals";
import type { RentalAction, RentalStatus } from "@wearly/shared/enums";
import type { RentalTransition } from "@wearly/shared/rentals/rental-transitions";
import { findRentalTransition } from "@wearly/shared/rentals/state-machine";
import { and, eq } from "drizzle-orm";
import type { LoadedRental, RentalRow, RentalTx } from "./rental-access.js";

type RentalPatch = Partial<typeof rentals.$inferInsert>;

/**
 * The only way a rental status changes.
 *
 * The update is status-guarded, so two concurrent taps produce one transition
 * and one `409`. The event row is written in the same transaction, which keeps
 * the timeline and the status from drifting apart.
 */
export function requireTransition(
  loaded: LoadedRental,
  action: RentalAction
): RentalTransition {
  const transition = findRentalTransition(
    loaded.rental.status as RentalStatus,
    action,
    loaded.role
  );

  if (!transition) {
    throw new ConflictException(
      "This action is no longer available. Refresh and try again."
    );
  }

  return transition;
}

export async function applyRentalTransition(
  tx: RentalTx,
  loaded: LoadedRental,
  transition: RentalTransition,
  actorId: string,
  patch: RentalPatch = {},
  metadata?: Record<string, unknown>
): Promise<RentalRow> {
  const [updated] = await tx
    .update(rentals)
    .set({
      ...patch,
      status: transition.to,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(rentals.id, loaded.rental.id),
        eq(rentals.status, loaded.rental.status)
      )
    )
    .returning();

  if (!updated) {
    throw new ConflictException(
      "This rental changed while you were acting. Refresh and try again."
    );
  }

  await tx.insert(rentalEvents).values({
    actorId,
    fromStatus: loaded.rental.status,
    metadata,
    rentalId: updated.id,
    toStatus: transition.to,
    type: transition.action,
  });

  return updated;
}
