import { Body, Controller, Post } from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { createUploadUrlSchema } from "@wearly/shared/api/schemas";
import type {
  CreateUploadUrlInput,
  CreateUploadUrlResponse,
} from "@wearly/shared/api/types";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { StorageService } from "./storage.service.js";

@Controller("storage")
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post("upload-url")
  async createUploadUrl(
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(createUploadUrlSchema))
    body: CreateUploadUrlInput,
  ): Promise<CreateUploadUrlResponse> {
    return this.storage.createUploadUrl(
      session.user.id,
      body.filename,
      body.contentType,
    );
  }
}