import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { AllowAnonymous, Session } from "@thallesp/nestjs-better-auth";
import { acceptAdminInviteSchema } from "@wearly/shared/api/schemas";
import type {
  AcceptAdminInviteInput,
  AdminInvite,
  AdminUser,
} from "@wearly/shared/api/types";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { AdminInvitesService } from "./admin-invites.service.js";

/**
 * Invite redemption surface. Any authenticated user holding a valid token may
 * accept it; the landing page reads invite details before sign-in, so the
 * token lookup is anonymous.
 */
@Controller("admin/invites")
export class AdminInviteAccessController {
  constructor(private readonly invites: AdminInvitesService) {}

  @AllowAnonymous()
  @Get("token/:token")
  getByToken(@Param("token") token: string): Promise<AdminInvite> {
    return this.invites.findByToken(token);
  }

  @Post("accept")
  accept(
    @Body(new ZodValidationPipe(acceptAdminInviteSchema))
    input: AcceptAdminInviteInput,
    @Session() session: UserSession
  ): Promise<AdminUser> {
    return this.invites.accept(input.token, {
      email: session.user.email,
      userId: session.user.id,
    });
  }
}
