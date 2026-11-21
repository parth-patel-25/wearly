import { Injectable, NotFoundException } from "@nestjs/common";
import { db } from "@wearly/db/client";
import { user } from "@wearly/db/schema/auth";
import { disputes } from "@wearly/db/schema/disputes";
import { listings } from "@wearly/db/schema/listings";
import { meetupProposals } from "@wearly/db/schema/meetups";
import { rentalEvents } from "@wearly/db/schema/rentals";
import type { RentalDetail } from "@wearly/shared/api/types";
import { type DisputeStatus, MEETUP_STATUSES } from "@wearly/shared/enums";
import { capabilitiesForRental } from "@wearly/shared/rentals/capabilities";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { toListing } from "../listings/listing-mapper.js";
import { loadRentalForParticipant } from "./rental-access.js";
import { RentalMaintenanceService } from "./rental-maintenance.js";
import {
  counterpartyFrom,
  counterpartyIdFor,
  toMeetup,
  toRentalSummary,
} from "./rental-mappers.js";

/** The rental detail screen: summary, capabilities, timeline and dispute. */
@Injectable()
export class RentalReadService {
  constructor(private readonly maintenance: RentalMaintenanceService) {}

  async detail(id: string, userId: string): Promise<RentalDetail> {
    await this.maintenance.run();

    const { rental, role } = await loadRentalForParticipant(id, userId);
    const counterpartyId = counterpartyIdFor(rental, role);

    const [listingRow, counterpartyRow, meetupRow, eventRows, disputeRow] =
      await Promise.all([
        db
          .select()
          .from(listings)
          .where(eq(listings.id, rental.listingId))
          .limit(1),
        db.select().from(user).where(eq(user.id, counterpartyId)).limit(1),
        db
          .select()
          .from(meetupProposals)
          .where(
            and(
              eq(meetupProposals.rentalId, id),
              inArray(meetupProposals.status, [
                MEETUP_STATUSES.PROPOSED,
                MEETUP_STATUSES.CONFIRMED,
              ])
            )
          )
          .orderBy(desc(meetupProposals.createdAt))
          .limit(1),
        db
          .select()
          .from(rentalEvents)
          .where(eq(rentalEvents.rentalId, id))
          .orderBy(asc(rentalEvents.createdAt)),
        db
          .select()
          .from(disputes)
          .where(eq(disputes.rentalId, id))
          .orderBy(desc(disputes.openedAt))
          .limit(1),
      ]);

    const [listing] = listingRow;
    if (!listing) {
      throw new NotFoundException("Listing not found");
    }

    const summary = toRentalSummary({
      counterparty: counterpartyFrom(counterpartyRow[0], counterpartyId),
      listing: toListing(listing),
      meetup: meetupRow[0] ? toMeetup(meetupRow[0]) : null,
      role,
      row: rental,
    });

    const [dispute] = disputeRow;

    return {
      ...summary,
      cancellation: rental.cancelledAt
        ? {
            by: (rental.cancelledBy ?? "system") as
              | "renter"
              | "lender"
              | "system",
            cancelledAt: rental.cancelledAt.toISOString(),
            reason: rental.cancelReason,
          }
        : null,
      capabilities: capabilitiesForRental(summary.status, role),
      dispute: dispute
        ? {
            category: dispute.category,
            createdAt: dispute.openedAt.toISOString(),
            details: dispute.details,
            id: dispute.id,
            openedById: dispute.openedById,
            resolutionNotes: dispute.resolutionNotes,
            resolvedAt: dispute.resolvedAt?.toISOString() ?? null,
            status: dispute.status as DisputeStatus,
          }
        : null,
      handoverAcknowledgedAt:
        rental.handoverAcknowledgedAt?.toISOString() ?? null,
      timeline: eventRows.map((event) => ({
        actorId: event.actorId,
        createdAt: event.createdAt.toISOString(),
        fromStatus: event.fromStatus as RentalDetail["status"] | null,
        id: event.id,
        metadata: event.metadata ?? undefined,
        toStatus: event.toStatus as RentalDetail["status"] | null,
        type: event.type,
      })),
    };
  }
}
