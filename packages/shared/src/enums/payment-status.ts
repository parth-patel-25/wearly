/**
 * Payment state, kept separate from rental state.
 *
 * A rental can be confirmed while payment is still a placeholder. The states
 * exist now so connecting a provider does not change the rental state machine.
 */
export const PAYMENT_STATUSES = {
  AUTHORIZED: "authorized",
  AUTHORIZING: "authorizing",
  CAPTURE_PENDING: "capture_pending",
  CAPTURED: "captured",
  FAILED: "failed",
  NOT_STARTED: "not_started",
  /**
   * No provider is connected. Nothing was authorized, captured or voided — the
   * value exists so the UI can say that plainly instead of implying a hold.
   */
  PLACEHOLDER: "placeholder",
  REFUNDED: "refunded",
  VOIDED: "voided",
} as const;

export const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUSES) as [
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES],
  ...(typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES][],
];

export type PaymentStatus = (typeof PAYMENT_STATUS_VALUES)[number];

/**
 * `placeholder` means no provider is connected: no money has moved.
 * `provider` means a real authorization/capture provider is driving the state.
 */
export const PAYMENT_MODES = {
  PLACEHOLDER: "placeholder",
  PROVIDER: "provider",
} as const;

export const PAYMENT_MODE_VALUES = Object.values(PAYMENT_MODES) as [
  (typeof PAYMENT_MODES)[keyof typeof PAYMENT_MODES],
  ...(typeof PAYMENT_MODES)[keyof typeof PAYMENT_MODES][],
];

export type PaymentMode = (typeof PAYMENT_MODE_VALUES)[number];
