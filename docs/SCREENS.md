# Screens

Mobile app build tracker — `apps/mobile`. Screens are built in phases so design
feedback lands before everything exists. Tick the box when a screen is
implemented.

The product intent behind each screen lives in `docs/WEARLY_UI_UX_SPEC.md`.

## Phase 1 — Foundation + 5 signature screens

Proves the design language and the hero-expansion interaction end to end.

- [x] 01 Splash / onboarding — animated brand moment
- [x] 02 Home — magazine marketplace at `/(tabs)` (single Home; v1/v2 variants removed 2026-10-05)
- [x] 03 Search — in Discover
- [x] 04 Categories — in Discover (chip rail)
- [x] 05 Product grid — FlatList grid in Home and Discover
- [x] 06 Filters — bottom sheet
- [x] 07 Product details — hero expansion from the card
- [x] 08 Image gallery — in product detail
- [x] 11 Date selection — calendar, range selection
- [x] 12 Price breakdown — in checkout
- [x] 13 Checkout
- [x] 15 Confirmation
- [x] 16 Orders / rentals — honest empty state
- [x] 18 Profile — honest empty state

**Connective tissue, not signature screens:**

- [x] Splash → welcome personalisation (pre-auth, 3 steps: fashion moment, then 2 questions)
- [x] Bottom tab bar (Home · Discover · List · Profile)
- [x] Explain-first authentication gate (§6.1 "no forced login")
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
- [ ] Profile completion (progressive, §6.2)

## Phase 3 — The listing flow

Two-sided marketplace. Friendly and guided, never a seller dashboard.

- [ ] 21 Add/list clothing
- [ ] 22 Upload photos
- [ ] 23 Set price
- [ ] 24 Set availability
- [ ] 25 Listing published
