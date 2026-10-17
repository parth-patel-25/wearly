import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

/**
 * Role model (see `docs/auth-and-database.md`):
 * - `user` — no admin permissions
 * - `admin` — manage users (list/read/update/delete/ban), no role changes
 * - `super_admin` — full admin set including `set-role` (invites/demotions)
 *
 * Only `super_admin` may create or revoke other admins, enforced here (for
 * Better Auth's own admin endpoints) and in the admin controllers.
 */
export const ac = createAccessControl(defaultStatements);

export const adminRole = ac.newRole({
  session: ["list", "revoke", "delete"],
  user: [
    "list",
    "get",
    "update",
    "delete",
    "set-password",
    "ban",
    "impersonate",
  ],
});

export const superAdminRole = ac.newRole({
  session: ["list", "revoke", "delete"],
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "delete",
    "set-password",
    "set-email",
    "get",
    "update",
  ],
});
