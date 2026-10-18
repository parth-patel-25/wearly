# Decision: database (Drizzle + Postgres) and authentication (Better Auth)

**Status:** agreed, implementation in progress — tracked in
[auth-and-admin-plan.md](auth-and-admin-plan.md)
**Decided:** 2026-09-27 · **Amended:** 2026-10-15
**Applies to:** `apps/api` (NestJS), `apps/web` (Next.js), `apps/mobile` (Expo)

This is the record of *what we decided* and *how to implement it*. Nothing
here was wired up at the time of writing — `apps/api` currently uses an
in-memory store so the shared contract can be exercised end to end.

## Amendment — 2026-10-15 (Supabase hosting + admin panel)

The implementation pass confirmed the following additions on top of the original
decision (auth framework unchanged — still **Better Auth**):

| Concern | Choice |
| --- | --- |
| Hosting | **Supabase** Postgres (`DATABASE_URL` session pooler, port 5432). The "Hosting — still open" options below are now closed. |
| Sign-up methods | Email + password, **Google** OAuth, **Facebook** OAuth, email verification via **Resend** |
| Clients | Web **and** Mobile both get real auth this pass |
| Roles | `user` → `admin` → `super_admin`, via the Better Auth **admin plugin** with custom access control |
| Admin surface | Web-only panel at `/admin`; all admin operations go through Nest-owned `/api/admin/*` (never the raw Better Auth `/admin/*` in the browser) |
| Super-admin | Seeded directly in the database; only super-admin can invite/revoke admins (true email invites, hashed single-use tokens, 7-day expiry) |
| Soft delete | `user.deleted_at` (Better Auth `additionalFields`); blocks session creation, revokes existing sessions, visible in admin with Restore |
| Hard delete | Permanent via Better Auth `auth.api.removeUser` (auth account + row) |

RLS is **not** used — the API is the only database consumer (Supabase
anon/service keys unused). `packages/shared` stays ORM-free.

Step-by-step checklist for building all of this:
**[auth-and-admin-plan.md](auth-and-admin-plan.md)**.

---

## 1. Decision

| Concern | Choice | Rationale |
| --- | --- | --- |
| Database | **PostgreSQL** | Already agreed. Relational data, strong constraints, good JSON support. |
| ORM | **Drizzle** | Already agreed. Type-safe SQL, no runtime codegen step, first-class Zod-like inference, tiny bundle. |
| Driver | **`postgres.js`** | Puredriver-free, no native build, works on every runtime we target. `pg` would need `pg-native` for ~10% more speed. |
| Migrations | **drizzle-kit** (`generate` + `migrate`) | SQL files in git, reviewable diffs. |
| Auth | **Better Auth** | Already agreed. Self-hosted, TypeScript-first, has first-class Expo support, and a Drizzle adapter. |

Pinned versions at time of writing (re-check before implementing):

```
better-auth            1.7.6
@better-auth/expo      1.7.6
auth  (CLI)            1.7.6
@thallesp/nestjs-better-auth  2.8.0
drizzle-orm            0.45.3
drizzle-kit            0.31.11
postgres               3.4.9
```

### Hosting — still open

Deliberately undecided, because it changes only `DATABASE_URL` and nothing else:

- local `docker compose` with `postgres:17-alpine` (recommended for development)
- Neon (serverless) — note `postgres.js` uses prepared statements by default, which
  some serverless providers reject; opt out with `prepare: false` if needed
- Supabase — also gives auth/storage, but we would still use Better Auth

---

## 2. Why Better Auth over the alternatives

- **vs Clerk**: Clerk is hosted and has an official Expo SDK, but ties the mobile
  app to their runtime and bills per MAU. Better Auth keeps the whole auth surface
  inside `apps/api`, where we already own sessions, cookies and CORS.
- **vs hand-rolled JWT**: session management, rotation, and revocation are a large
  amount of security-sensitive code to own.
- **vs NextAuth/Auth.js**: superseded by Better Auth (same company), and
  NextAuth's model is tightly coupled to Next.js — we need one auth server shared
  by web, mobile *and* the Nest API.

---

## 3. Target architecture

