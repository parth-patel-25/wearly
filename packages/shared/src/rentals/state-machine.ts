import type { RentalAction, RentalActorRole } from "../enums/rental-actions.js";
import {
  type RentalStatus,
  TERMINAL_RENTAL_STATUSES,
} from "../enums/rental-status.js";
import {
  RENTAL_TRANSITIONS,
  type RentalTransition,
} from "./rental-transitions.js";

/**
 * Rental state helpers.
 *
 * The API is the authority: it checks `findRentalTransition` inside the same
 * transaction that writes the status. The mobile app reads the same helpers to
 * decide which buttons exist, so a screen cannot offer an action the server
 * will reject.
 */

export function findRentalTransition(
  status: RentalStatus,
  action: RentalAction,
  actor: RentalActorRole
): RentalTransition | null {
  return (
    RENTAL_TRANSITIONS[status].find(
      (transition) =>
        transition.action === action && transition.actors.includes(actor)
    ) ?? null
  );
}

export function canPerformRentalAction(
  status: RentalStatus,
  action: RentalAction,
  actor: RentalActorRole
): boolean {
  return findRentalTransition(status, action, actor) !== null;
}

export function nextRentalStatus(
  status: RentalStatus,
  action: RentalAction,
  actor: RentalActorRole
): RentalStatus | null {
  return findRentalTransition(status, action, actor)?.to ?? null;
}

export function availableRentalActions(
  status: RentalStatus,
  actor: RentalActorRole
): RentalAction[] {
  return RENTAL_TRANSITIONS[status]
    .filter((transition) => transition.actors.includes(actor))
    .map((transition) => transition.action);
}

export function isTerminalRentalStatus(status: RentalStatus): boolean {
  return (TERMINAL_RENTAL_STATUSES as readonly RentalStatus[]).includes(status);
}

/** The signed-in user's role in this rental, or null when they are a stranger. */
export function participantRoleFor(
  userId: string,
  rental: { lenderId: string; renterId: string }
): "renter" | "lender" | null {
  if (userId === rental.renterId) {
    return "renter";
  }
  if (userId === rental.lenderId) {
    return "lender";
  }
  return null;
}
