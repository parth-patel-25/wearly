import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { AuthService } from "@thallesp/nestjs-better-auth";
import { db } from "@wearly/db/client";
import { user } from "@wearly/db/schema/auth";
import type {
  AdminUser,
  ListAdminUsersQuery,
  ListAdminUsersResponse,
} from "@wearly/shared/api/types";
import { ROLES } from "@wearly/shared/enums";
import {
  and,
  desc,
  eq,
  ilike,
  isNull,
  or,
  type SQLWrapper,
  sql,
} from "drizzle-orm";
import type { auth } from "../../core/auth/auth.js";
import { type Actor, canActOnUser, rethrowAsHttp } from "./admin-policy.js";
import { toAdminUser } from "./admin-users.helpers.js";

export type RequestHeaders = Record<string, string | string[] | undefined>;

function searchPattern(value: string): string {
  return `%${value.replace(/[\\%_]/g, "\\$&")}%`;
}

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(private readonly authApi: AuthService<typeof auth>) {}

  async list(query: ListAdminUsersQuery): Promise<ListAdminUsersResponse> {
    const conditions: (SQLWrapper | undefined)[] = [];
    if (!query.includeDeleted) {
      conditions.push(isNull(user.deleted_at));
    }
    if (query.search) {
      const pattern = searchPattern(query.search);
      conditions.push(
        or(ilike(user.email, pattern), ilike(user.name, pattern))
      );
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, countRows] = await Promise.all([
      db
        .select()
        .from(user)
        .where(where)
        .orderBy(desc(user.createdAt))
        .limit(query.limit)
        .offset(query.offset),
      db.select({ value: sql<number>`count(*)::int` }).from(user).where(where),
    ]);

    return {
      items: rows.map(toAdminUser),
      limit: query.limit,
      offset: query.offset,
      total: countRows[0]?.value ?? 0,
    };
  }

  async softDelete(
    id: string,
    actor: Actor,
    headers: RequestHeaders
  ): Promise<AdminUser> {
    const target = await this.findTarget(id);
    this.assertCanAct(actor, target);

    const updated = await db
      .update(user)
      .set({ deleted_at: new Date() })
      .where(eq(user.id, id))
      .returning();
    const [row] = updated;
    if (!row) {
      throw new NotFoundException("User not found");
    }

    try {
      await this.authApi.api.revokeUserSessions({
        body: { userId: id },
        headers,
      });
    } catch (error) {
      // The deleted_at check already blocks access; dead sessions are hygiene.
      this.logger.warn(`Failed to revoke sessions for ${id}`, String(error));
    }

    return toAdminUser(row);
  }

  async restore(id: string, actor: Actor): Promise<AdminUser> {
    const target = await this.findTarget(id);
    this.assertCanAct(actor, target);
    if (!target.deleted_at) {
      return toAdminUser(target);
    }

    const updated = await db
      .update(user)
      .set({ deleted_at: null })
      .where(eq(user.id, id))
      .returning();
    const [row] = updated;
    if (!row) {
      throw new NotFoundException("User not found");
    }
    return toAdminUser(row);
  }

  async remove(
    id: string,
    actor: Actor,
    headers: RequestHeaders
  ): Promise<void> {
    const target = await this.findTarget(id);
    this.assertCanAct(actor, target);
    try {
      await this.authApi.api.removeUser({ body: { userId: id }, headers });
    } catch (error) {
      rethrowAsHttp(error);
    }
  }

  private async findTarget(id: string): Promise<typeof user.$inferSelect> {
    const rows = await db.select().from(user).where(eq(user.id, id)).limit(1);
    const [row] = rows;
    if (!row) {
      throw new NotFoundException("User not found");
    }
    return row;
  }

  private assertCanAct(actor: Actor, target: typeof user.$inferSelect): void {
    if (canActOnUser(actor, { id: target.id, role: target.role })) {
      return;
    }
    if (actor.id === target.id) {
      throw new ForbiddenException("You cannot modify your own account here");
    }
    if (target.role === ROLES.SUPER_ADMIN) {
      throw new ForbiddenException(
        "Super-admin accounts cannot be modified from the panel"
      );
    }
    throw new ForbiddenException(
      "Only a super-admin can modify admin accounts"
    );
  }
}
