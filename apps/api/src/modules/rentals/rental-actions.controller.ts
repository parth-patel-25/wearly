import { Body, Controller, Param, Post } from "@nestjs/common";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { Session } from "@thallesp/nestjs-better-auth";
import {
  declineRentalSchema,
  idSchema,
  meetupProposalSchema,
  rentalReasonSchema,
} from "@wearly/shared/api/schemas";
import type {
  DeclineRentalInput,
  MeetupProposalInput,
  RentalDetail,
  RentalReasonInput,
} from "@wearly/shared/api/types";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { RentalLifecycleService } from "./rental-lifecycle.service.js";
import { RentalMeetupService } from "./rental-meetup.service.js";

/** Request decisions, meetup negotiation and arrival. */
@Controller("rentals")
export class RentalActionsController {
  constructor(
    private readonly lifecycle: RentalLifecycleService,
    private readonly meetups: RentalMeetupService
  ) {}

  @Post(":id/accept")
  accept(
    @Session() session: UserSession,
    @Param("id", new ZodValidationPipe(idSchema)) id: string
  ): Promise<RentalDetail> {
    return this.lifecycle.accept(id, session.user.id);
  }

  @Post(":id/decline")
  decline(
    @Session() session: UserSession,
    @Param("id", new ZodValidationPipe(idSchema)) id: string,
    @Body(new ZodValidationPipe(declineRentalSchema)) body: DeclineRentalInput
  ): Promise<RentalDetail> {
    return this.lifecycle.decline(id, session.user.id, body);
  }

  @Post(":id/cancel")
  cancel(
    @Session() session: UserSession,
    @Param("id", new ZodValidationPipe(idSchema)) id: string,
    @Body(new ZodValidationPipe(rentalReasonSchema)) body: RentalReasonInput
  ): Promise<RentalDetail> {
    return this.lifecycle.cancel(id, session.user.id, body);
  }

  @Post(":id/payment/retry")
  retryPayment(
    @Session() session: UserSession,
    @Param("id", new ZodValidationPipe(idSchema)) id: string
  ): Promise<RentalDetail> {
    return this.lifecycle.retryPayment(id, session.user.id);
  }

  @Post(":id/meetup/proposals")
  proposeMeetup(
    @Session() session: UserSession,
    @Param("id", new ZodValidationPipe(idSchema)) id: string,
    @Body(new ZodValidationPipe(meetupProposalSchema))
    body: MeetupProposalInput
  ): Promise<RentalDetail> {
    return this.meetups.propose(id, session.user.id, body);
  }

  @Post(":id/meetup/proposals/:proposalId/accept")
  acceptMeetup(
    @Session() session: UserSession,
    @Param("id", new ZodValidationPipe(idSchema)) id: string,
    @Param("proposalId", new ZodValidationPipe(idSchema)) proposalId: string
  ): Promise<RentalDetail> {
    return this.meetups.acceptProposal(id, proposalId, session.user.id);
  }

  @Post(":id/check-in")
  checkIn(
    @Session() session: UserSession,
    @Param("id", new ZodValidationPipe(idSchema)) id: string
  ): Promise<RentalDetail> {
    return this.meetups.checkIn(id, session.user.id);
  }
}
