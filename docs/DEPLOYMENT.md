# Deployment — Wearly

Production stack: Vercel (web) + Railway (API) + Supabase (Postgres) + EAS (Android preview). No Docker. Mobile talks directly to Railway; web proxies `/api/*` to Railway so the Better Auth session cookie stays on the web origin (no custom domain required).

## 0. Prerequisites

Accounts: GitHub, Vercel, Railway, Supabase, Expo, Resend. Local: Bun 1.3.14, Node >=22, `bunx eas-cli`, `railway`, `vercel`. Branch: latest work is on `dev`; `origin/main` is older — merge `dev` → `main` first or explicitly deploy `dev`.

Secrets to prepare: Supabase session pooler URI (port 5432), fresh `BETTER_AUTH_SECRET` (`openssl rand -base64 32`), `RESEND_API_KEY`, `EMAIL_FROM`, optional Google/Facebook OAuth IDs, `ADMIN_EMAIL`/`ADMIN_PASSWORD` (seed only).

## 1. Supabase

1. Create the project (or reuse). Copy the **Session pooler** URI, port `5432`, append `?sslmode=require`.
   - Use the **pooler** host (`*.pooler.supabase.com`), not the direct `db.<ref>.supabase.co` host. Render's outbound network is IPv4-only; the direct host resolves to IPv6 and fails with `ENETUNREACH ... :5432` (`cause: connect ENETUNREACH 2406:...`). The pooler is IPv4-capable.
   - `packages/db/src/client.ts` also sets `dns.setDefaultResultOrder("ipv4first")` so hosts publishing both A and AAAA records are dialled over IPv4.
2. Apply migrations before the first API deploy:
   ```bash
   DATABASE_URL='postgresql://...:5432/postgres?sslmode=require' \
     bun run --cwd packages/db db:migrate
   ```
3. Verify tables: `user`, `session`, `account`, `verification`, `admin_invites`.
4. Enable PITR/backups.

## 2. Vercel — API

Project: root directory = `apps/api`, enable "include files outside root". Install: `cd ../.. && bun install --frozen-lockfile`. Build: `cd ../.. && bun run build --filter=@wearly/api...`. Node 22.x. The `api/index.ts` serverless function wraps the NestJS app; `vercel.json` rewrites `/(.*)` → `/api`.

