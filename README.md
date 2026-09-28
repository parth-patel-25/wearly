# Wearly

Turborepo monorepo: **Next.js** web, **NestJS** API, **Expo / React Native** mobile.
Bun is the package manager and task runner; Node runs the apps.

## Stack

| Area | Choice |
| --- | --- |
| Build / orchestration | Turborepo 2.11, Bun 1.3+ |
| Language | TypeScript 6.0.3 (`strict`) everywhere |
| Lint / format | Ultracite (Biome 2.5) — single root `biome.jsonc` |
| Web | Next.js 16.3 (App Router), Tailwind CSS v4, shadcn/ui, HeroUI v3 |
| Mobile | Expo SDK 57, React Native 0.86, Expo Router, Uniwind 1.12, HeroUI Native 1.0 |
| API | NestJS 12 (ESM), zod validation, no database yet |
| Contracts | `@wearly/shared` — zod schemas + inferred types + typed fetch client |

## Layout

```
apps/
  web/       Next.js — shadcn/ui + HeroUI web
  mobile/    Expo Router — HeroUI Native + Uniwind
  api/       NestJS REST API (ESM)
packages/
  shared/        zod schemas, API types, route constants, typed client
  design-tokens/ OKLCH colour/radius/type tokens — the single source of truth
  ui/            shadcn/ui components (web)
  ui-native/     shared native providers and layout primitives
  tsconfig/      base TypeScript configs
docs/
  auth-and-database.md   planned Drizzle + Postgres + Better Auth work
```

## Getting started

```bash
bun install
cp .env.example .env      # optional; sensible localhost defaults apply

bun run dev               # all three apps via turbo
bun run build             # web + api + shared
bun run typecheck         # tsc --noEmit across every package
bun run lint              # ultracite check
bun run check             # typecheck + lint
bun run fix               # ultracite fix (auto-format)
```

Individual apps:

```bash
bun run dev --filter=@wearly/web      # http://localhost:3000
bun run dev --filter=@wearly/api      # http://localhost:4000/api
bun run dev --filter=@wearly/mobile   # Expo dev server
```

## Design tokens and cross-platform consistency

`packages/design-tokens` is the only place colours are defined. It is consumed
three ways:

- `tokens.css` — the raw OKLCH custom properties (light + `.dark`)
- `theme.css` — maps them onto Tailwind v4 names via `@theme inline`, so
  `bg-background`, `text-muted-foreground`, `border-border`, `rounded-lg` mean
  the same thing on web and mobile
- `heroui.css` — maps them onto HeroUI's own token names (`--accent`,
  `--surface`, `--danger`, …) so HeroUI web and HeroUI Native inherit the same
  palette

Import order matters. `tailwindcss` must come first, and `heroui.css` must come
*after* `@heroui/styles` so it wins the cascade. See
`apps/web/src/app/globals.css` and `apps/mobile/src/global.css`.

## The API contract

`packages/shared` is the single contract for all three apps:

```ts
// apps/api — validate and return
@Post()
create(@Body(new ZodValidationPipe(createNoteSchema)) body: CreateNoteInput): Note

// apps/web and apps/mobile — typed calls
import { createApiClient } from "@wearly/shared/api/client";
const api = createApiClient({ baseUrl: "http://localhost:4000" });
await api.notes.create({ title: "Hello" });
```

Responses are validated on the client too, so a breaking change fails
type-checking first and surfaces as a typed `ApiError` at runtime. Each module
has its own subpath export (`@wearly/shared/api/schemas`, `/types`, `/routes`,
`/client`) — there are no barrel files.

## Adding shadcn/ui components

```bash
cd apps/web && bunx shadcn@latest add <component>
```

Components are written to `packages/ui/src/components/ui`. From shadcn 4.21 the
CLI imports `cn` from the official `shadcn-ui/cn` package rather than a local
`lib/utils.ts`.

## Notes for contributors

- **TypeScript 6, not 7.** TS 7 ships no JavaScript Compiler API until 7.1, which
  `nest build` needs. See `packages/tsconfig/`.
- **React is pinned to a single version** (19.2.3) across all packages. Duplicate
  React copies break Metro and React hooks.
- **`apps/mobile/metro.config.js` must keep hierarchical lookup enabled** — Bun's
  isolated `node_modules/.bun/*` store depends on it. `withUniwindConfig` must
  stay the outermost wrapper.
- **Uniwind only scans upward from `global.css`.** Shared native components need
  an explicit `@source "../../packages/ui-native/src";`.
- **Never rewrite a Nest provider import to `import type`** — see the
  `apps/api/**` override in `biome.jsonc`.
- **Use flexbox, never absolute positioning**, in React Native code.

## Roadmap: database and auth

Database and authentication are **agreed but not implemented**. The full decision
record — versions, rationale, step-by-step plan, gotchas and a definition of
done — lives in **[docs/auth-and-database.md](docs/auth-and-database.md)**.

Short version: **PostgreSQL + Drizzle** (`postgres.js`, drizzle-kit migrations) and
**Better Auth**, served from `apps/api` at `/api/auth/*` so web and mobile share
one session. The auth server deliberately lives in Nest rather than Next, because
the mobile app already talks to Nest and there is only one origin to authorise.

`apps/api` uses an in-memory store for `NotesService` purely to exercise the
contract. Replace its method bodies with Drizzle queries once that document is
worked through.

The single highest-risk item to check first: the Nest Better Auth integration
registers its `AuthGuard` **globally**, which protects every route — including
`/api/health`.
