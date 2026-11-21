import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { Session } from "@thallesp/nestjs-better-auth";
import {
  createRentalSchema,
  idSchema,
  listRentalsQuerySchema,
} from "@wearly/shared/api/schemas";
import type {
  CreateRentalInput,
  ListRentalsQuery,
  ListRentalsResponse,
  RentalDetail,
} from "@wearly/shared/api/types";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { RentalListService } from "./rental-list.service.js";
import { RentalReadService } from "./rental-read.service.js";
import { RentalsService } from "./rentals.service.js";

@Controller("rentals")
export class RentalsController {
  constructor(
    private readonly service: RentalsService,
    private readonly read: RentalReadService,
    private readonly listService: RentalListService
  ) {}

  @Post()
  create(
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(createRentalSchema)) body: CreateRentalInput
  ): Promise<RentalDetail> {
    return this.service.create(session.user.id, body);
  }

  @Get()
  list(
    @Session() session: UserSession,
    @Query(new ZodValidationPipe(listRentalsQuerySchema))
    query: ListRentalsQuery
  ): Promise<ListRentalsResponse> {
    return this.listService.list(session.user.id, query);
  }

  @Get(":id")
  detail(
    @Session() session: UserSession,
    @Param("id", new ZodValidationPipe(idSchema)) id: string
  ): Promise<RentalDetail> {
    return this.read.detail(id, session.user.id);
  }
}
