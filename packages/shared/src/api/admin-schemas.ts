import { z } from "zod";
import { INVITE_STATUSES, USER_ROLES } from "../enums/index.js";

/* ------------------------------------------------------------------ admin */

/** Role model shared by the API guards and the admin UI. */
export const userRoleSchema = z.enum(USER_ROLES);
export type { UserRole } from "../enums/index.js";

/** A user row as the admin endpoints return it. `role` is always filled
 * server-side (`row.role ?? "user"`), so it is required here. */
export const adminUserSchema = z.object({
  banned: z.boolean().nullish(),
  createdAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullish(),
  email: z.string(),
  emailVerified: z.boolean(),
  id: z.string().min(1),
  image: z.string().nullish(),
  name: z.string(),
  role: userRoleSchema,
  updatedAt: z.iso.datetime(),
});
export type AdminUser = z.infer<typeof adminUserSchema>;

/** Query string accepted by `GET /api/admin/users`. */
export const listAdminUsersQuerySchema = z.object({
  includeDeleted: z.stringbool().default(false),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().trim().max(200).optional(),
});
export type ListAdminUsersQuery = z.infer<typeof listAdminUsersQuerySchema>;

/** Response of `GET /api/admin/users`. */
export const listAdminUsersResponseSchema = z.object({
  items: z.array(adminUserSchema),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});
export type ListAdminUsersResponse = z.infer<
  typeof listAdminUsersResponseSchema
>;

/** Lifecycle state of an admin invite, computed by the API. */
export const adminInviteStatusSchema = z.enum(INVITE_STATUSES);
export type { AdminInviteStatus } from "../enums/index.js";

/** An admin invitation as the admin endpoints return it (never the token). */
export const adminInviteSchema = z.object({
  acceptedAt: z.iso.datetime().nullish(),
  createdAt: z.iso.datetime(),
  email: z.string(),
  expiresAt: z.iso.datetime(),
  id: z.uuid(),
  invitedBy: z.string(),
  invitedByEmail: z.string().nullish(),
  revokedAt: z.iso.datetime().nullish(),
  role: userRoleSchema,
  status: adminInviteStatusSchema,
});
export type AdminInvite = z.infer<typeof adminInviteSchema>;

/** Response of `GET /api/admin/invites`. */
export const listAdminInvitesResponseSchema = z.object({
  items: z.array(adminInviteSchema),
});
export type ListAdminInvitesResponse = z.infer<
  typeof listAdminInvitesResponseSchema
>;

/** Body accepted by `POST /api/admin/invites`. */
export const createAdminInviteSchema = z.object({
  email: z
    .string()
    .min(1, "email is required")
    .transform((value) => value.trim().toLowerCase())
    .pipe(z.email("enter a valid email")),
});
export type CreateAdminInviteInput = z.infer<typeof createAdminInviteSchema>;

/** Body accepted by `POST /api/admin/invites/accept`. */
export const acceptAdminInviteSchema = z.object({
  token: z.string().min(1),
});

export type AcceptAdminInviteInput = z.infer<typeof acceptAdminInviteSchema>;
