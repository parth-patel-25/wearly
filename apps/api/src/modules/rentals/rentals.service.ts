import { randomUUID } from "node:crypto";
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { db } from "@wearly/db/client";
import { listings } from "@wearly/db/schema/listings";
import { rentalEvents, rentals } from "@wearly/db/schema/rentals";
import type { CreateRentalInput, RentalDetail } from "@wearly/shared/api/types";
import { RENTAL_ACTIONS, RENTAL_STATUSES } from "@wearly/shared/enums";
import { quoteRental } from "@wearly/shared/rentals/pricing";
import { eq } from "drizzle-orm";
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
} from "../../core/payments/payment-provider.js";
import { assertDatesAvailable } from "./rental-availability.js";
import { RentalReadService } from "./rental-read.service.js";

const RESPONSE_WINDOW_MS = 48 * 60 * 60 * 1000;

@Injectable()
export class RentalsService {
  constructor(
    @Inject(PAYMENT_PROVIDER) private readonly payments: PaymentProvider,
    private readonly read: RentalReadService
  ) {}

  /**
   * Creates the request and its snapshot in one transaction.
   *
   * Payment authorization is separate: the provider call runs before the write
   * so a failure can stop the request, and its result is stored on its own
   * columns. With the placeholder provider the status stays `placeholder` and
   * no money moves.
   */
  async create(
    renterId: string,
    input: CreateRentalInput
  ): Promise<RentalDetail> {
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, input.listingId))
      .limit(1);

    if (!listing) {
      throw new NotFoundException("Listing not found");
    }
    if (listing.status !== "published") {
      throw new BadRequestException("This piece is not available to rent");
    }
    if (listing.lenderId === renterId) {
      throw new BadRequestException("You cannot rent your own listing");
    }
    if (input.startDate < new Date().toISOString().slice(0, 10)) {
      throw new BadRequestException("The start date cannot be in the past");
    }

    const quote = quoteRental({
      endDate: input.endDate,
      pricePerDay: listing.pricePerDay,
      startDate: input.startDate,
    });
    if (!quote) {
      throw new BadRequestException("Choose a valid rental window");
    }

    await assertDatesAvailable({
      blockedDays: listing.availability,
      endDate: input.endDate,
      listingId: listing.id,
      startDate: input.startDate,
    });

    // The rental id is the provider's idempotency key, so it must exist before
    // the authorization call.
    const rentalId = randomUUID();
    const payment = await this.payments.authorize({
      amountRupees: quote.totalRupees,
      currency: quote.currency,
      rentalId,
    });

    const respondByAt = new Date(Date.now() + RESPONSE_WINDOW_MS);

    const [rental] = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(rentals)
        .values({
          cleaningFeeRupees: quote.cleaningFeeRupees,
          currency: quote.currency,
          days: quote.days,
          endDate: input.endDate,
          fulfillmentMethod: input.fulfillmentMethod,
          id: rentalId,
          lenderId: listing.lenderId,
          listingId: listing.id,
          paymentProvider: payment.provider,
          paymentReference: payment.reference,
          paymentStatus: payment.status,
          pricePerDayRupees: quote.pricePerDayRupees,
          rentalAmountRupees: quote.rentalAmountRupees,
          renterId,
          requestedNote: input.note,
          respondByAt,
          startDate: input.startDate,
          status: RENTAL_STATUSES.REQUESTED,
          totalRupees: quote.totalRupees,
        })
        .returning();

      if (!created) {
        throw new InternalServerErrorException("Rental could not be created");
      }

      await tx.insert(rentalEvents).values({
        actorId: renterId,
        fromStatus: null,
        metadata: { days: quote.days, totalRupees: quote.totalRupees },
        rentalId: created.id,
        toStatus: RENTAL_STATUSES.REQUESTED,
        type: RENTAL_ACTIONS.REQUEST,
      });

      return [created] as const;
    });

    return this.read.detail(rental.id, renterId);
  }
}
