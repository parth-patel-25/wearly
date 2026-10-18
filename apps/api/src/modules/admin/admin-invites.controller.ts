import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { Roles, Session } from "@thallesp/nestjs-better-auth";
import { createAdminInviteSchema, idSchema } from "@wearly/shared/api/schemas";
import type {
  AdminInvite,
  CreateAdminInviteInput,
  ListAdminInvitesResponse,
} from "@wearly/shared/api/types";
import { SUPER_ADMIN_ROLES } from "@wearly/shared/enums";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { AdminInvitesService } from "./admin-invites.service.js";

/** Invite management (list / create / revoke) is super-admin only. */
@Controller("admin/invites")
@Roles([...SUPER_ADMIN_ROLES])
export class AdminInvitesController {
  constructor(private readonly invites: AdminInvitesService) {}

  @Get()
  list(): Promise<ListAdminInvitesResponse> {
    return this.invites.list().then((items) => ({ items }));
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createAdminInviteSchema))
    input: CreateAdminInviteInput,
    @Session() session: UserSession
  ): Promise<AdminInvite> {
    return this.invites.create(input.email, {
      id: session.user.id,
      role: typeof session.user.role === "string" ? session.user.role : null,
    });
  }

  @Delete(":id")
  revoke(
    @Param("id", new ZodValidationPipe(idSchema)) id: string
  ): Promise<void> {
    return this.invites.revoke(id);
  }
}
