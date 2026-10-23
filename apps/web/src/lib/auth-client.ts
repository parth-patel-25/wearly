import { adminClient, emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Browser client for Better Auth, talking to the NestJS API at
 * `NEXT_PUBLIC_API_URL/api/auth`. `credentials: "include"` carries the session
 * cookie cross-origin (localhost:3000 → localhost:4000 in dev; cookies ignore
 * ports, so the jar is shared).
 *
 * `adminClient()` gives `useSession().data.user.role` its type; the actual
 * authorization lives on the server.
 */
export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [adminClient(), emailOTPClient()],
});
