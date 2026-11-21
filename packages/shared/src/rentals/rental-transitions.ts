import {
  RENTAL_ACTIONS,
  type RentalAction,
  type RentalActorRole,
} from "../enums/rental-actions.js";
import { RENTAL_STATUSES, type RentalStatus } from "../enums/rental-status.js";

/**
 * The transition table, kept separate from the helpers so both stay readable
 * and under the repository's file-size limit.
 *
 * `MEETUP_PENDING → accept_meetup` lists both participants because the table
 * cannot know who proposed. The API rejects the proposer accepting their own
 * proposal; that is a business rule, not a state rule.
 */

export interface RentalTransition {
  action: RentalAction;
  actors: readonly RentalActorRole[];
  to: RentalStatus;
}

const EITHER = ["renter", "lender"] as const;
const RENTER = ["renter"] as const;
const LENDER = ["lender"] as const;
const SYSTEM = ["system"] as const;

export const RENTAL_TRANSITIONS: Record<
  RentalStatus,
  readonly RentalTransition[]
> = {
  [RENTAL_STATUSES.REQUESTED]: [
    {
      action: RENTAL_ACTIONS.ACCEPT,
      actors: LENDER,
      to: RENTAL_STATUSES.ACCEPTED,
    },
    {
      action: RENTAL_ACTIONS.DECLINE,
      actors: LENDER,
      to: RENTAL_STATUSES.DECLINED,
    },
    {
      action: RENTAL_ACTIONS.CANCEL,
      actors: RENTER,
      to: RENTAL_STATUSES.CANCELLED,
    },
    {
      action: RENTAL_ACTIONS.EXPIRE,
      actors: SYSTEM,
      to: RENTAL_STATUSES.EXPIRED,
    },
  ],
  [RENTAL_STATUSES.ACCEPTED]: [
    {
      action: RENTAL_ACTIONS.PROPOSE_MEETUP,
      actors: EITHER,
      to: RENTAL_STATUSES.MEETUP_PENDING,
    },
    {
      action: RENTAL_ACTIONS.CANCEL,
      actors: EITHER,
      to: RENTAL_STATUSES.CANCELLED,
    },
  ],
  [RENTAL_STATUSES.MEETUP_PENDING]: [
    {
      action: RENTAL_ACTIONS.ACCEPT_MEETUP,
      actors: EITHER,
      to: RENTAL_STATUSES.MEETUP_SCHEDULED,
    },
    {
      action: RENTAL_ACTIONS.PROPOSE_MEETUP,
      actors: EITHER,
      to: RENTAL_STATUSES.MEETUP_PENDING,
    },
    {
      action: RENTAL_ACTIONS.CANCEL,
      actors: EITHER,
      to: RENTAL_STATUSES.CANCELLED,
    },
  ],
  [RENTAL_STATUSES.MEETUP_SCHEDULED]: [
    {
      action: RENTAL_ACTIONS.PROPOSE_MEETUP,
      actors: EITHER,
      to: RENTAL_STATUSES.MEETUP_PENDING,
    },
    {
      action: RENTAL_ACTIONS.CHECK_IN,
      actors: EITHER,
      to: RENTAL_STATUSES.AT_MEETUP,
    },
    {
      action: RENTAL_ACTIONS.REPORT_NO_SHOW,
      actors: EITHER,
      to: RENTAL_STATUSES.NO_SHOW,
    },
    {
      action: RENTAL_ACTIONS.CANCEL,
      actors: EITHER,
      to: RENTAL_STATUSES.CANCELLED,
    },
  ],
  [RENTAL_STATUSES.AT_MEETUP]: [
    {
      action: RENTAL_ACTIONS.START_INSPECTION,
      actors: RENTER,
      to: RENTAL_STATUSES.HANDOVER_PENDING,
    },
    {
      action: RENTAL_ACTIONS.CONFIRM_HANDOVER,
      actors: RENTER,
      to: RENTAL_STATUSES.ACTIVE,
    },
    {
      action: RENTAL_ACTIONS.REPORT_ISSUE,
      actors: RENTER,
      to: RENTAL_STATUSES.DISPUTED,
    },
    {
      action: RENTAL_ACTIONS.REPORT_NO_SHOW,
      actors: EITHER,
      to: RENTAL_STATUSES.NO_SHOW,
    },
    {
      action: RENTAL_ACTIONS.CANCEL,
      actors: EITHER,
      to: RENTAL_STATUSES.CANCELLED,
    },
  ],
  [RENTAL_STATUSES.HANDOVER_PENDING]: [
    {
      action: RENTAL_ACTIONS.CONFIRM_HANDOVER,
      actors: RENTER,
      to: RENTAL_STATUSES.ACTIVE,
    },
    {
      action: RENTAL_ACTIONS.REPORT_ISSUE,
      actors: RENTER,
      to: RENTAL_STATUSES.DISPUTED,
    },
  ],
  [RENTAL_STATUSES.ACTIVE]: [
    {
      action: RENTAL_ACTIONS.RETURN_DUE,
      actors: SYSTEM,
      to: RENTAL_STATUSES.RETURN_PENDING,
    },
    {
      action: RENTAL_ACTIONS.MARK_RETURNED,
      actors: RENTER,
      to: RENTAL_STATUSES.RETURNED,
    },
    {
      action: RENTAL_ACTIONS.OPEN_DISPUTE,
      actors: EITHER,
      to: RENTAL_STATUSES.DISPUTED,
    },
  ],
  [RENTAL_STATUSES.RETURN_PENDING]: [
    {
      action: RENTAL_ACTIONS.MARK_RETURNED,
      actors: RENTER,
      to: RENTAL_STATUSES.RETURNED,
    },
    {
      action: RENTAL_ACTIONS.OPEN_DISPUTE,
      actors: EITHER,
      to: RENTAL_STATUSES.DISPUTED,
    },
  ],
  [RENTAL_STATUSES.RETURNED]: [
    {
      action: RENTAL_ACTIONS.CONFIRM_RETURN,
      actors: LENDER,
      to: RENTAL_STATUSES.COMPLETED,
    },
    {
      action: RENTAL_ACTIONS.OPEN_DISPUTE,
      actors: EITHER,
      to: RENTAL_STATUSES.DISPUTED,
    },
  ],
  [RENTAL_STATUSES.DISPUTED]: [
    {
      action: RENTAL_ACTIONS.RESOLVE_DISPUTE,
      actors: SYSTEM,
      to: RENTAL_STATUSES.COMPLETED,
    },
  ],
  [RENTAL_STATUSES.PAYMENT_FAILED]: [
    {
      action: RENTAL_ACTIONS.RETRY_PAYMENT,
      actors: RENTER,
      to: RENTAL_STATUSES.REQUESTED,
    },
  ],
  [RENTAL_STATUSES.DECLINED]: [],
  [RENTAL_STATUSES.CANCELLED]: [],
  [RENTAL_STATUSES.EXPIRED]: [],
  [RENTAL_STATUSES.NO_SHOW]: [],
  [RENTAL_STATUSES.COMPLETED]: [],
};
