import { createApiClient } from "@wearly/shared/api/client";

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

/** Typed client for the NestJS API, shared with the web app. */
export const api = createApiClient({ baseUrl });
