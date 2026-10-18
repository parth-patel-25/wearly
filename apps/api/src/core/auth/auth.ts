import { expo } from "@better-auth/expo";
import { db } from "@wearly/db/client";
import {
  account,
  accountRelations,
  session as authSession,
  user as authUser,
  sessionRelations,
  userRelations,
  verification,
} from "@wearly/db/schema/auth";
import { ROLES } from "@wearly/shared/enums";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { admin } from "better-auth/plugins/admin";
import { userAc } from "better-auth/plugins/admin/access";
import { isProduction } from "../config/env.js";
import { emailLayout, sendEmail } from "../email/email.js";
import { ac, adminRole, superAdminRole } from "./auth.roles.js";

type SocialProviders = NonNullable<BetterAuthOptions["socialProviders"]>;

const authSchema = {
  account,
  accountRelations,
  session: authSession,
  sessionRelations,
  user: authUser,
  userRelations,
  verification,
};

/**
 * Providers are only registered when their credentials exist in `.env`.
 *
 * Google registers on `GOOGLE_CLIENT_ID` alone: mobile signs in with the
 * native idToken flow, which Better Auth verifies against Google's JWKS
 * (audience = clientId) — no client secret involved. The secret is only
 * needed for a browser authorization-code flow.
 */
function buildSocialProviders(): SocialProviders {
  const providers: SocialProviders = {};
  const [googleClientId, googleClientSecret] = [
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  ];
  const f = [
    process.env.FACEBOOK_CLIENT_ID,
    process.env.FACEBOOK_CLIENT_SECRET,
  ];
  if (googleClientId) {
    providers.google = googleClientSecret
      ? { clientId: googleClientId, clientSecret: googleClientSecret }
      : { clientId: googleClientId };
  }
  if (f[0] && f[1]) {
    providers.facebook = { clientId: f[0], clientSecret: f[1] };
  }
  return providers;
}

function trustedOrigins(): string[] {
  const origins = [
    "wearly://",
    process.env.WEB_ORIGIN ?? "http://localhost:3000",
  ];
  if (!isProduction()) {
    origins.push("exp://", "exp://**", "exp://192.168.*.*:*/**");
  }
  return origins;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDeleted(user: unknown): boolean {
  if (!isRecord(user)) {
    return false;
  }
  const { deletedAt } = user;
  return Boolean(deletedAt);
}

/**
 * `internalAdapter.findUserByEmail` returns `{ user, accounts }` while
 * `findUserById` returns the user with `accounts` beside its fields — accept
 * both shapes.
 */
function unwrapUser(record: unknown): unknown {
  if (!isRecord(record)) {
    return null;
  }
  if ("user" in record) {
    return record.user ?? null;
  }
  return record;
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
  databaseHooks: {
    session: {
      create: {
        // Backstop: never mint a session for a soft-deleted user (covers
        // OAuth callbacks and any path the before-hook above misses).
        before: async (session, ctx) => {
          if (!ctx) {
            return true;
          }
          const found = await ctx.context.internalAdapter.findUserById(
            session.userId
          );
          return !isDeleted(unwrapUser(found));
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Better Auth builds the URL against the API origin. Keep native deep
      // links (wearly://…) so the mobile app can receive the result; rewrite
      // everything else so web users land on the web verify page.
      const verifyUrl = new URL(url);
      const callback = verifyUrl.searchParams.get("callbackURL");
      if (!callback?.startsWith("wearly://")) {
        const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
        verifyUrl.searchParams.set("callbackURL", `${webOrigin}/verify-email`);
      }
      await sendEmail({
        html: emailLayout(
          "Confirm your email",
          `Verify <strong>${user.email}</strong>: <a href="${verifyUrl.toString()}">Verify email</a>`
        ),
        subject: "Verify your Wearly email",
        text: `Verify your email: ${verifyUrl.toString()}`,
        to: user.email,
      });
    },
  },
  hooks: {
    // Clean error for soft-deleted users on password sign-in.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") {
        return;
      }
      const email = String(ctx.body?.email ?? "").toLowerCase();
      const found = await ctx.context.internalAdapter.findUserByEmail(email);
      if (isDeleted(unwrapUser(found))) {
        throw new APIError("FORBIDDEN", {
          message: "This account has been deleted.",
        });
      }
    }),
  },
  plugins: [
    expo(),
    admin({
      ac,
      adminRoles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
      defaultRole: ROLES.USER,
      roles: {
        [ROLES.ADMIN]: adminRole,
        [ROLES.SUPER_ADMIN]: superAdminRole,
        [ROLES.USER]: userAc,
      },
    }),
  ],
  socialProviders: buildSocialProviders(),
  trustedOrigins: trustedOrigins(),
  user: {
    additionalFields: {
      // Soft-delete marker: never accepted as user input, always returned.
      deletedAt: {
        fieldName: "deleted_at",
        input: false,
        required: false,
        returned: true,
        type: "date",
      },
    },
  },
});
