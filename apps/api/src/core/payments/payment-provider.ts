import type { PaymentMode, PaymentStatus } from "@wearly/shared/enums";

/**
 * Payment provider boundary.
 *
 * The rental state machine never talks to a payment SDK directly. It calls this
 * interface, so connecting Razorpay/Stripe is a new implementation file plus a
 * module binding — no rental transition changes.
 *
 * Implementations must be idempotent per rental action: the rental id is the
 * idempotency key. A timeout followed by a retry must not charge twice.
 */

export interface PaymentAmount {
  amountRupees: number;
  currency: string;
  rentalId: string;
}

export interface PaymentResult {
  mode: PaymentMode;
  /** Null when nothing was actually authorized/captured. */
  occurredAt: Date | null;
  /** Null when no provider is connected. */
  provider: string | null;
  /** Null in placeholder mode, or when the provider returns no reference. */
  reference: string | null;
  status: PaymentStatus;
}

export interface PaymentProvider {
  /** Hold the amount. Called when the rent request is created. */
  authorize: (input: PaymentAmount) => Promise<PaymentResult>;

  /** Take the held amount. Called after the renter confirms handover. */
  capture: (input: PaymentAmount) => Promise<PaymentResult>;
  readonly mode: PaymentMode;

  /** Pay the lender. Not wired to a workflow in this phase. */
  payout: (input: PaymentAmount) => Promise<PaymentResult>;

  /** Return captured money. Not wired to a workflow in this phase. */
  refund: (input: PaymentAmount) => Promise<PaymentResult>;

  /** Release a hold. Called on decline, expiry or pre-meetup cancellation. */
  void: (input: PaymentAmount) => Promise<PaymentResult>;
}

/** DI token so the module can swap placeholder for a real provider. */
export const PAYMENT_PROVIDER = Symbol("PAYMENT_PROVIDER");
