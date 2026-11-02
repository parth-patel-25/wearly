export const LISTING_STATUSES = { DRAFT: "draft", PUBLISHED: "published" } as const;
export const LISTING_STATUS_VALUES = [LISTING_STATUSES.DRAFT, LISTING_STATUSES.PUBLISHED] as const;
export type ListingStatus = (typeof LISTING_STATUS_VALUES)[number];
