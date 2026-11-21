import type { PaymentProvider, PaymentResult } from "./payment-provider.js";

/**
 * Placeholder payment provider.
 *
 * No SDK, no network call, no money. Every method returns the same honest
 * result: nothing was authorized, captured, voided, refunded or paid out.
 * `reference` and `provider` stay null so a rental response can never be
 * mistaken for a real charge.
 *
 * This is deliberate product scaffolding, not a stub that silently pretends to
 * work: the mobile copy reads `mode === "placeholder"` and tells the renter that
 * payment protection is not connected.
 */
const NOTHING_HAPPENED = {
  mode: "placeholder",
  occurredAt: null,
  provider: null,
  reference: null,
  status: "placeholder",
} as const satisfies PaymentResult;

export class PlaceholderPaymentProvider implements PaymentProvider {
  readonly mode = "placeholder" as const;

  authorize(): Promise<PaymentResult> {
    return Promise.resolve(NOTHING_HAPPENED);
  }

  capture(): Promise<PaymentResult> {
    return Promise.resolve(NOTHING_HAPPENED);
  }

  void(): Promise<PaymentResult> {
    return Promise.resolve(NOTHING_HAPPENED);
  }

  refund(): Promise<PaymentResult> {
    return Promise.resolve(NOTHING_HAPPENED);
  }

  payout(): Promise<PaymentResult> {
    return Promise.resolve(NOTHING_HAPPENED);
  }
}
