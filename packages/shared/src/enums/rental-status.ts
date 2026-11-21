/**
 * Rental lifecycle.
 *
 * The happy path and the exception states are separate lists on purpose: a
 * terminal state is not a step in the journey, and code that needs "the next
 * thing that can happen" should never accidentally treat `DISPUTED` as one.
 */
export const RENTAL_STATUSES = {
  ACCEPTED: "accepted",
  ACTIVE: "active",
  AT_MEETUP: "at_meetup",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  DECLINED: "declined",
  DISPUTED: "disputed",
  EXPIRED: "expired",
  HANDOVER_PENDING: "handover_pending",
  MEETUP_PENDING: "meetup_pending",
  MEETUP_SCHEDULED: "meetup_scheduled",
  NO_SHOW: "no_show",
  PAYMENT_FAILED: "payment_failed",
  REQUESTED: "requested",
  RETURN_PENDING: "return_pending",
  RETURNED: "returned",
} as const;

export const RENTAL_STATUS_VALUES = Object.values(RENTAL_STATUSES) as [
  (typeof RENTAL_STATUSES)[keyof typeof RENTAL_STATUSES],
  ...(typeof RENTAL_STATUSES)[keyof typeof RENTAL_STATUSES][],
];

export type RentalStatus = (typeof RENTAL_STATUS_VALUES)[number];

/** States where the rental has not started and can still be cancelled. */
export const PRE_ACTIVATION_RENTAL_STATUSES = [
  RENTAL_STATUSES.REQUESTED,
  RENTAL_STATUSES.ACCEPTED,
  RENTAL_STATUSES.MEETUP_PENDING,
  RENTAL_STATUSES.MEETUP_SCHEDULED,
  RENTAL_STATUSES.AT_MEETUP,
] as const;
export type PreActivationRentalStatus =
  (typeof PRE_ACTIVATION_RENTAL_STATUSES)[number];

/** States that no longer change without an explicit retry or resolution. */
export const TERMINAL_RENTAL_STATUSES = [
  RENTAL_STATUSES.COMPLETED,
  RENTAL_STATUSES.DECLINED,
  RENTAL_STATUSES.CANCELLED,
  RENTAL_STATUSES.EXPIRED,
  RENTAL_STATUSES.NO_SHOW,
  RENTAL_STATUSES.PAYMENT_FAILED,
] as const;
export type TerminalRentalStatus = (typeof TERMINAL_RENTAL_STATUSES)[number];
