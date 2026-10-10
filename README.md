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
| Design | `packages/design-tokens` + Satoshi (self-hosted, ITF FFL) |

## Layout

```
apps/
  web/       Next.js — shadcn/ui + HeroUI web
  mobile/    Expo Router — HeroUI Native + Uniwind
  api/       NestJS REST API (ESM)
packages/
  shared/        zod schemas, API types, route constants, typed client
  design-tokens/ colour / radius / type / spacing / motion tokens
  ui/            shadcn/ui components (web)
  ui-native/     shared native providers and layout primitives
  tsconfig/      base TypeScript configs
docs/
  DESIGN_SYSTEM.md    the design system: philosophy, tokens, rules, do/don't
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

Web routes:

```
http://localhost:3000/                landing page
http://localhost:3000/design-system  token + component showcase
```

Individual apps:

```bash
bun run dev --filter=@wearly/web      # http://localhost:3000
bun run dev --filter=@wearly/api      # http://localhost:4000/api
bun run dev --filter=@wearly/mobile   # Expo dev server
```

### Running the mobile prototype

`apps/mobile` holds a working Phase 1 prototype of the Wearly app: splash,
welcome, home, discover with filters, product detail with the hero expansion,
date selection, checkout, the explain-first account gate, confirmation, rentals
and profile.

```bash
bun run dev --filter=@wearly/mobile
```

Press `a` for an Android device or emulator, or scan the QR code with Expo Go.
Note that `expo start --web` does **not** currently work in this repository:
`react-native-web@0.21.3` and `uniwind@1.12.0` disagree about
`uniwind/components/InputAccessoryView`, and `expo-router` pulls that in through
`react-native-web/dist/index`. This predates the mobile UI work. To validate a
bundle without a device:

```bash
cd apps/mobile && bunx expo export --platform ios --output-dir /tmp/wearly
```

All catalogue data, lenders, prices and reviews in the prototype are invented.
The app says so on the screens where it matters.

#### Reviewing the light palette

The app follows the OS colour scheme, which is correct — but a dark phone shows
you the dark palette, and most of what you want to judge (is the blush warm
enough, does the type hierarchy work, does the card breathe) is a question about
the light theme. Two options:

- Switch the phone to light mode.
- Force it for one run, dev only:

  ```bash
  cd apps/mobile && EXPO_PUBLIC_WEARLY_THEME=light bunx expo start --clear
  ```

  `EXPO_PUBLIC_WEARLY_THEME` is inlined at build time, so `--clear` is required.
  It is not present in production builds.

#### Regenerating the brand assets

The launcher icon, Android adaptive layers, favicons and native splash image
are all rendered from the flow-mark so they cannot drift apart. Source:
`apps/mobile/assets/brand/wearly-launcher.svg` (flow-mark geometry on a
`#FFFBFC` square — the animated in-app splash in `features/splash` is a
separate instance and is never touched by this):

```bash
cd apps/mobile/assets/brand
rsvg-convert -w 1024 -h 1024 wearly-launcher.svg -o ../images/icon.png
```

A fresh EAS build + reinstall is required afterwards; OTA never changes the
OS-level icon or the native splash drawable.

## Design tokens and cross-platform consistency

**Start with [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)** for how the product
is built, and [`docs/WEARLY_UI_UX_SPEC.md`](docs/WEARLY_UI_UX_SPEC.md) for what
it is and why it should feel the way it does. Read both before touching UI. It
documents the
palette, type scale, radius, spacing, elevation, component rules and the do/don't
list, and `/design-system` in the web app renders every token live in both themes.

`packages/design-tokens` is the only place colours, radii, type sizes and
durations are defined. It is split by concern and consumed by both platforms:

| File | Responsibility |
| --- | --- |
| `colors.css` | The semantic palette — light and dark, as symmetric `@variant` blocks |
| `radius.css` | The radius scale plus per-component radius defaults |
| `spacing.css` | The 4px scale plus named layout roles |
| `typography.css` | The Satoshi stack, the weights, the semantic type scale |
| `shadows.css` | Control heights and padding |
| `motion.css` | Durations and easings |
| `theme.css` | Maps all of the above onto Tailwind / Uniwind utility names |
| `heroui.css` | Bridges onto HeroUI **web** variable names |
| `heroui-native.css` | Bridges onto HeroUI **Native** variable names |

So `bg-primary`, `text-muted-foreground`, `rounded-card` and `text-heading-lg`
mean the same thing on web and on mobile, and changing `--wearly-primary` moves
both apps at once.

Three things about this setup are easy to get wrong, and all three are enforced
by a comment where they matter:

- **Import order.** `tailwindcss` first; the HeroUI bridges last and unlayered,
  so their `:root` declarations outrank the variables HeroUI ships with.
- **`@variant`, not `:root` + `.dark`.** A bare `.dark { --token: … }` block
  works on the web but is dead code on React Native — Uniwind reads it as a
  utility class name, not a theme. Both themes must also declare an identical
  set of variable names or Uniwind refuses to build.
- **`@source`.** `packages/ui` and `packages/ui-native` sit outside their apps,
  so Tailwind does not scan them automatically. Both entry stylesheets declare an
  explicit `@source`; without it those components ship with no CSS at all.

See `apps/web/src/app/globals.css` and `apps/mobile/src/global.css`.

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
  an explicit `@source "../../packages/ui-native/src";`. Tailwind does the same
  for web, which is why `apps/web/src/app/globals.css` sources `packages/ui`.
- **Never rewrite a Nest provider import to `import type`** — see the
  `apps/api/**` override in `biome.jsonc`.
- **Use flexbox, never absolute positioning**, in React Native code.
- **Satoshi is licensed under the ITF Free Font License, not an OFL.**
  Self-hosting and embedding are permitted; redistributing the font files is not.
  See `docs/DESIGN_SYSTEM.md` §15.
- **Never add a colour, radius or duration outside `packages/design-tokens`.**
  One-off hex values are how a design system rots.

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
