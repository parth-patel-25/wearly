import { Injectable } from "@nestjs/common";
import { db } from "@wearly/db/client";
import { rentalEvents, rentals } from "@wearly/db/schema/rentals";
import { RENTAL_ACTIONS, RENTAL_STATUSES } from "@wearly/shared/enums";
import { and, eq, lt, lte } from "drizzle-orm";
import { RentalPaymentService } from "./rental-payments.service.js";

/**
 * Lazy lifecycle maintenance.
 *
 * This phase has no scheduler, so the two time-based transitions run when a
 * rental list or detail is read. They are idempotent and status-guarded, so a
 * worker can replace them later without changing behaviour.
 */
@Injectable()
export class RentalMaintenanceService {
  constructor(private readonly payments: RentalPaymentService) {}

  async run(): Promise<void> {
    await Promise.all([this.expireStaleRequests(), this.flagDueReturns()]);
  }

  /** Expiry also releases a real authorization; the placeholder is a no-op. */
  private async expireStaleRequests(): Promise<void> {
    const stale = await db
      .select()
      .from(rentals)
      .where(
        and(
          eq(rentals.status, RENTAL_STATUSES.REQUESTED),
          lt(rentals.respondByAt, new Date())
        )
      )
      .limit(50);

    await Promise.all(
      stale.map(async (row) => {
        const paymentPatch = await this.payments.void(row);
        await db.transaction(async (tx) => {
          const [updated] = await tx
            .update(rentals)
            .set({
              ...paymentPatch,
              status: RENTAL_STATUSES.EXPIRED,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(rentals.id, row.id),
                eq(rentals.status, RENTAL_STATUSES.REQUESTED)
              )
            )
            .returning();

          if (!updated) {
            return;
          }

          await tx.insert(rentalEvents).values({
            fromStatus: RENTAL_STATUSES.REQUESTED,
            metadata: { reason: "lender did not respond in time" },
            rentalId: row.id,
            toStatus: RENTAL_STATUSES.EXPIRED,
            type: RENTAL_ACTIONS.EXPIRE,
          });
        });
      })
    );
  }

  private async flagDueReturns(): Promise<void> {
    const due = await db
      .update(rentals)
      .set({ status: RENTAL_STATUSES.RETURN_PENDING, updatedAt: new Date() })
      .where(
        and(
          eq(rentals.status, RENTAL_STATUSES.ACTIVE),
          lte(rentals.returnDueAt, new Date())
        )
      )
      .returning({ id: rentals.id });

    if (due.length === 0) {
      return;
    }

    await db.insert(rentalEvents).values(
      due.map(({ id }) => ({
        fromStatus: RENTAL_STATUSES.ACTIVE,
        metadata: { reason: "return date reached" },
        rentalId: id,
        toStatus: RENTAL_STATUSES.RETURN_PENDING,
        type: RENTAL_ACTIONS.RETURN_DUE,
      }))
    );
  }
}
