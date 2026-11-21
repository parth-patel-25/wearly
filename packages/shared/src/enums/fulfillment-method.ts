/**
 * How a rental changes hands.
 *
 * `delivery` exists so the data model and UI copy can grow into it later, but
 * the API rejects it in this phase. Only `in_person` is supported.
 */
export const FULFILLMENT_METHODS = {
  DELIVERY: "delivery",
  IN_PERSON: "in_person",
} as const;

export const FULFILLMENT_METHOD_VALUES = Object.values(FULFILLMENT_METHODS) as [
  (typeof FULFILLMENT_METHODS)[keyof typeof FULFILLMENT_METHODS],
  ...(typeof FULFILLMENT_METHODS)[keyof typeof FULFILLMENT_METHODS][],
];

export type FulfillmentMethod = (typeof FULFILLMENT_METHOD_VALUES)[number];

/** Methods this phase accepts. Delivery is deliberately absent. */
export const SUPPORTED_FULFILLMENT_METHODS = [
  FULFILLMENT_METHODS.IN_PERSON,
] as const;

export type SupportedFulfillmentMethod =
  (typeof SUPPORTED_FULFILLMENT_METHODS)[number];
