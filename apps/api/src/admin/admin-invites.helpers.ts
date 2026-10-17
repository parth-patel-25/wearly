import { createHash } from "node:crypto";
import {
  type AdminInvite as AdminInviteRow,
  isInviteActive,
} from "@wearly/db/schema/admin-invites";
import type {
  AdminInvite,
  AdminInviteStatus,
  UserRole,
} from "@wearly/shared/api/types";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function inviteStatus(row: AdminInviteRow): AdminInviteStatus {
  if (row.acceptedAt) {
    return "accepted";
  }
  if (row.revokedAt) {
    return "revoked";
  }
  return isInviteActive(row) ? "pending" : "expired";
}

export function toAdminInvite(
  row: AdminInviteRow,
  invitedByEmail?: string | null
): AdminInvite {
  return {
    acceptedAt: row.acceptedAt ? row.acceptedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    email: row.email,
    expiresAt: row.expiresAt.toISOString(),
    id: row.id,
    invitedBy: row.invitedBy,
    invitedByEmail: invitedByEmail ?? null,
    revokedAt: row.revokedAt ? row.revokedAt.toISOString() : null,
    role: row.role as UserRole,
    status: inviteStatus(row),
  };
}
