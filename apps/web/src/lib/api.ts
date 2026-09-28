import { createApiClient } from "@wearly/shared/api/client";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Server-side API client. `NEXT_PUBLIC_*` is inlined at build time, so this
 * module must only be used from Server Components, Server Actions or route
 * handlers.
 */
export const api = createApiClient({ baseUrl });
