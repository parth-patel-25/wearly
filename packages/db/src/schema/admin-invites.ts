import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Admin invitations issued by a super-admin. The raw token only lives in the
 * emailed link; the database stores its SHA-256 hash. Single-use, bound to an
 * email address, expires after `expiresAt`.
 */
export const adminInvites = pgTable("admin_invites", {
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  email: text("email").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  id: uuid("id").defaultRandom().primaryKey(),
  invitedBy: text("invited_by").notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  role: text("role").notNull().default("admin"),
  tokenHash: text("token_hash").notNull().unique(),
});

export type AdminInvite = typeof adminInvites.$inferSelect;
export type NewAdminInvite = typeof adminInvites.$inferInsert;

/** Invite lifetime in days. */
export const INVITE_TTL_DAYS = 7;

/** True when an invite can still be redeemed (not accepted, not revoked, not expired). */
export function isInviteActive(
  invite: AdminInvite,
  now: Date = new Date()
): boolean {
  if (invite.acceptedAt || invite.revokedAt) {
    return false;
  }
  return invite.expiresAt.getTime() > now.getTime();
}
