# Screens

Mobile app build tracker — `apps/mobile`. Screens are built in phases so design
feedback lands before everything exists. Tick the box when a screen is
implemented.

The product intent behind each screen lives in `docs/WEARLY_UI_UX_SPEC.md`.

## Phase 1 — Foundation + 5 signature screens

Proves the design language and the hero-expansion interaction end to end.

- [x] 01 Splash / onboarding — animated brand moment
- [x] 02 Home — editorial, curated
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

- [x] Splash → welcome personalisation (pre-auth, 2 questions)
- [x] Bottom tab bar (Home · Discover · List · Rentals · Profile)
- [x] Explain-first authentication gate (§6.1 "no forced login")
- [x] Native component foundation in `packages/ui-native`

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
