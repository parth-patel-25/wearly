/**
 * Listing condition vocabulary.
 *
 * One vocabulary everywhere: the catalogue, the create-listing DTO, the filter
 * chips and the mobile read model all speak `Condition`. Legacy stored values
 * ("Good", "Excellent", "Brand New with Tags", the old "good-condition" /
 * "like-new" seeds) are translated on read — see the mobile
 * `normaliseCondition` — and backfilled on write.
 */
export const CONDITIONS = {
  BRAND_NEW_WITH_TAGS: "brand_new_with_tags",
  BRAND_NEW_WITHOUT_TAGS: "brand_new_without_tags",
  EXCELLENT: "excellent",
  FAIR: "fair",
  GOOD: "good",
} as const;

/** Every condition, in display order. The tuple also yields `Condition`. */
export const CONDITION_VALUES = [
  CONDITIONS.BRAND_NEW_WITH_TAGS,
  CONDITIONS.BRAND_NEW_WITHOUT_TAGS,
  CONDITIONS.EXCELLENT,
  CONDITIONS.GOOD,
  CONDITIONS.FAIR,
] as const;

export type Condition = (typeof CONDITION_VALUES)[number];
