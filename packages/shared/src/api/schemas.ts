import { z } from "zod";

/** Shape returned by `GET /api/health`. */
export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.iso.datetime(),
  uptime: z.number().nonnegative(),
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;

/** A single note record. */
export const noteSchema = z.object({
  body: z.string().max(10_000),
  createdAt: z.iso.datetime(),
  id: z.string().min(1),
  title: z.string().min(1).max(200),
});
export type Note = z.infer<typeof noteSchema>;

/** Body accepted by `POST /api/notes`. */
export const createNoteSchema = z.object({
  body: z.string().max(10_000).default(""),
  title: z.string().trim().min(1, "title is required").max(200),
});
export type CreateNoteInput = z.infer<typeof createNoteSchema>;

/** Body accepted by `PATCH /api/notes/:id`. Every field is optional. */
export const updateNoteSchema = z.object({
  body: z.string().max(10_000).optional(),
  title: z.string().trim().min(1).max(200).optional(),
});
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

/** Query string accepted by `GET /api/notes`. */
export const listNotesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type ListNotesQuery = z.infer<typeof listNotesQuerySchema>;

/** Response of `GET /api/notes`. */
export const listNotesResponseSchema = z.object({
  items: z.array(noteSchema),
  total: z.number().int().nonnegative(),
});
export type ListNotesResponse = z.infer<typeof listNotesResponseSchema>;

/** Route params for any `/:id` endpoint, when validated as a whole object. */
export const idParamSchema = z.object({ id: z.string().min(1) });

/**
 * A single `:id` route param, validated on its own.
 *
 * `@Param("id", pipe)` hands the pipe the param *value* (a string), not the
 * params object — so this scalar schema is what `@Param("id", …)` needs.
 */
export const idSchema = z.string().min(1);

/** Nest's default error body, narrowed to the fields clients rely on. */
export const errorResponseSchema = z.object({
  error: z.string().optional(),
  message: z.string(),
  statusCode: z.number().int(),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
