/** Why a dispute was opened. */
export const DISPUTE_CATEGORIES = {
  DAMAGED: "damaged",
  ITEM_NOT_AS_DESCRIBED: "item_not_as_described",
  NO_SHOW: "no_show",
  NOT_HANDED_OVER: "not_handed_over",
  OTHER: "other",
} as const;

export const DISPUTE_CATEGORY_VALUES = Object.values(DISPUTE_CATEGORIES) as [
  (typeof DISPUTE_CATEGORIES)[keyof typeof DISPUTE_CATEGORIES],
  ...(typeof DISPUTE_CATEGORIES)[keyof typeof DISPUTE_CATEGORIES][],
];

export type DisputeCategory = (typeof DISPUTE_CATEGORY_VALUES)[number];

/** The resolution workflow is future; the entry point and state are now. */
export const DISPUTE_STATUSES = {
  OPEN: "open",
  RESOLVED: "resolved",
  WITHDRAWN: "withdrawn",
} as const;

export const DISPUTE_STATUS_VALUES = Object.values(DISPUTE_STATUSES) as [
  (typeof DISPUTE_STATUSES)[keyof typeof DISPUTE_STATUSES],
  ...(typeof DISPUTE_STATUSES)[keyof typeof DISPUTE_STATUSES][],
];

export type DisputeStatus = (typeof DISPUTE_STATUS_VALUES)[number];
