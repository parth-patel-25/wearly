import { HttpException } from "@nestjs/common";
import type { UserRole } from "@wearly/shared/api/types";

/** Roles that may access `/api/admin/*` at all. */
export const ADMIN_ROLES: readonly UserRole[] = ["admin", "super_admin"];

/** Roles that may create/revoke other admins (invites, demotions). */
export const SUPER_ADMIN_ROLES: readonly UserRole[] = ["super_admin"];

export interface Actor {
  id: string;
  role: string | null | undefined;
}

export interface Target {
  id: string;
  role: string | null | undefined;
}

export function isSuperAdmin(actor: Actor): boolean {
  return actor.role === "super_admin";
}

export function isAdmin(actor: Actor): boolean {
  return actor.role === "admin" || actor.role === "super_admin";
}

/**
 * Who may soft-delete / hard-delete / restore whom:
 * - nobody acts on a `super_admin`
 * - only a `super_admin` acts on another admin
 * - admins and super_admins act on regular users
 * - nobody acts on themselves (prevents locking yourself out)
 */
export function canActOnUser(actor: Actor, target: Target): boolean {
  if (actor.id === target.id) {
    return false;
  }
  if (target.role === "super_admin") {
    return false;
  }
  if (target.role === "admin") {
    return isSuperAdmin(actor);
  }
  return isAdmin(actor);
}

/**
 * Better Auth's server APIs (`auth.api.*`) throw their own APIError. Translate
 * it into a Nest HttpException so the client gets a normal `{ statusCode,
 * message }` body instead of a 500.
 */
export function rethrowAsHttp(error: unknown): never {
  if (
    error instanceof Error &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  ) {
    const { status } = error as { status: number };
    throw new HttpException(error.message, status);
  }
  throw error;
}
