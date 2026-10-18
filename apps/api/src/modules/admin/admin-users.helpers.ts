import type { user } from "@wearly/db/schema/auth";
import type { AdminUser, UserRole } from "@wearly/shared/api/types";
import { ROLES } from "@wearly/shared/enums";

/** Maps a `user` table row to the admin API response shape. */
export function toAdminUser(row: typeof user.$inferSelect): AdminUser {
  return {
    banned: row.banned ?? false,
    createdAt: row.createdAt.toISOString(),
    deletedAt: row.deleted_at ? row.deleted_at.toISOString() : null,
    email: row.email,
    emailVerified: row.emailVerified,
    id: row.id,
    image: row.image,
    name: row.name,
    role: (row.role ?? ROLES.USER) as UserRole,
    updatedAt: row.updatedAt.toISOString(),
  };
}
