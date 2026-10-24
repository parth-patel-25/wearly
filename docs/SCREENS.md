# Screens

Mobile app build tracker — `apps/mobile`. Screens are built in phases so design
feedback lands before everything exists. Tick the box when a screen is
implemented.

The product intent behind each screen lives in `docs/WEARLY_UI_UX_SPEC.md`.

## Phase 1 — Foundation + 5 signature screens

Proves the design language and the hero-expansion interaction end to end.

- [x] 01 Splash / onboarding — fabric-reveal brand moment (`features/splash`):
  the approved flow-mark SVG (`assets/brand/wearly-flow-mark.svg`, W + two
  leaves, geometry untouched) wipes in left→right under a background-toned
  veil, the vivid flourish settles last, then the `wearly` wordmark and the
  `WEAR / RENT / REPEAT` tagline (Satoshi — the SVG carries the mark only)
  fade/rise in. ~3.3s total, UI-thread only, reduced-motion collapses to a
  short fade, dark variant re-tones the gradients without touching geometry.
- [x] 02 Home — magazine marketplace at `/(tabs)` (single Home; v1/v2 variants removed 2026-10-05)
- [x] 03 Search — in Discover
- [x] 04 Categories — in Discover (chip rail)
- [x] 05 Product grid — FlashList grid in Home and Discover
- [x] 06 Filters — bottom sheet
- [x] 07 Product details — hero expansion from the card
- [x] 08 Image gallery — full-bleed 3:4 hero image in product detail; header floats over it, content sheet overlaps its bottom edge with `rounded-t-5xl` (multi-frame strip removed 2026-10-06)
- [x] 11 Date selection — calendar, range selection; Stack header off (`headerShown: false`), in-screen row instead (outline back · centred `headingSm` "Choose dates" · mirror spacer), headline "When will you wear it?"
- [x] 12 Price breakdown — in checkout
- [x] 13 Checkout — Stack header off (`headerShown: false`), in-screen row instead (outline back · centred `headingSm` "Checkout" · mirror spacer)
- [x] 15 Confirmation
- [x] 16 Orders / rentals — honest empty state
- [x] 18 Profile — Phase 1 complete: identity (photo + initials fallback, name,
  email), editable display name via Better Auth, saved-pieces grid, account and
  sign-out, help/legal configuration hooks and app version. Progress reaches
  100% through achievable steps only. See `docs/PROFILE_PHASES.md` for Phase 2/3.

**Connective tissue, not signature screens:**

- [x] Splash → welcome personalisation (pre-auth, 3 steps: fashion moment, then 2 questions; the handover is a forward push — splash exits left, welcome slides in from the right, `slide_from_right` on the welcome route)
- [x] Bottom tab bar (Home · Discover · List · Profile)
- [x] Explain-first authentication gate (§6.1 "no forced login")
- [x] Sign in / create account — full-screen UI at `/sign-in` (Google +
  Facebook social buttons, "Create account" primary); pushed from Profile
  when browsing without an account, and from checkout when a guest tries to
  pay (replaces the AuthSheet modal)
