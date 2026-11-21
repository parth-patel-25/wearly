import { ConflictException, Inject, Injectable } from "@nestjs/common";
import type { rentals } from "@wearly/db/schema/rentals";
import { PAYMENT_STATUSES } from "@wearly/shared/enums";
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
} from "../../core/payments/payment-provider.js";

type RentalRow = typeof rentals.$inferSelect;
type RentalPatch = Partial<typeof rentals.$inferInsert>;

/**
 * Wraps provider calls and turns them into rental-column patches.
 *
 * Keeping this in one place is what makes "payment is separate from rental
 * status" true in practice: every transition asks this service what changed,
 * and a placeholder provider answers "nothing".
 */
@Injectable()
export class RentalPaymentService {
  constructor(
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider
  ) {}

  async capture(row: RentalRow): Promise<RentalPatch> {
    const result = await this.provider.capture({
      amountRupees: row.totalRupees,
      currency: row.currency,
      rentalId: row.id,
    });

    if (result.status === PAYMENT_STATUSES.FAILED) {
      throw new ConflictException(
        "Payment could not be completed. The rental has not started."
      );
    }
    if (result.status !== PAYMENT_STATUSES.CAPTURED) {
      return {};
    }

    return {
      capturedAt: result.occurredAt,
      paymentProvider: result.provider,
      paymentReference: result.reference,
      paymentStatus: PAYMENT_STATUSES.CAPTURED,
    };
  }

  async void(row: RentalRow): Promise<RentalPatch> {
    if (
      row.paymentStatus !== PAYMENT_STATUSES.AUTHORIZED &&
      row.paymentStatus !== PAYMENT_STATUSES.CAPTURE_PENDING
    ) {
      return {};
    }

    const result = await this.provider.void({
      amountRupees: row.totalRupees,
      currency: row.currency,
      rentalId: row.id,
    });

    if (result.status !== PAYMENT_STATUSES.VOIDED) {
      return {};
    }

    return {
      paymentStatus: PAYMENT_STATUSES.VOIDED,
      voidedAt: result.occurredAt,
    };
  }

  async retryAuthorization(row: RentalRow): Promise<RentalPatch> {
    const result = await this.provider.authorize({
      amountRupees: row.totalRupees,
      currency: row.currency,
      rentalId: row.id,
    });

    if (result.status === PAYMENT_STATUSES.FAILED) {
      return { paymentStatus: PAYMENT_STATUSES.FAILED };
    }

    return {
      authorizedAt: result.occurredAt,
      paymentProvider: result.provider,
      paymentReference: result.reference,
      paymentStatus: result.status,
    };
  }
}
