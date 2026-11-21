import { Injectable } from "@nestjs/common";
import { db } from "@wearly/db/client";
import { disputes } from "@wearly/db/schema/disputes";
import type { DisputeInput, RentalDetail } from "@wearly/shared/api/types";
import { RENTAL_ACTIONS } from "@wearly/shared/enums";
import { loadRentalForParticipant } from "./rental-access.js";
import {
  applyRentalTransition,
  requireTransition,
} from "./rental-persistence.js";
import { RentalReadService } from "./rental-read.service.js";

/** Return, completion and the dispute entry point after activation. */
@Injectable()
export class RentalReturnService {
  constructor(private readonly read: RentalReadService) {}

  async markReturned(id: string, userId: string): Promise<RentalDetail> {
    const loaded = await loadRentalForParticipant(id, userId);
    const transition = requireTransition(loaded, RENTAL_ACTIONS.MARK_RETURNED);

    await db.transaction(async (tx) => {
      await applyRentalTransition(tx, loaded, transition, userId, {
        returnedAt: new Date(),
      });
    });

    return this.read.detail(id, userId);
  }

  async confirmReturn(id: string, userId: string): Promise<RentalDetail> {
    const loaded = await loadRentalForParticipant(id, userId);
    const transition = requireTransition(loaded, RENTAL_ACTIONS.CONFIRM_RETURN);

    await db.transaction(async (tx) => {
      await applyRentalTransition(tx, loaded, transition, userId, {
        completedAt: new Date(),
      });
    });

    return this.read.detail(id, userId);
  }

  async openDispute(
    id: string,
    userId: string,
    input: DisputeInput
  ): Promise<RentalDetail> {
    const loaded = await loadRentalForParticipant(id, userId);
    const transition = requireTransition(loaded, RENTAL_ACTIONS.OPEN_DISPUTE);

    await db.transaction(async (tx) => {
      await tx.insert(disputes).values({
        category: input.category,
        details: input.details,
        openedById: userId,
        rentalId: id,
      });
      await applyRentalTransition(
        tx,
        loaded,
        transition,
        userId,
        {},
        { category: input.category }
      );
    });

    return this.read.detail(id, userId);
  }
}
