import { randomBytes } from "node:crypto";
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { db } from "@wearly/db/client";
import {
  type AdminInvite as AdminInviteRow,
  adminInvites,
  INVITE_TTL_DAYS,
  isInviteActive,
} from "@wearly/db/schema/admin-invites";
import { user } from "@wearly/db/schema/auth";
import type { AdminInvite, AdminUser } from "@wearly/shared/api/types";
import { desc, eq } from "drizzle-orm";
import { emailLayout, sendEmail } from "../email/email.js";
import {
  hashToken,
  inviteStatus,
  toAdminInvite,
} from "./admin-invites.helpers.js";
import { type Actor } from "./admin-policy.js";
import { toAdminUser } from "./admin-users.helpers.js";

@Injectable()
export class AdminInvitesService {
  async list(): Promise<AdminInvite[]> {
    // Select the inviter email explicitly rather than `select().leftJoin`:
    // drizzle 0.45 nullifies a whole joined table when its first selected
    // column is null, and the user table's alphabetical column order starts
    // with the nullable `ban_expires`. `user.email` is NOT NULL, so it is
    // safe as the only projected user column.
    const rows = await db
      .select({ invite: adminInvites, inviterEmail: user.email })
      .from(adminInvites)
      .leftJoin(user, eq(adminInvites.invitedBy, user.id))
      .orderBy(desc(adminInvites.createdAt));

    return rows.map(({ invite, inviterEmail }) =>
      toAdminInvite(invite, inviterEmail)
    );
  }

  async create(email: string, actor: Actor): Promise<AdminInvite> {
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    const [found] = existingUser;
    if (found && !found.deleted_at) {
      const role = found.role ?? "user";
      if (role === "admin" || role === "super_admin") {
        throw new ConflictException("This user is already an admin");
      }
    }

    const recent = await db
      .select()
      .from(adminInvites)
      .where(eq(adminInvites.email, email))
      .limit(50);
    if (recent.some((invite) => isInviteActive(invite))) {
      throw new ConflictException(
        "An invite for this email is already pending"
      );
    }

    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(
      Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000
    );

    const inserted = await db
      .insert(adminInvites)
      .values({
        email,
        expiresAt,
        invitedBy: actor.id,
        role: "admin",
        tokenHash: hashToken(token),
      })
      .returning();
    const [row] = inserted;
    if (!row) {
      throw new NotFoundException("Failed to create invite");
    }

    const origin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
    const link = `${origin}/admin/invite/${token}`;
    await sendEmail({
      html: emailLayout(
        "Admin invitation",
        `You have been invited as a Wearly admin: <a href="${link}">Accept invitation</a> (valid for ${INVITE_TTL_DAYS} days).`
      ),
      subject: "You have been invited to Wearly Admin",
      text: `Accept your Wearly admin invitation (valid for ${INVITE_TTL_DAYS} days): ${link}`,
      to: email,
    });

    return toAdminInvite(row);
  }

  async revoke(id: string): Promise<void> {
    const rows = await db
      .select()
      .from(adminInvites)
      .where(eq(adminInvites.id, id))
      .limit(1);
    const [row] = rows;
    if (!row) {
      throw new NotFoundException("Invite not found");
    }
    if (!isInviteActive(row)) {
      throw new ConflictException(`Invite is already ${inviteStatus(row)}`);
    }
    await db
      .update(adminInvites)
      .set({ revokedAt: new Date() })
      .where(eq(adminInvites.id, id));
  }

  async findByToken(token: string): Promise<AdminInvite> {
    const row = await this.findRowByToken(token);
    return toAdminInvite(row);
  }

  /**
   * Redeems an invite: the signed-in user must own the invited email. Promotes
   * to the invite's role (admin) and marks the invite accepted.
   */
  async accept(
    token: string,
    session: { userId: string; email: string }
  ): Promise<AdminUser> {
    const row = await this.findRowByToken(token);
    if (!isInviteActive(row)) {
      throw new ConflictException(`Invite is ${inviteStatus(row)}`);
    }
    if (row.email.toLowerCase() !== session.email.toLowerCase()) {
      throw new ForbiddenException(
        "This invitation was issued to a different email address"
      );
    }

    // The valid token + email match IS the authorization here, so promote
    // directly — the admin plugin's permission-checked setRole would (rightly)
    // reject a plain user elevating themselves.
    const role = row.role === "super_admin" ? "super_admin" : "admin";
    await db.update(user).set({ role }).where(eq(user.id, session.userId));

    await db
      .update(adminInvites)
      .set({ acceptedAt: new Date() })
      .where(eq(adminInvites.id, row.id));

    const rows = await db
      .select()
      .from(user)
      .where(eq(user.id, session.userId))
      .limit(1);
    const [updated] = rows;
    if (!updated) {
      throw new NotFoundException("User not found");
    }
    return toAdminUser(updated);
  }

  private async findRowByToken(token: string): Promise<AdminInviteRow> {
    const rows = await db
      .select()
      .from(adminInvites)
      .where(eq(adminInvites.tokenHash, hashToken(token)))
      .limit(1);
    const [row] = rows;
    if (!row) {
      throw new NotFoundException("Invite not found");
    }
    return row;
  }
}