- [x] Log In / Sign Up tabs — `/auth` with a segmented tab switch (pulled from
  the sign-in screen's "Log In" → login tab, "Create account" → signup tab);
  validated email/password fields and a swipe-to-confirm action: white
  `rounded-button` track, primary ball, the track fills `bg-primary` behind
  the ball as it travels. Switching tabs is a slide, not a swap: the active
  pill travels between the segments' measured slots and the heading + form
  enter in the direction of travel (`useSlideIn`, instant under reduced
  motion); banner row carries the Wearly lockup beside the back button, with
  the reworded semi-title headings (`features/auth`). The social pair under
  the form is Google + Facebook (Apple removed 2026-10-15 — the API
  configures only `google` and `facebook` providers; shared `FacebookGlyph`
  in `social-button.tsx`). Google uses the native Google Sign-In SDK
  (`use-google-sign-in.ts` + `@react-native-google-signin/google-signin`,
  idToken flow — no browser/redirect); Facebook still opens the system
  browser
- [x] Native component foundation in `packages/ui-native`

**Step 1 is a swipe, steps 2 and 3 are buttons.** Welcome opens on the fashion
moment — hero photograph, headline with a rotated accent pill, and a
swipe-to-continue track where the Next button used to be. The two question steps
are unchanged and stay tap-driven, because a drag gate on a screen offering four
answers is hostile. The three-dot pager marks the position; the hero photography
is a remote placeholder pending final assets. The swipe is a custom `PanResponder`
control with explicit geometry (no runtime measurement — see `DESIGN_SYSTEM.md`
§10 for why) and swipe-only costs a screen-reader user a tap path, which is
accepted on this step alone.

**One Home.** The v1 (product-first) and v2 (story-first) variants were removed
once v3 won: v3 is the magazine marketplace at the tab root `/(tabs)` —
personalised header, search handoff to Discover, occasion-led editorial hero,
category + occasion rails, Trending / New / Looks rails, then a recommended
grid. `ROUTES.home` is `/(tabs)`; the old `homeLegacy`/`homeV2`/`homeV3` keys
and their screens are gone (git history preserves them).

**Two-card Home (2026-10-05).** Two full-bleed white cards with a `bg-muted`
gap between: header (provider photo avatar with monogram fallback, greeting,
search) rounded bottom-only, content sheet
rounded top-only. Greeting scrolls away, search stays pinned — same order,
same content, tab bar unchanged. Sheet bottom is flush: scroll container
carries no extra padding (`pb-0`), inner sheet keeps `px-5 pt-5 pb-4` so the
disclaimer ends 16px above the tab bar (2026-10-06).

**The `List` tab replaced the centre `+`.** Listing used to be a fixed 48px filled
circle wedged between Discover and Rentals — a button, not a destination, and the
reason the bar's tabs were not all the same width. It is now the third tab, a
hanger glyph, and `/(tabs)/list` is reached the same way as every other screen.
The bar keeps one sliding pill across all four; see `DESIGN_SYSTEM.md` §10.

## Phase 2 — The rest of the rental journey

- [ ] 09 Size selection
- [ ] 10 Availability — calendar ships in 11; this is the owner's view
- [ ] 14 Payment
- [ ] 17 Tracking
- [ ] 19 Reviews — must ship as an honest empty state, never fabricated
- [ ] 20 Seller profile
- [ ] Profile completion (progressive, §6.2) — progress logic fixed in Phase 1
  (`docs/PROFILE_PHASES.md`); the Phase 2 profile destinations are still pending

## Phase 3 — The listing flow

Two-sided marketplace. Friendly and guided, never a seller dashboard.

- [ ] 21 Add/list clothing
- [ ] 22 Upload photos
- [ ] 23 Set price
- [ ] 24 Set availability
- [ ] 25 Listing published

## Mobile — real auth (`apps/mobile`)

Phase 4 of `docs/auth-and-admin-plan.md` — replacing the prototype's fake
sign-in with Better Auth (`expoClient` + SecureStore, scheme `wearly`).

- [x] Deps: `better-auth`, `@better-auth/expo`, `expo-secure-store`,
  `expo-network` (`expo-web-browser` / `expo-linking` / `expo-constants` present)
- [x] `src/lib/auth-client.ts` — `createAuthClient` + `expoClient({ scheme: "wearly", storage: SecureStore })`
- [x] Real session — `authClient.useSession` behind the existing
  `SessionProvider` (favourites, rentals, personalise stay local state)
- [x] Login wired — `signIn.email`; sign-up wired — `signUp.email` with a
  `name` field added to `SignUpSchema` (Better Auth requires it)
- [x] Social buttons wired — Google via native Google Sign-In SDK
  (`signIn.social({ idToken })`,
  `@react-native-google-signin/google-signin`); Facebook via the
  system-browser `signIn.social` (Apple removed; no server provider)
- [x] Email verification — 6-digit code emailed by Better Auth's email-OTP
  plugin; `/verify-email?email=` shows the code form. Legacy
  `wearly://verify-email` links still land on the success + `?error=` states.
- [x] Post-auth navigation — after any successful sign-in (email, Google,
  Facebook) the session store is hydrated (`refetch()` awaited via
  `SessionProvider`) *before* navigating, so the destination never
  flashes the guest state while Better Auth's async `/get-session` is still
  in flight. Navigation uses `router.dismissAll()` to pop the entire
  auth stack (sign-in + auth) back to the tabs, rather than `router.back()`
  which only pops one screen and stranded the user on `/sign-in` when they
  had gone Profile → Sign-in → Auth.
- [x] Google account picker — `GoogleSignin.signOut()` is called before
  `signIn()` so the device always shows the account chooser instead of
  silently reusing the last-selected account.

## Web — auth + admin panel (`apps/web`)

Auth wiring and the admin surface live in the web app (see
`docs/auth-and-admin-plan.md` for the build checklist).

**Entry + showcase:**

- [x] Root `/` — auth gate: no session cookie → redirect `/sign-in`; session
  cookie → redirect `/admin` (role still enforced by the admin shell)
- [x] `/design-system` — showcase page (hero, featured pieces, how-it-works);
  theme toggle in the header
- [x] `/design-system/tokens` — token reference (colours, foundations,
  controls, surfaces, overlays (dialogs, tabs, toasts), states); anchor links
  from the showcase footer

**Auth (real backend, Supabase + Better Auth):**

- [x] Sign in — `/sign-in` (email + password only — OAuth buttons removed;
  `?next=` redirect; "Create one" sign-up link hidden when `next` points at
  `/admin` — admin is invite-only)
- [x] Sign up — `/sign-up` (validated email/password, first-error toast +
  inline errors); still reachable for invitees whose email has no account yet
  (invite landing links here)
- [x] Verify email — `/verify-email?email=` OTP screen: six token-styled code
  slots, outline back control, 40s resend countdown, primary verify button,
  bottom numeric keypad; success/error states preserved for legacy links
- [x] Session wiring — `authClient.useSession` on web (admin shell, invite landing);
  mobile parity still pending (Phase 4)

**Admin (`/admin`, gated by session + role):**

- [x] Admin layout — soft sidebar with rose accent (`DESIGN_SYSTEM.md` §11);
  Wearly flow-mark logo + `ADMIN PANEL` caption up top; tabs: Users, Invites,
  Design system — each with an icon. Design system opens `/design-system` in a
  new tab (`target="_blank"`, trailing external-link glyph)
- [x] Users list — `/admin/users`: search (debounced, header stays mounted and
  only the table shows a loader via `keepPreviousData`), pagination,
  include-deleted toggle, role/status badges, confirmation dialogs for soft
  delete / hard delete / restore
- [x] Admin invites — `/admin/invites`: invite-by-email form, pending list,
  revoke (super-admin only)
- [x] Invite landing — `/admin/invite/:token`: validate token; signed out →
  "Sign in to accept" plus "Create an account" (`/sign-up?next=…`) so
  new-email invitees can register; accept → role becomes `admin`
