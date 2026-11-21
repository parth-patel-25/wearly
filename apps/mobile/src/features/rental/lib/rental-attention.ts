import { formatDate } from "@shared/lib/format-date";
import type { RentalSummary } from "@wearly/shared/api/types";
import { RENTAL_STATUSES } from "@wearly/shared/enums";

/**
 * What needs a person's attention, and how urgently.
 *
 * Both Home and Activity read this one module, so the sentence a renter sees on
 * the card is the same sentence they see in the inbox, and priority never
 * drifts between the two surfaces. It only *describes* the server status — it
 * never derives a transition or an action the API did not grant.
 *
 * Priority is intentionally coarse. `HOME_MIN_PRIORITY` is the line between
 * "Home should interrupt the magazine" and "Activity can mention it": a lender
 * with a new request or a renter with a return due clears it, while a renter
 * still waiting on a lender does not.
 */

export interface RentalAttention {
  /** One line of context, in the same voice as the rental card. */
  detail: string;
  /** A short statement of what is happening. */
  label: string;
  priority: number;
  rental: RentalSummary;
}

/** Below this, an item belongs in Activity but must not interrupt Home. */
export const HOME_MIN_PRIORITY = 55;

const MS_PER_DAY = 86_400_000;

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
}

/** Whole calendar days from today until `iso`. Infinity when unparseable. */
function daysUntil(iso: string, now = new Date()): number {
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.round((startOfDay(target) - startOfDay(now)) / MS_PER_DAY);
}

function attention(
  rental: RentalSummary,
  copy: Omit<RentalAttention, "rental">
): RentalAttention {
  return { ...copy, rental };
}

/**
 * Recency as a number, safe for both shapes this field arrives in.
 *
 * The shared schema types `updatedAt` as an ISO string, but Better Auth's
 * `$fetch` JSON parser revives every ISO datetime into a `Date` on the client.
 * A `Date` has no `localeCompare`, so comparing the raw values throws
 * `undefined is not a function` on Hermes. Normalise to a timestamp instead.
 */
function recency(value: string | Date): number {
  const time = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

export function attentionFor(rental: RentalSummary): RentalAttention | null {
  switch (rental.status) {
    case RENTAL_STATUSES.REQUESTED:
      return rental.role === "lender"
        ? attention(rental, {
            detail: "Accept or decline within 48 hours.",
            label: "New rental request",
            priority: 100,
          })
        : null;

    case RENTAL_STATUSES.ACCEPTED:
      return attention(rental, {
        detail: "Agree on a public place and a time.",
        label: "Agree on a meetup",
        priority: 55,
      });

    case RENTAL_STATUSES.MEETUP_PENDING:
      return attention(rental, {
        detail: "One of you proposed a meetup.",
        label: "Meetup proposed",
        priority: 70,
      });

    case RENTAL_STATUSES.MEETUP_SCHEDULED:
      return attention(rental, {
        detail: "A public place is confirmed.",
        label: "Meetup scheduled",
        priority: 60,
      });

    case RENTAL_STATUSES.AT_MEETUP:
      return attention(rental, {
        detail: "Inspect the piece together.",
        label: "Meetup in progress",
        priority: 65,
      });

    case RENTAL_STATUSES.HANDOVER_PENDING:
      return rental.role === "renter"
        ? attention(rental, {
            detail: "Confirm you have the piece.",
            label: "Confirm the handover",
            priority: 80,
          })
        : attention(rental, {
            detail: "Waiting for the renter to confirm.",
            label: "Handover",
            priority: 45,
          });

    case RENTAL_STATUSES.ACTIVE:
      return activeAttention(rental);

    case RENTAL_STATUSES.RETURN_PENDING:
      return attention(rental, {
        detail:
          rental.role === "renter"
            ? "Hand it back, then mark it returned."
            : "Waiting for the renter to return it.",
        label: "Return due",
        priority: rental.role === "renter" ? 95 : 50,
      });

    case RENTAL_STATUSES.RETURNED:
      return rental.role === "lender"
        ? attention(rental, {
            detail: "Confirm you have the piece back.",
            label: "Confirm the return",
            priority: 88,
          })
        : attention(rental, {
            detail: "Waiting for the lender to confirm.",
            label: "Returned",
            priority: 45,
          });

    case RENTAL_STATUSES.PAYMENT_FAILED:
      return attention(rental, {
        detail: "Payment did not complete. The rental has not started.",
        label: "Payment failed",
        priority: 85,
      });

    default:
      return null;
  }
}

/**
 * An active rental keeps a place on Home, because it is the one state where
 * the piece is physically with someone and the due date is the next real
 * deadline. The copy tightens as that date approaches.
 */
function activeAttention(rental: RentalSummary): RentalAttention {
  if (!rental.returnDueAt) {
    return attention(rental, {
      detail: "The rental is active.",
      label: "Rental active",
      priority: 56,
    });
  }

  const days = daysUntil(rental.returnDueAt);
  const due = `Return by ${formatDate(rental.returnDueAt)}.`;

  if (days <= 0) {
    return attention(rental, {
      detail: due,
      label: "Return is due",
      priority: 90,
    });
  }
  if (days <= 3) {
    return attention(rental, {
      detail: due,
      label: days === 1 ? "Return due tomorrow" : "Return due soon",
      priority: 90,
    });
  }
  return attention(rental, {
    detail: due,
    label: "Rental active",
    priority: 56,
  });
}

/**
 * Every rental that needs a decision or a deadline, most urgent first. Terminal
 * and waiting-on-the-other-side states are filtered out by `attentionFor`.
 */
export function selectAttention(
  rentals: readonly RentalSummary[]
): RentalAttention[] {
  return rentals
    .flatMap((rental) => {
      const item = attentionFor(rental);
      return item ? [item] : [];
    })
    .sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return recency(b.rental.updatedAt) - recency(a.rental.updatedAt);
    });
}
