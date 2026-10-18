/**
 * Role model shared by the API guards, the admin UI and Better Auth.
 *
 * Single source of truth: every role literal in the codebase reads from
 * `ROLES` instead of being re-typed. `USER_ROLES` drives the Zod schema in
 * `../api/schemas.ts`, so the runtime validator and the static type can never
 * drift from this list.
 */
export const ROLES = {
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  USER: "user",
} as const;

/** Every role, in schema order. The tuple also yields the `UserRole` union. */
export const USER_ROLES = [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** Roles that may access `/api/admin/*` at all. */
export const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN] as const;

/** Roles that may create/revoke other admins (invites, demotions). */
export const SUPER_ADMIN_ROLES = [ROLES.SUPER_ADMIN] as const;
