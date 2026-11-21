import { z } from "zod";
import {
  DISPUTE_STATUS_VALUES,
  MEETUP_STATUS_VALUES,
  PAYMENT_MODE_VALUES,
  PAYMENT_STATUS_VALUES,
  RENTAL_STATUS_VALUES,
} from "../enums/index.js";
import { listingSchema } from "./listing-schemas.js";
import { isoDaySchema } from "./rental-schemas.js";

/** A rental as the app reads it. Never contains coordinates or emails. */
export const rentalCounterpartySchema = z.object({
  id: z.string().min(1),
  image: z.string().nullable().optional(),
  name: z.string(),
});
export type RentalCounterparty = z.infer<typeof rentalCounterpartySchema>;

export const rentalCapabilitiesSchema = z.object({
  canAccept: z.boolean(),
  canAcceptMeetup: z.boolean(),
  canAcknowledgeHandover: z.boolean(),
  canCancel: z.boolean(),
  canCheckIn: z.boolean(),
  canConfirmHandover: z.boolean(),
  canConfirmReturn: z.boolean(),
  canDecline: z.boolean(),
  canMarkReturned: z.boolean(),
  canOpenDispute: z.boolean(),
  canProposeMeetup: z.boolean(),
  canReportIssue: z.boolean(),
  canReportNoShow: z.boolean(),
  canRetryPayment: z.boolean(),
  canStartInspection: z.boolean(),
});
export type RentalCapabilitiesResponse = z.infer<
  typeof rentalCapabilitiesSchema
>;

export const rentalMeetupSchema = z.object({
  areaLabel: z.string(),
  createdAt: z.iso.datetime(),
  id: z.uuid(),
  note: z.string().nullable().optional(),
  placeName: z.string(),
  proposedById: z.string(),
  respondedAt: z.iso.datetime().nullable().optional(),
  scheduledAt: z.iso.datetime(),
  status: z.enum(MEETUP_STATUS_VALUES),
});
export type RentalMeetup = z.infer<typeof rentalMeetupSchema>;

export const rentalPaymentSchema = z.object({
  authorizedAt: z.iso.datetime().nullable().optional(),
  capturedAt: z.iso.datetime().nullable().optional(),
  mode: z.enum(PAYMENT_MODE_VALUES),
  provider: z.string().nullable().optional(),
  refundedAt: z.iso.datetime().nullable().optional(),
  status: z.enum(PAYMENT_STATUS_VALUES),
  voidedAt: z.iso.datetime().nullable().optional(),
});
export type RentalPayment = z.infer<typeof rentalPaymentSchema>;

export const rentalEventSchema = z.object({
  actorId: z.string().nullable().optional(),
  createdAt: z.iso.datetime(),
  fromStatus: z.enum(RENTAL_STATUS_VALUES).nullable().optional(),
  id: z.uuid(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  toStatus: z.enum(RENTAL_STATUS_VALUES).nullable().optional(),
  type: z.string(),
});
export type RentalEvent = z.infer<typeof rentalEventSchema>;

export const rentalDisputeSchema = z.object({
  category: z.string(),
  createdAt: z.iso.datetime(),
  details: z.string(),
  id: z.uuid(),
  openedById: z.string(),
  resolutionNotes: z.string().nullable().optional(),
  resolvedAt: z.iso.datetime().nullable().optional(),
  status: z.enum(DISPUTE_STATUS_VALUES),
});
export type RentalDispute = z.infer<typeof rentalDisputeSchema>;

export const rentalCancellationSchema = z.object({
  by: z.enum(["renter", "lender", "system"]),
  cancelledAt: z.iso.datetime(),
  reason: z.string().nullable().optional(),
});
export type RentalCancellation = z.infer<typeof rentalCancellationSchema>;

export const rentalSummarySchema = z.object({
  acceptedAt: z.iso.datetime().nullable().optional(),
  activatedAt: z.iso.datetime().nullable().optional(),
  counterparty: rentalCounterpartySchema,
  createdAt: z.iso.datetime(),
  currency: z.string(),
  days: z.number().int().positive(),
  endDate: isoDaySchema,
  id: z.uuid(),
  listing: listingSchema,
  meetup: rentalMeetupSchema.nullable().optional(),
  payment: rentalPaymentSchema,
  requestedAt: z.iso.datetime(),
  returnDueAt: z.iso.datetime().nullable().optional(),
  role: z.enum(["renter", "lender"]),
  startDate: isoDaySchema,
  status: z.enum(RENTAL_STATUS_VALUES),
  totalRupees: z.number().int().nonnegative(),
  updatedAt: z.iso.datetime(),
});
export type RentalSummary = z.infer<typeof rentalSummarySchema>;

export const rentalDetailSchema = rentalSummarySchema.extend({
  cancellation: rentalCancellationSchema.nullable().optional(),
  capabilities: rentalCapabilitiesSchema,
  dispute: rentalDisputeSchema.nullable().optional(),
  handoverAcknowledgedAt: z.iso.datetime().nullable().optional(),
  timeline: z.array(rentalEventSchema),
});
export type RentalDetail = z.infer<typeof rentalDetailSchema>;

export const listRentalsResponseSchema = z.object({
  items: z.array(rentalSummarySchema),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});
export type ListRentalsResponse = z.infer<typeof listRentalsResponseSchema>;
