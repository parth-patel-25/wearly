import { createApiClient } from "@wearly/shared/api/client";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Browser-side API client. Unlike the server client in `src/lib/api.ts`, this
 * one sends `credentials: "include"` so the Better Auth session cookie rides
 * along to the `/api/admin/*` endpoints.
 */
export const browserApi = createApiClient({ baseUrl, credentials: "include" });
