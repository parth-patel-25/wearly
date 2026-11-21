import { z } from "zod";
import {
  DISPUTE_CATEGORY_VALUES,
  FULFILLMENT_METHODS,
  MEETUP_STATUS_VALUES,
  PAYMENT_MODE_VALUES,
  PAYMENT_STATUS_VALUES,
  RENTAL_STATUS_VALUES,
  SUPPORTED_FULFILLMENT_METHODS,
} from "../enums/index.js";

/** A calendar day, not a timestamp. */
export const isoDaySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD day");

export const rentalStatusSchema = z.enum(RENTAL_STATUS_VALUES);
export const paymentStatusSchema = z.enum(PAYMENT_STATUS_VALUES);
export const paymentModeSchema = z.enum(PAYMENT_MODE_VALUES);
export const meetupStatusSchema = z.enum(MEETUP_STATUS_VALUES);
export const disputeCategorySchema = z.enum(DISPUTE_CATEGORY_VALUES);

/** Response-only; the API rejects `delivery` at the boundary below. */
export const fulfillmentMethodSchema = z.enum([
  FULFILLMENT_METHODS.IN_PERSON,
  FULFILLMENT_METHODS.DELIVERY,
]);

const supportedFulfillmentSchema = z.enum(SUPPORTED_FULFILLMENT_METHODS);

export const createRentalSchema = z
  .object({
    endDate: isoDaySchema,
    fulfillmentMethod: supportedFulfillmentSchema.default(
      FULFILLMENT_METHODS.IN_PERSON
    ),
    listingId: z.uuid(),
    /** A short note to the lender, shown with the request. */
    note: z.string().trim().max(500).optional(),
    startDate: isoDaySchema,
  })
  .refine((value) => value.endDate >= value.startDate, {
    message: "The return day cannot be before the start day",
    path: ["endDate"],
  });
export type CreateRentalInput = z.infer<typeof createRentalSchema>;

export const listRentalsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  role: z.enum(["renter", "lender", "all"]).default("all"),
  status: rentalStatusSchema.optional(),
});
export type ListRentalsQuery = z.infer<typeof listRentalsQuerySchema>;

export const rentalReasonSchema = z.object({
  reason: z.string().trim().min(3).max(300),
});
export type RentalReasonInput = z.infer<typeof rentalReasonSchema>;

export const declineRentalSchema = z.object({
  reason: z.string().trim().max(300).optional(),
});
export type DeclineRentalInput = z.infer<typeof declineRentalSchema>;

export const meetupProposalSchema = z.object({
  areaLabel: z.string().trim().min(1).max(80),
  note: z.string().trim().max(300).optional(),
  placeName: z.string().trim().min(2).max(120),
  scheduledAt: z.iso.datetime(),
});
export type MeetupProposalInput = z.infer<typeof meetupProposalSchema>;

export const handoverConfirmSchema = z.object({
  /** The renter must explicitly confirm they inspected and received it. */
  conditionAccepted: z.literal(true),
  itemReceived: z.literal(true),
  note: z.string().trim().max(300).optional(),
});
export type HandoverConfirmInput = z.infer<typeof handoverConfirmSchema>;

export const handoverAcknowledgeSchema = z.object({
  note: z.string().trim().max(300).optional(),
});
export type HandoverAcknowledgeInput = z.infer<
  typeof handoverAcknowledgeSchema
>;

export const noShowSchema = z.object({
  note: z.string().trim().max(300).optional(),
});
export type NoShowInput = z.infer<typeof noShowSchema>;

export const disputeSchema = z.object({
  category: disputeCategorySchema,
  details: z.string().trim().min(10).max(2000),
});
export type DisputeInput = z.infer<typeof disputeSchema>;

/** No body; kept explicit so the controller contract is obvious. */
export const emptyActionSchema = z.object({}).optional();
