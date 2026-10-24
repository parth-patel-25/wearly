import "../src/core/config/load-env.js";

import { db } from "@wearly/db/client";
import { user } from "@wearly/db/schema/auth";
import { eq } from "drizzle-orm";

/**
 * Seeds (or promotes) the initial super_admin so the admin panel is reachable
 * before anyone has accepted an invite.
 *
 * Reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the environment — the seed
 * never hard-codes credentials into the repo (docs/auth-and-database.md §12.4).
 *
 * The role column is written directly rather than via `auth.api.setRole`,
 * because that endpoint requires an already-authenticated admin session.
 *
 *   bun run --cwd apps/api db:seed:super-admin
 */

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!(email && password)) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment (see .env.example)"
    );
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  const { auth } = await import("../src/core/auth/auth.js");
  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  const [found] = existing;

  if (found) {
    await db
      .update(user)
      .set({ emailVerified: true, role: "super_admin" })
      .where(eq(user.id, found.id));
    console.log(`Promoted existing user ${email} (${found.id}) to super_admin`);
    return;
  }

  const created = await auth.api.signUpEmail({
    body: {
      email,
      name: email.split("@")[0] ?? "Admin",
      password,
    },
  });

  await db
    .update(user)
    .set({ emailVerified: true, role: "super_admin" })
    .where(eq(user.id, created.user.id));

  console.log(
    `Created super_admin ${email} (${created.user.id}). Rotate ADMIN_PASSWORD after first login.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(
      "Seed failed:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  });
