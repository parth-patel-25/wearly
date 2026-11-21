import { ConflictException, Injectable } from "@nestjs/common";
import { db } from "@wearly/db/client";
import { disputes } from "@wearly/db/schema/disputes";
import { meetupProposals } from "@wearly/db/schema/meetups";
import { rentalEvents, rentals } from "@wearly/db/schema/rentals";
import type {
  DisputeInput,
  NoShowInput,
  RentalDetail,
} from "@wearly/shared/api/types";
import {
  MEETUP_STATUSES,
  RENTAL_ACTIONS,
  RENTAL_STATUSES,
} from "@wearly/shared/enums";
import { and, desc, eq } from "drizzle-orm";
import { loadRentalForParticipant } from "./rental-access.js";
import { RentalPaymentService } from "./rental-payments.service.js";
import {
  applyRentalTransition,
  requireTransition,
} from "./rental-persistence.js";
import { RentalReadService } from "./rental-read.service.js";

const DAY_MS = 86_400_000;
/** A no-show can only be reported after the meetup time plus this grace. */
const NO_SHOW_GRACE_MS = 30 * 60 * 1000;

/** Inspection, handover, issues and no-shows. */
@Injectable()
export class RentalHandoverService {
  constructor(
    private readonly payments: RentalPaymentService,
    private readonly read: RentalReadService
  ) {}

  async startInspection(id: string, userId: string): Promise<RentalDetail> {
    const loaded = await loadRentalForParticipant(id, userId);
    const transition = requireTransition(
      loaded,
      RENTAL_ACTIONS.START_INSPECTION
    );

    await db.transaction(async (tx) => {
      await applyRentalTransition(tx, loaded, transition, userId);
    });

    return this.read.detail(id, userId);
  }

  /**
   * The only path to `ACTIVE`. Capture happens first; if it fails the rental
   * stays in handover and the case is escalated, never silently activated.
   */
  async confirmHandover(id: string, userId: string): Promise<RentalDetail> {
    const loaded = await loadRentalForParticipant(id, userId);
    const transition = requireTransition(
      loaded,
      RENTAL_ACTIONS.CONFIRM_HANDOVER
    );
    const paymentPatch = await this.payments.capture(loaded.rental);
    const activatedAt = new Date();

    await db.transaction(async (tx) => {
      await applyRentalTransition(
        tx,
        loaded,
        transition,
        userId,
        {
          activatedAt,
          ...paymentPatch,
          returnDueAt: new Date(
            activatedAt.getTime() + loaded.rental.days * DAY_MS
          ),
        },
        { days: loaded.rental.days }
      );
    });

    return this.read.detail(id, userId);
  }

  /** A recorded acknowledgement. Never required for activation. */
  async acknowledgeHandover(id: string, userId: string): Promise<RentalDetail> {
    const loaded = await loadRentalForParticipant(id, userId);

    if (loaded.role !== "lender") {
      throw new ConflictException("Only the lender can acknowledge handover");
    }
    if (
      loaded.rental.status !== RENTAL_STATUSES.AT_MEETUP &&
      loaded.rental.status !== RENTAL_STATUSES.HANDOVER_PENDING
    ) {
      throw new ConflictException(
        "Handover can only be acknowledged at the meetup"
      );
    }
    if (loaded.rental.handoverAcknowledgedAt) {
      return this.read.detail(id, userId);
    }

    await db.transaction(async (tx) => {
      await tx
        .update(rentals)
        .set({ handoverAcknowledgedAt: new Date(), updatedAt: new Date() })
        .where(eq(rentals.id, id));

      await tx.insert(rentalEvents).values({
        actorId: userId,
        fromStatus: loaded.rental.status,
        metadata: { acknowledged: true },
        rentalId: id,
        toStatus: loaded.rental.status,
        type: "handover_acknowledged",
      });
    });

    return this.read.detail(id, userId);
  }

  async reportIssue(
    id: string,
    userId: string,
    input: DisputeInput
  ): Promise<RentalDetail> {
    const loaded = await loadRentalForParticipant(id, userId);
    const transition = requireTransition(loaded, RENTAL_ACTIONS.REPORT_ISSUE);

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

  async reportNoShow(
    id: string,
    userId: string,
    input: NoShowInput
  ): Promise<RentalDetail> {
    const loaded = await loadRentalForParticipant(id, userId);
    const transition = requireTransition(loaded, RENTAL_ACTIONS.REPORT_NO_SHOW);

    const [confirmedMeetup] = await db
      .select()
      .from(meetupProposals)
      .where(
        and(
          eq(meetupProposals.rentalId, id),
          eq(meetupProposals.status, MEETUP_STATUSES.CONFIRMED)
        )
      )
      .orderBy(desc(meetupProposals.scheduledAt))
      .limit(1);

    if (!confirmedMeetup) {
      throw new ConflictException(
        "A confirmed meetup is required before reporting a no-show"
      );
    }
    if (confirmedMeetup.scheduledAt.getTime() + NO_SHOW_GRACE_MS > Date.now()) {
      throw new ConflictException(
        "You can report a no-show 30 minutes after the meetup time"
      );
    }

    const paymentPatch = await this.payments.void(loaded.rental);

    await db.transaction(async (tx) => {
      await applyRentalTransition(
        tx,
        loaded,
        transition,
        userId,
        {
          noShowReportedAt: new Date(),
          noShowReportedBy: userId,
          ...paymentPatch,
        },
        { note: input.note, reportedBy: loaded.role }
      );
    });

    return this.read.detail(id, userId);
  }
}
