import { z } from "zod";

// biome-ignore lint/performance/noBarrelFile: public package entry point for `@wearly/shared/api/schemas`; submodules keep each contract file small while callers keep one import surface.
export {
  type DiscoverListingsInput,
  type DiscoverListingsResponse,
  type DiscoveryListing,
  discoverListingsResponseSchema,
  discoverListingsSchema,
  discoveryListingSchema,
} from "./discovery-schemas.js";
// Listing and upload contracts live in their own module to keep this file under
// the repository's size limit. Re-exported here so every caller keeps using the
// single `@wearly/shared/api/schemas` entry point.
export {
  type CreateListingInput,
  type CreateUploadUrlInput,
  type CreateUploadUrlResponse,
  createListingSchema,
  createUploadUrlResponseSchema,
  createUploadUrlSchema,
  type Listing,
  listingSchema,
} from "./listing-schemas.js";
export {
  type ListRentalsResponse,
  listRentalsResponseSchema,
  type RentalCancellation,
  type RentalCapabilitiesResponse,
  type RentalCounterparty,
  type RentalDetail,
  type RentalDispute,
  type RentalEvent,
  type RentalMeetup,
  type RentalPayment,
  type RentalSummary,
  rentalCancellationSchema,
  rentalCapabilitiesSchema,
  rentalCounterpartySchema,
  rentalDetailSchema,
  rentalDisputeSchema,
  rentalEventSchema,
  rentalMeetupSchema,
  rentalPaymentSchema,
  rentalSummarySchema,
} from "./rental-response-schemas.js";
export {
  type CreateRentalInput,
  createRentalSchema,
  type DeclineRentalInput,
  type DisputeInput,
  declineRentalSchema,
  disputeSchema,
  emptyActionSchema,
  type HandoverAcknowledgeInput,
  type HandoverConfirmInput,
  handoverAcknowledgeSchema,
  handoverConfirmSchema,
  isoDaySchema,
  type ListRentalsQuery,
  listRentalsQuerySchema,
  type MeetupProposalInput,
  meetupProposalSchema,
  type NoShowInput,
  noShowSchema,
  type RentalReasonInput,
  rentalReasonSchema,
} from "./rental-schemas.js";

/** Shape returned by `GET /api/health`. */
export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.iso.datetime(),
  uptime: z.number().nonnegative(),
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;

/** A single note record. */
export const noteSchema = z.object({
  body: z.string().max(10_000),
  createdAt: z.iso.datetime(),
  id: z.string().min(1),
  title: z.string().min(1).max(200),
});
export type Note = z.infer<typeof noteSchema>;

/** Body accepted by `POST /api/notes`. */
export const createNoteSchema = z.object({
  body: z.string().max(10_000).default(""),
  title: z.string().trim().min(1, "title is required").max(200),
});
export type CreateNoteInput = z.infer<typeof createNoteSchema>;

/** Body accepted by `PATCH /api/notes/:id`. Every field is optional. */
export const updateNoteSchema = z.object({
  body: z.string().max(10_000).optional(),
  title: z.string().trim().min(1).max(200).optional(),
});
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

/** Query string accepted by `GET /api/notes`. */
export const listNotesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type ListNotesQuery = z.infer<typeof listNotesQuerySchema>;

/** Response of `GET /api/notes`. */
export const listNotesResponseSchema = z.object({
  items: z.array(noteSchema),
  total: z.number().int().nonnegative(),
});
export type ListNotesResponse = z.infer<typeof listNotesResponseSchema>;

/** Route params for any `/:id` endpoint, when validated as a whole object. */
export const idParamSchema = z.object({ id: z.string().min(1) });

/**
 * A single `:id` route param, validated on its own.
 *
 * `@Param("id", pipe)` hands the pipe the param *value* (a string), not the
 * params object — so this scalar schema is what `@Param("id", …)` needs.
 */
export const idSchema = z.string().min(1);

/** Nest's default error body, narrowed to the fields clients rely on. */
export const errorResponseSchema = z.object({
  error: z.string().optional(),
  message: z.string(),
  statusCode: z.number().int(),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

/* ------------------------------------------------------------------ admin */

export {
  type AcceptAdminInviteInput,
  type AdminInvite,
  type AdminInviteStatus,
  type AdminUser,
  acceptAdminInviteSchema,
  adminInviteSchema,
  adminInviteStatusSchema,
  adminUserSchema,
  type CreateAdminInviteInput,
  createAdminInviteSchema,
  type ListAdminInvitesResponse,
  type ListAdminUsersQuery,
  type ListAdminUsersResponse,
  listAdminInvitesResponseSchema,
  listAdminUsersQuerySchema,
  listAdminUsersResponseSchema,
  type UserRole,
  userRoleSchema,
} from "./admin-schemas.js";
