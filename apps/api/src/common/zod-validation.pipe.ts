import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from "@nestjs/common";
import type { ZodType } from "zod";

/**
 * Validates and coerces a request payload with a zod schema from
 * `@wearly/shared`, so the API and both clients are driven by one contract.
 *
 * Usage: `@Body(new ZodValidationPipe(createNoteSchema)) dto: CreateNoteInput`
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        errors: result.error.issues.map((issue) => ({
          message: issue.message,
          path: issue.path.join("."),
        })),
        message: "Validation failed",
        statusCode: 400,
      });
    }

    return result.data;
  }
}
