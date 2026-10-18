import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { Roles, Session } from "@thallesp/nestjs-better-auth";
import {
  idSchema,
  listAdminUsersQuerySchema,
} from "@wearly/shared/api/schemas";
import type {
  AdminUser,
  ListAdminUsersQuery,
  ListAdminUsersResponse,
} from "@wearly/shared/api/types";
import { ADMIN_ROLES } from "@wearly/shared/enums";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import type { Actor } from "./admin-policy.js";
import type { RequestHeaders } from "./admin-users.service.js";
import { AdminUsersService } from "./admin-users.service.js";

interface AdminRequest {
  headers: RequestHeaders;
}

function toActor(session: UserSession): Actor {
  return {
    id: session.user.id,
    role: typeof session.user.role === "string" ? session.user.role : null,
  };
}

@Controller("admin/users")
@Roles([...ADMIN_ROLES])
export class AdminUsersController {
  constructor(private readonly users: AdminUsersService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(listAdminUsersQuerySchema))
    query: ListAdminUsersQuery
  ): Promise<ListAdminUsersResponse> {
    return this.users.list(query);
  }

  @Post(":id/soft-delete")
  softDelete(
    @Param("id", new ZodValidationPipe(idSchema)) id: string,
    @Session() session: UserSession,
    @Req() req: AdminRequest
  ): Promise<AdminUser> {
    return this.users.softDelete(id, toActor(session), req.headers);
  }

  @Post(":id/restore")
  restore(
    @Param("id", new ZodValidationPipe(idSchema)) id: string,
    @Session() session: UserSession
  ): Promise<AdminUser> {
    return this.users.restore(id, toActor(session));
  }

  @Delete(":id")
  remove(
    @Param("id", new ZodValidationPipe(idSchema)) id: string,
    @Session() session: UserSession,
    @Req() req: AdminRequest
  ): Promise<void> {
    return this.users.remove(id, toActor(session), req.headers);
  }
}
