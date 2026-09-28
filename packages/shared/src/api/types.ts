/**
 * Types re-exported from the zod schemas, so clients can depend on types alone
 * and never pull the runtime validators into their bundle.
 */
export type {
  CreateNoteInput,
  ErrorResponse,
  HealthResponse,
  ListNotesQuery,
  ListNotesResponse,
  Note,
  UpdateNoteInput,
} from "./schemas.js";
