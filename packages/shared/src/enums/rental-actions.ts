/** Every state-changing operation a rental supports. */
export const RENTAL_ACTIONS = {
  ACCEPT: "accept",
  ACCEPT_MEETUP: "accept_meetup",
  CANCEL: "cancel",
  CHECK_IN: "check_in",
  CONFIRM_HANDOVER: "confirm_handover",
  CONFIRM_RETURN: "confirm_return",
  DECLINE: "decline",
  EXPIRE: "expire",
  MARK_RETURNED: "mark_returned",
  OPEN_DISPUTE: "open_dispute",
  PROPOSE_MEETUP: "propose_meetup",
  REPORT_ISSUE: "report_issue",
  REPORT_NO_SHOW: "report_no_show",
  REQUEST: "request",
  RESOLVE_DISPUTE: "resolve_dispute",
  RETRY_PAYMENT: "retry_payment",
  RETURN_DUE: "return_due",
  START_INSPECTION: "start_inspection",
} as const;

export const RENTAL_ACTION_VALUES = Object.values(RENTAL_ACTIONS) as [
  (typeof RENTAL_ACTIONS)[keyof typeof RENTAL_ACTIONS],
  ...(typeof RENTAL_ACTIONS)[keyof typeof RENTAL_ACTIONS][],
];

export type RentalAction = (typeof RENTAL_ACTION_VALUES)[number];

/** Who is allowed to perform an action. `system` is never a signed-in user. */
export const RENTAL_ACTOR_ROLES = {
  LENDER: "lender",
  RENTER: "renter",
  SYSTEM: "system",
} as const;

export const RENTAL_ACTOR_ROLE_VALUES = Object.values(RENTAL_ACTOR_ROLES) as [
  (typeof RENTAL_ACTOR_ROLES)[keyof typeof RENTAL_ACTOR_ROLES],
  ...(typeof RENTAL_ACTOR_ROLES)[keyof typeof RENTAL_ACTOR_ROLES][],
];

export type RentalActorRole = (typeof RENTAL_ACTOR_ROLE_VALUES)[number];

/** The signed-in participant roles. `system` is excluded on purpose. */
export type RentalParticipantRole = Exclude<RentalActorRole, "system">;
