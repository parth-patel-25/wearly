import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  createNoteSchema,
  idSchema,
  listNotesQuerySchema,
  updateNoteSchema,
} from "@wearly/shared/api/schemas";
import type {
  CreateNoteInput,
  ListNotesQuery,
  ListNotesResponse,
  Note,
  UpdateNoteInput,
} from "@wearly/shared/api/types";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { NotesService } from "./notes.service.js";

@Controller("notes")
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(listNotesQuerySchema)) query: ListNotesQuery
  ): ListNotesResponse {
    return this.notes.list(query);
  }

  @Get(":id")
  get(@Param("id", new ZodValidationPipe(idSchema)) id: string): Note {
    return this.notes.get(id);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createNoteSchema)) body: CreateNoteInput
  ): Note {
    return this.notes.create(body);
  }

  @Patch(":id")
  update(
    @Param("id", new ZodValidationPipe(idSchema)) id: string,
    @Body(new ZodValidationPipe(updateNoteSchema)) body: UpdateNoteInput
  ): Note {
    return this.notes.update(id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", new ZodValidationPipe(idSchema)) id: string): void {
    this.notes.remove(id);
  }
}