```
                    ┌──────────────────────────────┐
  apps/web  ───────▶│  apps/api  (NestJS, ESM)     │
  apps/mobile ─────▶│  /api/auth/*  ← Better Auth  │
                    │  /api/notes/* ← our zod API  │
                    └───────────────┬──────────────┘
                                    │ drizzle-orm (postgres.js)
                                    ▼
                              PostgreSQL
```

The auth server lives in Nest, **not** in Next. One origin, one session cookie,
one place to enforce authorization, and the mobile app talks to the same host it
already uses for the rest of the API.

New package: `packages/db` (schema + drizzle client), consumed only by
`apps/api`. `packages/shared` stays dependency-free of the ORM — it must remain
importable by the browser and by React Native.

### `apps/api` source layout

`apps/api/src` follows the `common` / `core` / `modules` split used by the
client apps (`shared` / `core` / `features`):

```
apps/api/src/
├── common/               # Cross-cutting Nest building blocks
│   ├── interceptors/     # e.g. logging.interceptor.ts
│   └── pipes/            # e.g. zod-validation.pipe.ts
├── core/                 # App-wide infrastructure
│   ├── auth/             # Better Auth config + role definitions
│   ├── config/           # env loading, environment helpers
│   └── email/            # transactional email
├── modules/              # Feature-based business domains
│   ├── admin/            # admin users + invites
│   ├── health/
│   └── notes/
├── app.module.ts         # Root module wiring feature modules
└── main.ts               # Bootstrap
```

Two reference layers are **not** duplicated here because the monorepo already
provides them:

| NestJS reference layer | Wearly equivalent |
|---|---|
| `shared/` (mailer, prisma) | `packages/shared`, `packages/db` |
| `core/database` + `modules/*/entities` | `packages/db/src/schema` (Drizzle) |
| `modules/*/dto` | Zod schemas in `packages/shared/src/api/schemas.ts` |

#### Shared enums

Enumerated values (roles, invite status, environment names) live in
`packages/shared/src/enums/`, are exported as `@wearly/shared/enums`, and follow
the const-object + derived-union pattern rather than the TypeScript `enum`
keyword:

```ts
export const ROLES = { ADMIN: "admin", SUPER_ADMIN: "super_admin", USER: "user" } as const;
export const USER_ROLES = [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN] as const;
export type UserRole = (typeof USER_ROLES)[number];
```

The Zod schemas in `../api/schemas.ts` build from these tuples
(`z.enum(USER_ROLES)`), so the runtime validator, the static type and both
clients share one source. Never re-type `"admin"`, `"super_admin"`, `"user"`,
`"pending"`, `"production"`, etc. — import the member.

---

## 4. Implementation plan

### Step 1 — `packages/db`

```bash
mkdir packages/db
bun add --cwd packages/db drizzle-orm postgres
bun add --cwd packages/db -D drizzle-kit
```

`packages/db/src/client.ts`

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL ?? "", { max: 10 });

export const db = drizzle(client, { schema });
export type Database = typeof db;
```

> Migrations need a **separate** connection with `max: 1`. Do not reuse this pool.

`packages/db/drizzle.config.ts`

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
```

Add scripts: `db:generate`, `db:migrate`, `db:studio`.

> `packages/db` will be consumed by `apps/api` (Node/ESM) only. Keep it out of
> `apps/web` and `apps/mobile` so `drizzle-orm` never reaches a client bundle.

### Step 2 — Better Auth schema

Better Auth owns its tables. Generate them **into our Drizzle schema** rather than
hand-writing them:

```bash
bun x auth@latest generate --config apps/api/src/auth.ts --output packages/db/src/schema/auth.ts
```

This produces `user`, `session`, `account`, `verification` (plus `organization`
etc. if those plugins are enabled). Re-run it whenever a plugin is added.

### Step 3 — `apps/api/src/auth.ts`

```ts
import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { db } from "@wearly/db";
import * as authSchema from "@wearly/db/schema/auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: { enabled: true },
  trustedOrigins: [
    "wearly://",
    ...(process.env.NODE_ENV === "development"
      ? ["exp://", "exp://**", "exp://192.168.*.*:*/**"]
      : []),
  ],
  plugins: [expo()],
});
```