Env vars (Production):
- `NODE_ENV=production`
- `DATABASE_URL` = Supabase session pooler URI
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (image uploads; server-only)
- Create a public Storage bucket named `listing-photos` (10 MB limit, image/* MIME types)
- `BETTER_AUTH_SECRET` = fresh 32-byte secret
- `BETTER_AUTH_URL` = `https://<web>.vercel.app`
- `WEB_ORIGIN` = `https://<web>.vercel.app`
- `RESEND_API_KEY`, `EMAIL_FROM`, optional `RESEND_REPLY_TO`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` if Google is used
- `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` optional
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` for seeding only

Notes: `BETTER_AUTH_URL` points at the web origin because browser auth traffic is proxied through Vercel. `WEB_ORIGIN` drives CORS, trusted origins and invite links. Remove `ADMIN_PASSWORD` after seeding. Health check: `/api/health`. Vercel Hobby caps function duration at 10s — watch for `FUNCTION_INVOCATION_TIMEOUT` on cold starts.

## 3. Vercel — Web

Project: root directory `apps/web`, enable "include files outside root". Install: `cd ../.. && bun install --frozen-lockfile`. Build: `cd ../.. && bun run build --filter=@wearly/web...`. Output `.next`, Node 22.x.

Env vars (Production):
- `NEXT_PUBLIC_API_URL` = `https://<web>.vercel.app` (the web origin, NOT the API URL)
- `API_PROXY_URL` = `https://<api>.vercel.app`

Why: the browser auth client calls `/api/*` on the web origin; the rewrite forwards to the API host; the cookie is set on the Vercel host, so `hasSessionCookie()` and the `/admin` gate work without a custom domain. Local dev is unaffected (`API_PROXY_URL` unset, `NEXT_PUBLIC_API_URL=http://localhost:4000`).

`apps/web/vercel.json` also rewrites `/api/:path*` to the production API. Vercel applies `vercel.json` routes before Next.js routes, so this is the authoritative production proxy: it is committed with the code and cannot be silently dropped by a missing/misspelled `API_PROXY_URL` at build time. `next.config.ts` keeps the env-driven rewrite for previews. Current production: web `https://wearly-beige.vercel.app`, API `https://wearly-xni7.vercel.app`.

## 4. Seed the super admin

Fix the seed imports first (`apps/api/scripts/seed-super-admin.ts`), then run locally with the production `DATABASE_URL`:

```bash
DATABASE_URL='postgresql://...:5432/postgres?sslmode=require' \
  bun run --cwd apps/api db:seed:super-admin
```

Log in once, rotate `ADMIN_PASSWORD`, then remove it from Railway.

## 5. Android preview (EAS)

1. `cd apps/mobile && bunx eas-cli login`
2. `.easignore` excludes `.env`, so set EAS env vars directly:
   ```bash
   bunx eas-cli env:create --environment preview \
     --name EXPO_PUBLIC_API_URL \
     --value https://<api>.up.railway.app --visibility plaintext
   bunx eas-cli env:create --environment preview \
     --name EXPO_PUBLIC_GOOGLE_CLIENT_ID \
     --value <google web client id> --visibility plaintext
   ```
3. `bunx eas-cli build --platform android --profile preview` (APK, internal distribution).
4. For Google sign-in to work in the preview: register the EAS-managed keystore SHA-1 (from `bunx eas-cli credentials`) on the Google Cloud Android OAuth client for `com.parthpatel25.wearly`. The debug SHA-1 in the docs does not cover EAS builds.
5. `EXPO_PUBLIC_*` is baked at build time; changing the API URL requires a rebuild. No `expo-updates` config exists, so no OTA updates. Uninstall the old app before installing the preview APK (different signing key).

Mobile talks directly to Railway (not through Vercel); native has no same-origin requirement and stores the session in SecureStore.

## 6. Verification

- [ ] `GET https://<api>.vercel.app/api/health` → 200
- [ ] `GET https://<web>.vercel.app/api/health` → 200 (via rewrite)
- [ ] `GET https://<web>.vercel.app/api/auth/get-session` → 200 JSON (`null` when signed out)
- [ ] Web sign-up → OTP email → verify → session cookie on the Vercel host
- [ ] `/admin` loads after sign-in, redirects to `/sign-in` when signed out
- [ ] Admin invite create/accept works; invite links use the web origin
- [ ] Android preview: sign-up/sign-in, session survives app restart
- [ ] No CORS/cookie/DB errors in Vercel/Railway logs
- [ ] Supabase tables populated

### `/api/*` returns 404 on the web origin

`x-matched-path: /404` and `content-type: text/html` mean the request never
reached the API: Next.js served its own 404 page. Check, in order:

1. `apps/web/vercel.json` exists and its rewrite destination is the current API host (committed, so a redeploy picks it up).
2. `API_PROXY_URL` is set in **this** project (`<web>`, not `<api>`) under the **Production** environment, with no trailing slash. Env changes only apply to a *new* deployment, and the 404 page is a static file from the previous build (`last-modified` shows the build time).
3. The deployment currently aliased to the domain is the new one: the 404's `etag`/`last-modified` must change after a redeploy.

If the API answers `403 {"code":"INVALID_ORIGIN"}` instead of 404, the proxy
works but the API does not trust the web origin: set `BETTER_AUTH_URL` and
`WEB_ORIGIN` to the web origin on the API project and redeploy it.

If the proxied `Set-Cookie` misbehaves, the fallback is a custom domain later (`app.example.com` + `api.example.com`) with Better Auth `crossSubDomainCookies`, or serving the API inside the Vercel project.

## 7. Operations

- Apply DB migrations before each API deploy; never `db:push` in production.
- Keep Railway and Vercel env in sync with the deployed web URL.
- Rotating `BETTER_AUTH_SECRET` invalidates all sessions; use `BETTER_AUTH_SECRETS` for rollover.
- Rollback: Vercel instant rollback, Railway previous deployment. DB migrations are forward-only — back up first.
- Monitor `/api/health` externally.
EOF
echo "written"