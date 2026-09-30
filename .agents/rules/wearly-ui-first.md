---
description: Read the Wearly UI/UX spec and design system before any UI work
globs:
  ["**/*.tsx", "**/*.ts", "packages/ui-native/**", "packages/design-tokens/**"]
---

# Wearly UI Rules (MANDATORY)

## Read These Two Documents First

Before you create, edit or review **any** UI code in this repository:

1. **`docs/WEARLY_UI_UX_SPEC.md`** — the product spec. What Wearly is, how it
   should feel, which screens exist, what "quietly premium" means, and what the
   build phases are.
2. **`docs/DESIGN_SYSTEM.md`** — the implementation spec. Tokens, colour, type,
   radius, spacing, elevation, motion, component rules, accessibility, do/don't.

Do not start from a blank file and improvise a colour or a radius. The palette,
the type scale and the shape system already exist and are solved for contrast in
both themes.

## Tokens Only

Every colour, radius, spacing step, type step, elevation and duration comes from
`packages/design-tokens`.

```tsx
// ✅
<View className="rounded-card bg-card p-6 text-foreground" />
<Text className="text-native-heading-md text-card-foreground" />

// ❌ — these are how design systems rot
<View className="rounded-[27px] bg-[#E86A93]" />
```

If a value is genuinely missing, **add it to `packages/design-tokens` first** —
in **both** `@variant light` and `@variant dark`, which Uniwind requires to
declare an identical set of variable names. Never introduce a second styling
system and never add a component library.

## Flexbox Only

React Native layout is flexbox. Never `position: "absolute"` as a layout
strategy.

**The one documented exception** is the hero-expansion overlay in
`@wearly/ui-native/hero-transition`, which is a transient animation layer rather
than layout. See `DESIGN_SYSTEM.md` §10. Do not use it as precedent for
anything else.

## Reuse Before You Build

Before writing a component, check what already exists:

- `packages/ui-native/src/` — the shared native components
- `heroui-native` — bottom sheet, chip, card, avatar, dialog, search field,
  select, toast, pressable feedback. These are already bridged onto the Wearly
  palette by `heroui-native.css`. Wrap them, do not reimplement them.
- `packages/ui/src/components/` — the web equivalents

Reach for a duplicate only when the existing contract genuinely cannot express
the need. Some duplication is explicitly better than a component with a dozen
boolean flags.

## Product Rules That Are Not Negotiable

- **No fabricated social proof.** No invented reviews, ratings, user counts or
  "N people are viewing". Empty states are honest and designed, never filled
  with fake data. Everything in the repo is prototype data and is labelled so in
  the UI.
- **Never force a login.** Browsing is account-free. Ask for authentication only
  at the moment an action needs it, and explain **why** before showing a field.
- **Progressive disclosure.** Cards stay simple; depth is one tap away. Do not
  dump every fact onto a first view.
- **Touch targets** are 44px minimum, 52px for primary actions.
- **Every input is validated** with a zod schema in
  `src/features/<feature>/validations/`, wired through `react-hook-form`, with
  the first validation error surfaced in a toast and inline.
- **Files stay under 200 lines.** Split by ownership, not arbitrarily.
- **Accessibility is not a pass at the end.** Every interactive element has an
  accessible role and label, toggles expose their state, and reduced motion is
  respected.
- **Stay mobile.** Mobile shares colour, type, radius, spacing and iconography
  with web — not structure. It is not a smaller desktop layout.
