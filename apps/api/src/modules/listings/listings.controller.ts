import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { AllowAnonymous, Session } from "@thallesp/nestjs-better-auth";
import {
  createListingSchema,
  discoverListingsSchema,
  idSchema,
} from "@wearly/shared/api/schemas";
import type {
  CreateListingInput,
  DiscoverListingsInput,
  DiscoverListingsResponse,
  Listing,
} from "@wearly/shared/api/types";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { ListingsService } from "./listings.service.js";
import { ListingsDiscoveryService } from "./listings-discovery.service.js";

@Controller("listings")
export class ListingsController {
  constructor(
    private readonly service: ListingsService,
    private readonly discovery: ListingsDiscoveryService
  ) {}

  @Post()
  create(
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(createListingSchema)) body: CreateListingInput
  ): Promise<Listing> {
    return this.service.create(session.user.id, body);
  }

  /**
   * `POST` on purpose: search coordinates must never appear in a URL, access
   * log or proxy log.
   */
  @Post("discover")
  @AllowAnonymous()
  discover(
    @Body(new ZodValidationPipe(discoverListingsSchema))
    body: DiscoverListingsInput
  ): Promise<DiscoverListingsResponse> {
    return this.discovery.discover(body);
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
  get(
    @Param("id", new ZodValidationPipe(idSchema)) id: string
  ): Promise<Listing | null> {
    return this.service.get(id);
  }
}
