import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { Session } from "@thallesp/nestjs-better-auth";
import {
  favouriteInputSchema,
  idSchema,
  mergeFavouritesSchema,
} from "@wearly/shared/api/schemas";
import type {
  FavouriteInput,
  FavouritesResponse,
  Listing,
  MergeFavouritesInput,
} from "@wearly/shared/api/types";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { FavouritesService } from "./favourites.service.js";

/**
 * Session-scoped: every endpoint needs `@Session()`. This is the "save these
 * pieces" surface, so the Save button and the profile grid hit the same
 * lender-scoped list the owner sees.
 */
@Controller("favourites")
export class FavouritesController {
  constructor(private readonly service: FavouritesService) {}

  @Get()
  list(@Session() session: UserSession): Promise<Listing[]> {
    return this.service.getByUser(session.user.id);
  }

  @Post()
  save(
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(favouriteInputSchema)) body: FavouriteInput
  ): Promise<void> {
    return this.service.save(session.user.id, body.listingId);
  }

  @Delete(":listingId")
  remove(
    @Session() session: UserSession,
    @Param("listingId", new ZodValidationPipe(idSchema)) listingId: string
  ): Promise<void> {
    return this.service.remove(session.user.id, listingId);
  }

  @Post("merge")
  merge(
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(mergeFavouritesSchema))
    body: MergeFavouritesInput
  ): Promise<FavouritesResponse> {
    return this.service.merge(session.user.id, body.listingIds);
  }
}
