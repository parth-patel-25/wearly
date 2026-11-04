import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AllowAnonymous, Session } from "@thallesp/nestjs-better-auth";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { createListingSchema, idSchema } from "@wearly/shared/api/schemas";
import type { CreateListingInput, Listing } from "@wearly/shared/api/types";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { ListingsService } from "./listings.service.js";

@Controller("listings")
export class ListingsController {
  constructor(private readonly service: ListingsService) {}

  @Post()
  create(
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(createListingSchema)) body: CreateListingInput
  ): Promise<Listing> {
    return this.service.create(session.user.id, body);
  }

  @Get("public")
  @AllowAnonymous()
  listPublished(): Promise<Listing[]> {
    return this.service.listPublished();
  }

  @Get()
  list(@Session() session: UserSession): Promise<Listing[]> {
    return this.service.listByLender(session.user.id);
  }

  @Get(":id")
  @AllowAnonymous()
  get(@Param("id", new ZodValidationPipe(idSchema)) id: string): Promise<Listing | null> {
    return this.service.get(id);
  }
}