Notes:
- Import from `better-auth/minimal` when using an adapter — it skips the bundled
  dialects and is meaningfully smaller.
- The `exp://` wildcards are **development only**. Never ship them.
- `wearly://` must match `"scheme"` in `apps/mobile/app.json` (it is already
  `wearly`).

### Step 4 — mount in Nest

```bash
bun add --cwd apps/api better-auth @better-auth/expo @thallesp/nestjs-better-auth
```

`main.ts` — body parsing must be off so Better Auth sees the raw body:

```ts
const app = await NestFactory.create(AppModule, {
  bodyParser: false, // Required by Better Auth
});
```

The Nest integration **re-adds** the JSON/urlencoded parsers for non-auth routes
(configurable via `AuthModule.forRoot({ auth, bodyParser: { … } })`), so
`@Body()` and our `ZodValidationPipe` keep working. Do not "fix" this by removing
the flag.

`app.module.ts`

```ts
imports: [AuthModule.forRoot({ auth })]
```

### Step 5 — protect routes

> ⚠️ **The integration registers `AuthGuard` globally, so every route becomes
> protected by default.** This will lock down the existing API.

- `HealthController` → add `@AllowAnonymous()`
- `NotesController` → decide deliberately: `@AllowAnonymous()` to preserve current
  behaviour, or `@Session()` to require a user and scope every query by
  `session.user.id`

`HealthController` is the most likely thing to break in a health check or uptime
probe — annotate it first.

### Step 6 — clients

**Web** (`apps/web/src/lib/auth-client.ts`)

```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});
```

**Mobile** (`apps/mobile/src/lib/auth-client.ts`)

```ts
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  plugins: [expoClient({ scheme: "wearly", storage: SecureStore })],
});
```

Extra mobile dependencies: `expo-secure-store` (session storage),
`expo-web-browser` + `expo-linking` + `expo-constants` (Facebook's system
browser flow), `expo-network`, and
`@react-native-google-signin/google-signin` (native Google Sign-In).

### Mobile Google sign-in — native Google Sign-In SDK

