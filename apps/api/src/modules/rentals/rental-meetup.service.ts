import { randomUUID } from "node:crypto";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { db } from "@wearly/db/client";
import { meetupProposals } from "@wearly/db/schema/meetups";
import type {
  MeetupProposalInput,
  RentalDetail,
} from "@wearly/shared/api/types";
import { MEETUP_STATUSES, RENTAL_ACTIONS } from "@wearly/shared/enums";
import { and, eq, inArray } from "drizzle-orm";
import { loadRentalForParticipant } from "./rental-access.js";
import {
  applyRentalTransition,
  requireTransition,
} from "./rental-persistence.js";
import { RentalReadService } from "./rental-read.service.js";

/** Meetup negotiation and arrival. Every place is a public place. */
@Injectable()
export class RentalMeetupService {
  constructor(private readonly read: RentalReadService) {}

  async propose(
    id: string,
    userId: string,
    input: MeetupProposalInput
  ): Promise<RentalDetail> {
    const loaded = await loadRentalForParticipant(id, userId);
    const transition = requireTransition(loaded, RENTAL_ACTIONS.PROPOSE_MEETUP);

    if (Date.parse(input.scheduledAt) <= Date.now()) {
      throw new BadRequestException("Choose a meetup time in the future");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(meetupProposals)
        .set({ status: MEETUP_STATUSES.SUPERSEDED })
        .where(
          and(
            eq(meetupProposals.rentalId, id),
            inArray(meetupProposals.status, [
              MEETUP_STATUSES.PROPOSED,
              MEETUP_STATUSES.CONFIRMED,
            ])
          )
        );

      const proposalId = randomUUID();

      await tx.insert(meetupProposals).values({
        areaLabel: input.areaLabel,
        id: proposalId,
        note: input.note,
        placeName: input.placeName,
        proposedById: userId,
        rentalId: id,
        scheduledAt: new Date(input.scheduledAt),
        status: MEETUP_STATUSES.PROPOSED,
      });

      await applyRentalTransition(
        tx,
        loaded,
        transition,
        userId,
        {},
        { proposalId }
      );
    });

    return this.read.detail(id, userId);
  }

  async acceptProposal(
    id: string,
    proposalId: string,
    userId: string
  ): Promise<RentalDetail> {
    const loaded = await loadRentalForParticipant(id, userId);
    const transition = requireTransition(loaded, RENTAL_ACTIONS.ACCEPT_MEETUP);

    const [proposal] = await db
      .select()
      .from(meetupProposals)
      .where(
        and(
          eq(meetupProposals.id, proposalId),
          eq(meetupProposals.rentalId, id)
        )
      )
      .limit(1);

    if (!proposal) {
      throw new NotFoundException("Meetup proposal not found");
    }
    if (proposal.status !== MEETUP_STATUSES.PROPOSED) {
      throw new BadRequestException("This proposal is no longer open");
    }
    if (proposal.proposedById === userId) {
      throw new BadRequestException(
        "The other person needs to accept your proposal"
      );
    }

    await db.transaction(async (tx) => {
      const [confirmed] = await tx
        .update(meetupProposals)
        .set({ respondedAt: new Date(), status: MEETUP_STATUSES.CONFIRMED })
        .where(
          and(
            eq(meetupProposals.id, proposalId),
            eq(meetupProposals.status, MEETUP_STATUSES.PROPOSED)
          )
        )
        .returning();

      if (!confirmed) {
        throw new BadRequestException("This proposal is no longer open");
      }

      await applyRentalTransition(
        tx,
        loaded,
        transition,
        userId,
        {},
        { proposalId }
      );
    });

    return this.read.detail(id, userId);
  }

  async checkIn(id: string, userId: string): Promise<RentalDetail> {
    const loaded = await loadRentalForParticipant(id, userId);
    const transition = requireTransition(loaded, RENTAL_ACTIONS.CHECK_IN);

    await db.transaction(async (tx) => {
      await applyRentalTransition(tx, loaded, transition, userId);
    });

    return this.read.detail(id, userId);
  }
}
