import { ConflictException, Injectable } from "@nestjs/common";
import { db } from "@wearly/db/client";
import { listings } from "@wearly/db/schema/listings";
import type {
  DeclineRentalInput,
  RentalDetail,
  RentalReasonInput,
} from "@wearly/shared/api/types";
import { RENTAL_ACTIONS } from "@wearly/shared/enums";
import { eq } from "drizzle-orm";
import { loadRentalForParticipant } from "./rental-access.js";
import { assertDatesAvailable } from "./rental-availability.js";
import { RentalPaymentService } from "./rental-payments.service.js";
import {
  applyRentalTransition,
  requireTransition,
} from "./rental-persistence.js";
import { RentalReadService } from "./rental-read.service.js";

/** accept / decline / cancel / retry — the states before a meetup exists. */
@Injectable()
export class RentalLifecycleService {
  constructor(
    private readonly payments: RentalPaymentService,
    private readonly read: RentalReadService
  ) {}

  async accept(id: string, userId: string): Promise<RentalDetail> {
    const loaded = await loadRentalForParticipant(id, userId);
    const transition = requireTransition(loaded, RENTAL_ACTIONS.ACCEPT);

    if (loaded.rental.respondByAt.getTime() <= Date.now()) {
      throw new ConflictException("This request has expired");
    }

    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, loaded.rental.listingId))
      .limit(1);

    if (listing?.status !== "published") {
      throw new ConflictException(
        "This listing is no longer available. Decline the request instead."
      );
    }

    // Another request may have been accepted while this one waited.
    await assertDatesAvailable({
      blockedDays: listing.availability,
      endDate: loaded.rental.endDate,
      excludeRentalId: loaded.rental.id,
      listingId: loaded.rental.listingId,
      startDate: loaded.rental.startDate,
    });

    await db.transaction(async (tx) => {
      await applyRentalTransition(tx, loaded, transition, userId, {
        acceptedAt: new Date(),
      });
    });

    return this.read.detail(id, userId);
  }

  async decline(
    id: string,
    userId: string,
    input: DeclineRentalInput
  ): Promise<RentalDetail> {
    const loaded = await loadRentalForParticipant(id, userId);
    const transition = requireTransition(loaded, RENTAL_ACTIONS.DECLINE);
    const paymentPatch = await this.payments.void(loaded.rental);

    await db.transaction(async (tx) => {
      await applyRentalTransition(
        tx,
        loaded,
        transition,
        userId,
        { declinedAt: new Date(), ...paymentPatch },
        input.reason ? { reason: input.reason } : undefined
      );
    });

    return this.read.detail(id, userId);
  }

  async cancel(
    id: string,
    userId: string,
    input: RentalReasonInput
  ): Promise<RentalDetail> {
    const loaded = await loadRentalForParticipant(id, userId);
    const transition = requireTransition(loaded, RENTAL_ACTIONS.CANCEL);
    const paymentPatch = await this.payments.void(loaded.rental);

    await db.transaction(async (tx) => {
      await applyRentalTransition(
        tx,
        loaded,
        transition,
        userId,
        {
          cancelledAt: new Date(),
          cancelledBy: loaded.role,
          cancelReason: input.reason,
          ...paymentPatch,
        },
        { reason: input.reason }
      );
    });

    return this.read.detail(id, userId);
  }

  async retryPayment(id: string, userId: string): Promise<RentalDetail> {
    const loaded = await loadRentalForParticipant(id, userId);
    const transition = requireTransition(loaded, RENTAL_ACTIONS.RETRY_PAYMENT);
    const paymentPatch = await this.payments.retryAuthorization(loaded.rental);

    await db.transaction(async (tx) => {
      await applyRentalTransition(tx, loaded, transition, userId, paymentPatch);
    });

    return this.read.detail(id, userId);
  }
}