Google sign-in on mobile uses **Google Identity Services** via
`@react-native-google-signin/google-signin` — no browser, no OAuth
redirect. (An earlier `expo-auth-session` browser flow was abandoned:
Google's Oct 2023 policy disables custom-URI-scheme redirects on new
Android OAuth clients by default, which produced
`Error 400: invalid_request` + "Access blocked — OAuth 2.0 policy for
keeping apps secure" even with the Advanced Settings opt-in.)

1. `useGoogleSignIn` (`features/auth/hooks/use-google-sign-in.ts`) calls
   `GoogleSignin.configure({ webClientId: EXPO_PUBLIC_GOOGLE_CLIENT_ID })`
   once, then on tap `hasPlayServices` + `signIn()` — Play Services shows
   the native account picker and returns an **ID token**
   (`result.data.idToken`; its `aud` claim is the configured client ID).
2. The app posts `authClient.signIn.social({ provider: "google", idToken })`
   to the API. Better Auth verifies the token cryptographically against
   Google's JWKS (`issuer` + `audience = GOOGLE_CLIENT_ID`) — no secret
   involved (`@better-auth/core` google provider `idToken` config).
3. A session cookie is minted and stored in SecureStore via `expoClient`.

**Google Console prerequisites:**

- **Android client** (package `com.parthpatel25.wearly` + the **debug
  SHA-1**) — Play Services refuses sign-in without a matching Android
  client (native error code 10 / `DEVELOPER_ERROR`). The debug SHA-1
  (project keystore `android/app/debug.keystore`, standard RN debug
  fingerprint) is:
  `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
  (read it with
  `keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android`).
- **Web client** (`wearly-web`, same project) — the `webClientId` that
  mints the ID token; both env vars point at its Client ID (origins
  `http://localhost:3000`, no redirect URIs — unused by the native flow).
  The secret is stored but unused for idToken verification.
- **Consent screen** — publish it, or add the signing-in account under
  *Test users* while it is in Testing.

**Env contract**:

| Variable | Where it is read | Must be |
|---|---|---|
| `GOOGLE_CLIENT_ID` | API (root `.env`, `apps/api/src/auth.ts`) | the client ID the app signs with (token audience) |
| `GOOGLE_CLIENT_SECRET` | API (root `.env`) | unused for the mobile flow; empty is fine |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | mobile app (`apps/mobile/.env`) | same client ID (SDK `webClientId`) |

Expo inlines `EXPO_PUBLIC_*` from **`apps/mobile/.env`** (the app project
root), not the repo-root `.env` — keep the Google var next to
`EXPO_PUBLIC_API_URL` there. A missing var degrades to a "Google sign-in
is not configured" toast.

`buildSocialProviders` registers `google` when `GOOGLE_CLIENT_ID` alone
exists — the secret is only required for browser code flows (Facebook still
uses the system-browser flow and keeps ID+secret gating).

Gotcha: the API's `GOOGLE_CLIENT_ID` must equal the SDK's `webClientId`,
otherwise verification fails with `Invalid id token` (audience mismatch).

iOS: `promptGoogleSignIn` toasts "not available on this platform yet" —
an iOS OAuth client + `iosClientId` wiring is pending.

### Step 7 — authenticated requests from the mobile app

Cookies do not ride along automatically on native. The session cookie must be
read from SecureStore and set manually — and **`@wearly/shared`'s `createApiClient`
does not currently support request headers**, so it needs extending:

```ts
const cookies = await authClient.getCookie();
await api.notes.list(); // must send `Cookie: ${cookies}` and `credentials: "omit"`
```

Plan: add an optional `headers?: HeadersInit` (or `getCookie?: () => Promise<string>`)
option to `createApiClient` in `packages/shared`, keeping it framework-agnostic.
This is a change to the shared contract, so treat it as its own small task.

---

## 5. Gotchas to check during implementation

1. **The global `AuthGuard` silently protects everything** (Step 5). Highest-risk
   item in this document.
2. **Do not disable package exports in Metro.** `@thallesp/nestjs-better-auth`
   and Better Auth both rely on `package.json` `exports`, which Expo enables by
   default. Our custom `apps/mobile/metro.config.js` must keep
   `unstable_enablePackageExports` at its default — if Metro resolution breaks,
   check this first.
3. **CommonJS is unsupported.** Better Auth's Node handler is ESM-only. `apps/api`
   and `packages/shared` are already `"type": "module"`, so this is satisfied —
   keep it that way.
4. **`packages/shared` must stay ORM-free.** If a Better Auth or Drizzle type
   ever needs to cross into the shared contract, model it as a plain zod schema
   instead of importing the ORM type.
5. **Mobile deep links need the scheme in `trustedOrigins`.** A mismatch shows up
   as a silent OAuth callback failure, not an error.
6. **Re-run `auth generate` when adding plugins** (admin, organization, passkey…).
   The schema and the config must agree or Better Auth fails at runtime.
7. **Neon/serverless Postgres + `postgres.js`**: prepared statements are on by
   default and can be rejected. Set `prepare: false` if requests fail oddly.
8. **Rotating `BETTER_AUTH_SECRET` invalidates sessions.** Use
   `BETTER_AUTH_SECRETS` (plural) to roll over without logging everyone out.
   Generate with `openssl rand -base64 32`.

---

## 6. Environment variables to add

Not yet present in `.env.example` — add them at implementation time so the file
never carries unused entries:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/wearly
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:4000
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

`.env` stays gitignored. The API already loads `../../.env` then `.env` via
`ConfigModule.forRoot({ isGlobal: true, envFilePath: [...] })`, so a root `.env`
works once the paths line up.

---

## 7. Definition of done

- [ ] `packages/db` exists and is imported **only** by `apps/api`
- [ ] `drizzle-kit generate` produces reviewable SQL in git; `migrate` applies cleanly to an empty database
- [ ] `NotesService` reads and writes through Drizzle; the in-memory `Map` is gone
- [ ] `auth generate` output is committed and matches the Better Auth config
- [ ] `GET /api/health` still returns 200 without a session
- [ ] Email sign-up/sign-in works from web **and** from a device
- [ ] A protected route rejects an unauthenticated request with 401
- [ ] Mobile authenticated calls send the SecureStore cookie
- [ ] `bun run build`, `bun run typecheck` and `bun run lint` are all clean
