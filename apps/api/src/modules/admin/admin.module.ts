import { Module } from "@nestjs/common";
import { AdminInviteAccessController } from "./admin-invite-access.controller.js";
import { AdminInvitesController } from "./admin-invites.controller.js";
import { AdminInvitesService } from "./admin-invites.service.js";
import { AdminUsersController } from "./admin-users.controller.js";
import { AdminUsersService } from "./admin-users.service.js";

/**
 * Admin panel backend (`/api/admin/*`). Never exposes Better Auth's raw
 * `/admin/*` endpoints to the browser — all authorization, soft-delete checks
 * and invite hashing live here (docs/auth-and-database.md §12.2).
 */
@Module({
  controllers: [
    AdminUsersController,
    AdminInvitesController,
    AdminInviteAccessController,
  ],
  providers: [AdminUsersService, AdminInvitesService],
})
export class AdminModule {}
