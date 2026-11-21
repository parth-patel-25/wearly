/** A meetup proposal's own lifecycle, independent of the rental status. */
export const MEETUP_STATUSES = {
  CANCELLED: "cancelled",
  CONFIRMED: "confirmed",
  PROPOSED: "proposed",
  SUPERSEDED: "superseded",
} as const;

export const MEETUP_STATUS_VALUES = Object.values(MEETUP_STATUSES) as [
  (typeof MEETUP_STATUSES)[keyof typeof MEETUP_STATUSES],
  ...(typeof MEETUP_STATUSES)[keyof typeof MEETUP_STATUSES][],
];

export type MeetupStatus = (typeof MEETUP_STATUS_VALUES)[number];
