import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import {
  getItem,
  getItemAsync,
  setItem,
  setItemAsync,
} from "expo-secure-store";

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Native client for Better Auth, talking to the NestJS API at
 * `EXPO_PUBLIC_API_URL/api/auth`.
 *
 * The `expoClient` plugin does the three things native has no ambient
 * equivalent for: it stores the session cookie in SecureStore (there is no
 * cookie jar on native), rewrites relative callback URLs into `wearly://`
 * deep links, and opens OAuth in the system browser with the cookie handed
 * back through the authorization proxy. The scheme matches `app.json` and the
 * API's `trustedOrigins` entry (`wearly://`).
 */
export const authClient = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      scheme: "wearly",
      storage: { getItem, getItemAsync, setItem, setItemAsync },
    }),
  ],
});
