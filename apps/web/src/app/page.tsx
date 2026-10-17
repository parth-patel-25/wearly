import { redirect } from "next/navigation";
import { hasSessionCookie } from "@/lib/session-cookie";

/**
 * Root is an auth gate, not a page: no session cookie → sign in; any
 * cookie-holder → the admin dashboard (the admin shell still enforces the
 * real role check server-side via the API).
 */
export default async function Home() {
  redirect((await hasSessionCookie()) ? "/admin" : "/sign-in");
}
