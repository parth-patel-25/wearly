import { Body, Controller, Param, Post } from "@nestjs/common";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { Session } from "@thallesp/nestjs-better-auth";
import {
  disputeSchema,
  handoverAcknowledgeSchema,
  handoverConfirmSchema,
  idSchema,
  noShowSchema,
} from "@wearly/shared/api/schemas";
import type {
  DisputeInput,
  HandoverAcknowledgeInput,
  HandoverConfirmInput,
  NoShowInput,
  RentalDetail,
} from "@wearly/shared/api/types";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { RentalHandoverService } from "./rental-handover.service.js";
import { RentalReturnService } from "./rental-return.service.js";

/** Handover, issues, no-shows, disputes, return and completion. */
@Controller("rentals")
export class RentalHandoverController {
  constructor(
    private readonly handover: RentalHandoverService,
    private readonly returns: RentalReturnService
  ) {}

  @Post(":id/handover/start")
  startInspection(
    @Session() session: UserSession,
    @Param("id", new ZodValidationPipe(idSchema)) id: string
  ): Promise<RentalDetail> {
    return this.handover.startInspection(id, session.user.id);
  }

  @Post(":id/handover/confirm")
  confirmHandover(
    @Session() session: UserSession,
    @Param("id", new ZodValidationPipe(idSchema)) id: string,
    @Body(new ZodValidationPipe(handoverConfirmSchema))
    _body: HandoverConfirmInput
  ): Promise<RentalDetail> {
    return this.handover.confirmHandover(id, session.user.id);
  }

  @Post(":id/handover/acknowledge")
  acknowledgeHandover(
    @Session() session: UserSession,
    @Param("id", new ZodValidationPipe(idSchema)) id: string,
    @Body(new ZodValidationPipe(handoverAcknowledgeSchema))
    _body: HandoverAcknowledgeInput
  ): Promise<RentalDetail> {
    return this.handover.acknowledgeHandover(id, session.user.id);
  }

  @Post(":id/handover/issues")
  reportIssue(
    @Session() session: UserSession,
    @Param("id", new ZodValidationPipe(idSchema)) id: string,
    @Body(new ZodValidationPipe(disputeSchema)) body: DisputeInput
  ): Promise<RentalDetail> {
    return this.handover.reportIssue(id, session.user.id, body);
  }

  @Post(":id/no-show")
  reportNoShow(
    @Session() session: UserSession,
    @Param("id", new ZodValidationPipe(idSchema)) id: string,
    @Body(new ZodValidationPipe(noShowSchema)) body: NoShowInput
  ): Promise<RentalDetail> {
    return this.handover.reportNoShow(id, session.user.id, body);
  }

  @Post(":id/disputes")
  openDispute(
    @Session() session: UserSession,
    @Param("id", new ZodValidationPipe(idSchema)) id: string,
    @Body(new ZodValidationPipe(disputeSchema)) body: DisputeInput
  ): Promise<RentalDetail> {
    return this.returns.openDispute(id, session.user.id, body);
  }

  @Post(":id/return")
  markReturned(
    @Session() session: UserSession,
    @Param("id", new ZodValidationPipe(idSchema)) id: string
  ): Promise<RentalDetail> {
    return this.returns.markReturned(id, session.user.id);
  }

  @Post(":id/return/confirm")
  confirmReturn(
    @Session() session: UserSession,
    @Param("id", new ZodValidationPipe(idSchema)) id: string
  ): Promise<RentalDetail> {
    return this.returns.confirmReturn(id, session.user.id);
  }
}
