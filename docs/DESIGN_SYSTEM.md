# Wearly design system

**Soft fashion · modern editorial · minimal · premium · rounded**

Wearly is a clothing rental marketplace. Renters browse, request and return
garments; owners list what they own and approve rentals; admins moderate the
marketplace. Every surface should feel calm, airy and quietly expensive —
closer to a fashion editorial than to a SaaS dashboard.

The system is not "web with a mobile port". Web and mobile are two native
experiences that happen to share a brand:

```
              SHARED DESIGN TOKENS
                       │
          ┌────────────┴────────────┐
          │                         │
       WEB/ADMIN                 MOBILE
          │                         │
      shadcn/ui                HeroUI Native
          │                         │
      Tailwind                  Uniwind
          │                         │
          └────────────┬────────────┘
                       │
                SAME BRAND
                SAME TOKENS
                SAME VISUAL LANGUAGE
```

---

## 1. Philosophy

Four words carry most of the decisions.

**Soft.** No harsh borders, no pure black, no sharp corners, no heavy shadows.
Surfaces are separated by a hairline and a small step in tone; shadows are
reserved for things that genuinely float.

**Minimal.** Hierarchy comes from spacing, scale and contrast — not decoration.
No gratuitous gradients, glassmorphism, blob backgrounds or illustrations.
Restraint is what makes it read as premium.

**Fashion-forward.** Photography leads. On a product card the image is the
largest element and the metadata is capped at three facts. If a card needed
another line of text, the answer is usually to remove one that already exists.

**Generous.** The product should feel airy. When a layout feels tight, add a
spacing step rather than shrinking type.

### The 80 / 15 / 5 rule

Roughly **80% neutral** surfaces, **15% brand rose**, **5% status colour**. Rose
is an accent. If a screen reads as pink, something has gone too far.

---

## 2. Architecture

Everything lives in `packages/design-tokens`. Nothing else defines a colour, a
radius, a font size or a duration.

| File | Responsibility |
| --- | --- |
| `colors.css` | The semantic palette. Light and dark, declared as symmetric `@variant` blocks. |
| `radius.css` | The radius scale plus per-component radius defaults. |
| `spacing.css` | The 4px scale plus named layout roles. |
| `typography.css` | The Satoshi stack, the weights, and the semantic type scale. |
| `shadows.css` | Control heights and padding. |
| `motion.css` | Durations and easings. |
| `theme.css` | Maps everything above onto Tailwind / Uniwind utility names. |
| `heroui.css` | Bridges onto HeroUI **web** variable names. |
| `heroui-native.css` | Bridges onto HeroUI **Native** variable names. |
| `index.css` | Ordered barrel — import this. |

### Why `@variant` and not `:root` + `.dark`

A bare `.dark { --token: … }` block looks correct and works on the web, but on
React Native it is dead. Uniwind's CSS processor treats a lone `.dark` selector
as a *utility class name*, so those declarations never enter the theme scope
and the app stays light. The working form is:

```css
@layer theme {
  :root {
    @variant light { --wearly-background: …; }
    @variant dark  { --wearly-background: …; }
  }
}
```

Both blocks are also required to declare an **identical set of variable names**.
Uniwind's `generateCSSForThemes` logs `Theme light is missing variable …` and
bails out of theming otherwise. This is why the elevation tokens sit in
`colors.css` rather than `shadows.css`.

On the web, `@variant light` and `@variant dark` need matching `@custom-variant`
declarations; `next-themes` always emits the resolved theme as a class on
`<html>`, so `.light` and `.dark` are both present.

### Import order

```css
@import "tailwindcss";        /* Tailwind must be first */
@import "./fonts.css";        /* @font-face, before the stack that uses it */
@import "@heroui/styles";     /* HeroUI's own variables… */
@import "@wearly/design-tokens/…"; /* …overridden by ours */
@import "@wearly/design-tokens/heroui.css"; /* unlayered, so it wins */
```

`heroui.css` must come last and stay unlayered: unlayered declarations outrank
the `@layer base` / `@layer theme` variables HeroUI ships with.

### Two things that are easy to get wrong

**`@source`.** `packages/ui` and `packages/ui-native` live outside their apps, so
Tailwind's automatic source detection never sees them and their components ship
with no CSS at all. Both entry stylesheets declare an explicit `@source`.

**Font delivery.** `next/font` emits a build-hashed family name
(`__Satoshi_xxxx`) and exposes it only through a CSS variable, which React
Native cannot resolve. The font is therefore self-hosted with a hand-written
`@font-face` so the family is literally `"Satoshi"` on both platforms, and one
token name means the same thing everywhere. Web preload hints are declared by
hand in the root layout as the trade-off.

---

## 3. Colour

### Light

| Token | Value | Use |
| --- | --- | --- |
| `background` | `#FFFBFC` | Page canvas |
| `foreground` | `#272126` | Body text |
| `card` / `card-foreground` | `#FFFFFF` | Raised surfaces |
| `primary` / `primary-foreground` | `#C54B75` / `#FFFFFF` | Fills that carry white text |
| `brand` / `brand-foreground` | `#E86A93` / `#272126` | Decorative by default — rings, indicators, hearts |
| `secondary` | `#F9EEF2` | Neutral fill |
| `muted` | `#F8F2F5` | Subtle fill, skeleton base |
| `muted-foreground` | `#7E7178` | Secondary text, captions |
| `accent` / `accent-foreground` | `#FCE7EF` / `#7A304D` | Soft rose action |
| `border` / `input` / `ring` | `#F0E3E8` / `#F0E3E8` / `#C54B75` | Hairlines and focus |
| `backdrop` | `#272126` @ 32% | Dialog scrim |

### Dark

A dedicated palette, not an inversion. Anchored on `#171316` — never `#000` —
with a vivid rose that holds contrast against it. Surfaces read through their
borders, so shadows recede rather than deepen.

The two rose tokens behave differently on purpose:

| Token | Dark value | Foreground | Why |
| --- | --- | --- | --- |
| `primary` | `#C54B75` — **same as light** | `#FFFFFF` | Text-bearing fill. Kept identical in both themes so `primary-foreground` is white everywhere and a filled button looks the same either way. |
| `brand` | `#F09BB8` — lightened | `#3D1526` | Decoration only. The pale rose keeps its glow on charcoal (8.84:1) but is far too light for white (2.08:1). |

| Token | Value | Use |
| --- | --- | --- |
| `background` | `#171316` | Page canvas |
| `foreground` | `#F5EFF2` | Body text |
| `card` / `card-foreground` | `#211D20` / `#F5EFF2` | Raised surfaces |
| `primary` / `primary-foreground` | `#C54B75` / `#FFFFFF` | Fills that carry white text |
| `brand` / `brand-foreground` | `#F09BB8` / `#3D1526` | Decoration, rings, hearts |
| `muted-foreground` | `#A99BA3` | Secondary text, captions |

Because `brand` is light in dark mode, painting a brand background without its
paired foreground leaves light text on a light surface — **1.28:1**, far below AA.
Use the paired token; see [`Card` variants](#card-variants) below.

### Two deliberate deviations from the brief

Both preserve the intended hue and were required to pass WCAG AA.

| Token | Brief | Shipped | Why |
| --- | --- | --- | --- |
| `primary` | `#E86A93` | `#C54B75` | White text on `#E86A93` is **3.04:1**. A 15px button label is not "large text", so it needs 4.5:1. The vivid pink is still available as `brand` for decoration. |
| `muted-foreground` | `#8D8087` | `#7E7178` | 3.77:1 → **4.53:1** on the page background. |

The rule this encodes: **the default token is the accessible one.** A developer
who reaches for `bg-primary` cannot accidentally build an unreadable button. The
decorative brand tone has a separate, explicitly named token.

`brand-foreground` is a third such pairing, added after the showcase page proved
the "no text on `brand`" convention could not be enforced by a comment alone:

| Token | Light | Dark | Contrast on `brand` |
| --- | --- | --- | --- |
| `brand` | `#E86A93` | `#F09BB8` | — |
| `brand-foreground` | `#272126` | `#3D1526` | 5.19:1 light · 7.56:1 dark |

Note it is **not** the same token as `primary-foreground`, and the two roses
diverge further in dark mode:

| | Light | Dark |
| --- | --- | --- |
| `primary-foreground` on `primary` | `#FFFFFF` · 4.53:1 | `#FFFFFF` · 4.53:1 |
| `brand-foreground` on `brand` | `#272126` · 5.19:1 | `#3D1526` · 7.56:1 |

**White is reserved for `primary`.** Reusing it on `brand` would land at 3.04:1 in
light mode and 2.08:1 in dark. If you need a rose fill that carries white text,
use `bg-primary` — that is exactly what it is for.

### `Card` variants

`Card` is the one component that historically hardcoded its background and
foreground together in a single base class. A caller overriding only the
background left the light-on-light pairing behind. It now uses `cva`, so the
pairing travels with the surface:

| Variant | Classes | Intended for |
| --- | --- | --- |
| `default` | `bg-card text-card-foreground` | The normal product surface |
| `primary` | `bg-primary text-primary-foreground` | Filled promotional card |
| `brand` | `bg-brand text-brand-foreground` | Filled brand card; also re-tints `CardDescription` |

Prefer a variant over a raw `className="bg-brand"`. Overriding the background by
hand remains possible, but it is no longer a documented path — if you need a fill
the variants do not cover, add a variant.

### Status

Each status has three tones, and they are not interchangeable:

| Token | Role |
| --- | --- |
| `--wearly-success` | Dots, icons, small fills |
| `--wearly-success-foreground` | The **only** tone valid for text |
| `--wearly-success-background` | The soft surface they sit on |

In light mode the mid tone clears 4.5:1 on its soft background but not on white,
which is why badges are built as `bg-*-background text-*-foreground` rather than
a filled pill with white text. In dark the mid and foreground tones converge,
since both clear 6.4:1 on their own surface.

| Status | Foreground | Background |
| --- | --- | --- |
| success | `#437B5E` | `#EDF7F1` |
| warning | `#9C651A` | `#FFF5E8` |
| destructive | `#B94656` | `#FDECEF` |
| info | `#5071A0` | `#EEF4FC` |

---

## 4. Typography

Satoshi, by Indian Type Foundry. Self-hosted; see the licence note below.

**Satoshi has no 600 weight.** The scale uses **500 for headings** and 700 for
emphasis, and `--wearly-weight-semibold` is deliberately *not* defined so nobody
reaches for a weight that does not exist. Large headings set in 500 also read
more editorial than bold.

| Token | Size | Weight | Use |
| --- | --- | --- | --- |
| `text-display` | 36–44px | 500 | Hero |
| `text-heading-xl` | 30–36px | 500 | Page title |
| `text-heading-lg` | 24–30px | 500 | Section title |
| `text-heading-md` | 24px | 500 | Subsection |
| `text-heading-sm` | 20px | 500 | Card title |
| `text-body-lg` | 17px | 400 | Lead paragraph |
| `text-body-md` | 15px | 400 | Default body |
| `text-body-sm` | 14px | 400 | Secondary text |
| `text-label` | 13px | 500 | Form labels |
| `text-caption` | 12px | 400 | Metadata |

Web sizes are `clamp()`-based so headings never overflow a phone or look lost on
a large display. React Native cannot resolve `clamp()`, so each step has a
`--wearly-text-native-*` counterpart at the fluid scale's floor. Using a web
`clamp()` in a native `className` would silently resolve to garbage.

Control labels get their own `text-button` / `-sm` / `-lg` steps. Combining
`text-body-sm` with `font-medium` looks right but both utilities set
`font-weight`, and which wins depends on stylesheet order rather than class
order — a silent way to ship the wrong weight.

---

## 5. Radius

The most recognisable part of the silhouette. `rounded-sm` is 12px, not
Tailwind's 4px default.

| Token | Value |
| --- | --- |
| `radius-xs` | 8px |
| `radius-sm` | 12px |
| `radius-md` | 16px |
| `radius-lg` | 20px |
| `radius-xl` | 24px |
| `radius-2xl` | 28px |
| `radius-3xl` | 32px |
| `radius-pill` | 9999px |

**Prefer the component names** over the numeric scale — re-theming one component
is then a single token change:

| Utility | Value | Used by |
| --- | --- | --- |
| `rounded-button` | pill | Buttons |
| `rounded-badge` | pill | Badges, chips, icon buttons |
| `rounded-input` | 16px | Inputs, selects |
| `rounded-search` | pill | Search fields |
| `rounded-card` | 24px | Cards |
| `rounded-media` | 20px | Product imagery |
| `rounded-dialog` | 28px | Dialogs |
| `rounded-sheet` | 32px | Bottom sheets, promotional blocks |

Not everything is a pill. Pills are for controls and small chips; cards,
imagery and sheets use the scale. Making every element pill-shaped flattens the
hierarchy.

---

## 6. Spacing

A 4px base: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.

Tailwind's numeric scale derives from `--spacing: 0.25rem`, so `p-4` is 1rem on
both platforms. Three named roles exist so screens do not each invent a rhythm:
`gap-gutter`, `gap-section`, `px-page-inline`. `gutter` and `page-inline` widen at
the `md` breakpoint.

Heights: `h-9` 36, `h-11` 44 (the WCAG 2.2 minimum target), `h-12` 48,
`h-13` 52 for mobile primary actions.

---

## 7. Elevation

Barely noticeable by design.

| Utility | Value | Used by |
| --- | --- | --- |
| `shadow-soft` | `0 1px 3px` @ 5% | Cards, resting surfaces |
| `shadow-raised` | `0 4px 16px -2px` @ 7% | Hovered, draggable |
| `shadow-float` | `0 8px 30px -6px` @ 10% | Dialogs, sheets, sticky bars |

Shadows are rose-tinted so they never read as cold grey. If a card needs a
strong shadow to be readable, the problem is its border or surface contrast,
not the shadow. React Native supports one shadow per view, so native surfaces
rely on `border` plus tone.

---

## 8. Motion

| Token | Value |
| --- | --- |
| `duration-fast` | 150ms |
| `duration-base` | 200ms |
| `duration-slow` | 300ms |
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |

Small interactions (press, focus, favourite heart) run 150–200ms. Larger
transitions (dialog, sheet) run 200–300ms. Everything eases out, which
decelerates into rest and reads as calm rather than springy.

Buttons animate colour only — no transform — so press feedback never shifts
surrounding layout. Icons that do scale use `active:scale-95` paired with
`motion-reduce:active:scale-100`.

`prefers-reduced-motion: reduce` collapses every duration to 1ms in both
`theme.css` and `globals.css`, so state changes stay legible without movement.

---

## 9. Components

Shared concepts. Implementations differ per platform; the APIs do not have to
match, because platform-native UX wins over symmetry.

`Button` · `Input` · `SearchInput` · `Card` · `Badge` · `Avatar` · `Dialog` ·
`BottomSheet` · `Tabs` · `SegmentedControl` · `Dropdown` · `Toast` · `Alert` ·
`EmptyState` · `LoadingState` · `ErrorState` · `ProductCard`

### What exists on native

`packages/ui-native` is the mobile implementation. One export subpath per module,
matching the existing `./screen` and `./providers` convention.

| Area | Modules |
| --- | --- |
| Primitives | `text` `button` `card` `badge` `chip` `avatar` `media` `fields` |
| Composition | `product-card` `product-grid` `calendar` `tab-bar` `display` `status` |
| Overlays | `bottom-sheet` `toast` |
| Brand | `brand-mark` |
| Motion | `motion` `tone` `icon` `icon-glyphs` |
| Hero transition | `hero-provider` `hero-layer` |
| Layout | `screen` `providers` |

`ProductGrid` wraps `FlatList`, not `ScrollView`. The catalogue is expected to
grow past fifty pieces, and a grid that renders every cell up front is how a
marketplace app starts dropping frames.

### Tones

`tone.ts` is the only place a semantic colour name is spelled out. Every tone
exposes two things: the Tailwind utility (so the element gets styled and Uniwind
bundles the variable) and the raw CSS variable (so SVG, which cannot take a
`className`, resolves the same colour at runtime). Reach for it rather than
repeating `text-muted-foreground` in twenty components.

### Buttons

Pill-shaped, 44px default, animated on colour only. Variants: `default`
(primary), `soft` (soft rose), `secondary`, `outline`, `ghost`, `destructive`,
`link`. `loading` shows a spinner, sets `aria-busy` and blocks interaction while
keeping the label mounted so the button does not resize mid-request.

```tsx
// ✅ tokens only
<Button variant="soft" size="lg" loading>Saving</Button>

// ❌ brand values inline
<Button className="rounded-[27px] bg-[#E86A93]" />
```

### Product cards

Imagery dominates: a 4:5 media block, `rounded-media`. The favourite button is a
44px circular control sitting in the media block's **padding**, not floating over
the photograph — it must never cover the garment.

Metadata is capped at three facts, led by name and price:

```
Brand
Satin slip dress
₹299 /day          Size S
★ 4.8 (12)         Indiranagar
```

Upload timestamps and similar low-value facts are omitted rather than shrunk: a
card that shows everything communicates nothing.

The favourite heart uses `text-primary`, not `brand` — it is `aria-pressed`, so
it is a control with text-equivalent state, not decoration.

### Tables

Rounded container, hairline row separators, `h-14` rows, pill status badges.
Heavy borders and dense rows are what make a dashboard feel like a spreadsheet.

### Dialogs

28px radius, generous padding, `max-w-lg`. A scrim soft enough that the dialog
stays the focus. On mobile, prefer a bottom sheet at 32px.

---

## 10. Mobile rules

- **Flexbox only. Never absolute positioning.** It breaks across screen sizes,
  densities, notches and platforms.
- Minimum 44px touch targets (`h-control`); `h-touch` (52px) for primary actions.
- No hover. Pressed states carry the feedback that hover does on the web.
- Mobile must not be a copy of the desktop layout. Share colour, type, radius,
  spacing and iconography — not structure.
- **The app launches light.** `apps/mobile/src/core/theme/use-theme-override.ts`
  sets the initial preference to `light`, not to the OS scheme, so the palette
  being reviewed does not change with whichever phone is on the desk. Light is the
  reference render — the soft rose and warm off-white the colour system is tuned
  around. `EXPO_PUBLIC_WEARLY_THEME` still forces a theme for a specific run.
- **A dev-only three-state toggle** (`theme-toggle.tsx`, `__DEV__`-gated) floats at
  the top right and cycles light → dark → follow the system. It is the one control
  in the product that exists to be looked at rather than used. Its state is
  in-memory, so it resets to light on reload; persistence is the open piece.
- Mobile app frames sit above the system status bar, so `Screen` insets with
  `edges={["top", "left", "right"]}` rather than padding by a guessed number.

### Absolute positioning: overlays only

Absolute positioning is for surfaces that float **above** the app and do not
participate in layout. It is never a way to arrange things inside a screen — a
flexbox row or column is the answer there, always.

The sanctioned list, and each earns its place for a different reason:

| Surface | Why it cannot be laid out |
|---|---|
| `hero-layer.tsx` | Interpolates a card's measured rectangle to full-bleed. A transient animation layer; there is no flexbox way to interpolate between two positions. |
| `product/[id].tsx` sticky bar | Sits on top of a scrolling list, so content passes beneath it. |
| `toast.tsx` | Overlays the navigator, above every route, without any screen knowing. |
| `ProductCard`'s favourite heart | Anchored to the image it belongs to, not to the card's flow. |
| `theme-toggle.tsx` | Dev-only, and above every screen by definition. |

`bottom-sheet.tsx`'s scrim is a fifth: `absolute inset-0` over the modal.

Anything that is not in this table is not an overlay, and a second absolute
surface in a screen layout is a design decision that has to earn its place rather
than a default.

### Motion on native

`motion.css` holds durations for CSS transitions; `motion.native.ts` holds the
same numbers for Reanimated, which cannot read a CSS custom property. They must
change in the same commit. Springs (`press`, `pop`, `hero`) live only in the
native file, because CSS has no equivalent.

### Press feedback is `1.0 → 0.97 → 1.0` via `usePressScale`, and the favourite
heart pops via `useHeartPop`. Both are the documented exceptions to "buttons
animate colour only" — they are contained inside their own control's bounds and
cannot shift surrounding layout.

### Never use `entering=` for content that has to be readable

`entering={FadeIn}` starts at `opacity: 0` and depends on a layout animation
running. If it does not — a reduced-motion path, a worklet that has not attached,
a fast refresh mid-transition — the content stays at zero and the screen is
blank. That failure is invisible in review and obvious to a user.

Use `useFadeIn()` from `@wearly/ui-native/motion` instead. It animates shared
values from an effect, so under reduced motion both start at their final value
and the end state is always reachable.

### `Screen` content must `grow`

`Screen` defaults its content wrapper to `flex grow flex-col`. Without `grow` the
wrapper sizes to its content, and a `flex-1` child inside it has no height to
centre against — which renders as everything jammed into the top-left corner.
Any custom `contentClassName` has to keep `grow` unless it deliberately owns the
height.

## 11. Admin rules

Admin is the same brand, not a separate product — and specifically *not* a
harsh full-height dark sidebar.

- Sidebar on `background`, not a dark slab. Active item gets the soft rose
  `accent` fill with a `primary` icon, at `rounded-sm`–`rounded-md`.
- Stat cards at `rounded-card` with generous whitespace.
- Tables per the rules above.
- Charts echo the palette: rose for the primary series, status colours
  sparingly, everything else neutral.

---

## 12. Accessibility

Accessibility is a hard requirement, not a pass at the end.

- **Contrast.** Every text/background pair in `colors.css` was solved to meet
  WCAG AA (4.5:1 text, 3:1 non-text) in **both** themes. The two deviations from
  the original brief above exist for exactly this reason. Re-check contrast
  before adding a new colour pair.
- **Focus.** Every interactive element has a visible `focus-visible` ring
  (`ring-4 ring-ring/25`). Never `outline: none` without a replacement.
- **Targets.** 44px minimum on mobile; icon buttons are `size-11`.
- **Semantics.** Real `<button>`, `<a>`, `<label>`, table markup. Icon-only
  controls carry `aria-label`; decorative icons are `aria-hidden`.
- **State.** `aria-busy` while loading, `aria-pressed` on toggles,
  `role="status"` and `role="alert"` on loading and error regions. Errors always
  offer a retry when the failure is likely transient.
- **Motion.** Respect `prefers-reduced-motion`.
- **Images.** Always `alt`. Decorative imagery takes an empty `alt`.

---

## 13. Do / don't

**Do** reach for a token.

```tsx
<div className="rounded-card bg-card p-6 text-foreground" />
```

**Don't** hardcode brand values.

```tsx
<div className="rounded-[27px] bg-[#E86A93] text-[#272126]" />
```

**Do** use the component radius names.

```tsx
<Button variant="soft" />   {/* rounded-button */}
```

**Don't** pick a numeric step for a component.

```tsx
<Button className="rounded-2xl" />   {/* drifts from --wearly-radius-button */}
```

**Do** add a missing value to `design-tokens`.

```css
--wearly-surface-raised: oklch(…);
```

**Don't** add a one-off hex "just this once". That is how a design system rots.

**Do** keep both theme blocks symmetric.

```css
@variant light { --wearly-x: …; }
@variant dark  { --wearly-x: …; }
```

**Don't** add `--wearly-y` to light only. Uniwind errors on mismatched themes.

**Do** use a `*-foreground` status token for text.

```tsx
<Badge variant="success" />   {/* bg-success-background + text-success-foreground */}
```

**Don't** put white text on `bg-success` — 2.75:1 on white.

---

## 14. Changing the system

A developer should be able to change the product's look from one file.

| Goal | Edit | Propagates to |
| --- | --- | --- |
| Brand colour | `--wearly-primary` in `colors.css` | Buttons, links, rings, active nav, tabs, badges, HeroUI both platforms |
| Decorative pink | `--wearly-brand` | Hearts, indicators |
| Text on decorative pink | `--wearly-brand-foreground` | Filled `brand` cards |
| Global roundness | `--wearly-radius-*` | Every button, input, card, dialog, sheet |
| Type | `--wearly-font-sans` | Both platforms |
| Elevation | `--wearly-shadow-*` | Cards, overlays |
| Speed | `--wearly-duration-*` | All transitions |

`/design-system` on the web renders every token live in both themes — use it to
verify a change before shipping it.

---

## 15. Font licence

Satoshi is by [Indian Type Foundry](https://www.indiantypefoundry.com/),
distributed via [Fontshare](https://fontshare.com/fonts/satoshi) under the **ITF
Free Font License v2.0** — not an SIL Open Font License.

- Self-hosting and embedding in web and mobile applications are **explicitly
  permitted**.
- Use is free for commercial purposes with no attribution.
- **Redistributing the font files themselves is prohibited** — do not publish
  them in a public package or as a standalone download.

If legal ever objects to self-hosting, font delivery is isolated to
`apps/web/src/app/fonts.css` and `apps/mobile/src/lib/fonts.ts`. Swapping both to
Fontshare's hosted CSS leaves every token and component untouched.

---

## 16. Adding components

**Web** — shadcn, into `packages/ui`:

```bash
cd apps/web && bunx shadcn@latest add <component>
```

Components are written to `packages/ui/src/components/ui`. Restyle them onto the
tokens after adding; the generated markup is plain shadcn, not Wearly.

**Mobile** — hand-written, in `packages/ui-native/src`, on the token layer.

`heroui-native` stays a devDependency and `heroui-native.css` stays imported, but
its components are **not** used at runtime. Its barrel re-exports `BottomSheet`,
`Popover`, `Select` and `GlassView`, all of which import `@gorhom/bottom-sheet`
and `expo-blur` as peer dependencies this workspace does not install — so
importing the provider at all fails to resolve. The components Wearly needs are
built on the token layer instead, which also means full control over the radius
and border treatment rather than restyling generated markup afterwards.

If HeroUI Native is adopted later, the peers have to be installed *first* and the
`heroui-native.css` bridge already in place will pick the palette up.

**Both** — if a token is missing, add it to `packages/design-tokens` first.
Never introduce a second styling system, and never add a component library.

---

## 17. Change log

| Date | Change |
| --- | --- |
| 2026-09-30 | Mobile Home: added the story-first `/(tabs)/home-v2` variant (masthead, lead story, occasion rail, lender note, grid last) and moved `ProductCard`'s favourite heart inside the media block, bottom-right. Floated the tab bar as a shadowed pill inset from the screen edges, and added filled twins for the four tab glyphs so the active tab reads as filled rather than just recoloured. Made light the mobile launch theme instead of the OS scheme, and added a `__DEV__`-gated three-state theme toggle. Rewrote §10's absolute-positioning rule, which claimed a single exception while five sanctioned overlays already existed. |
| 2026-09-29 | Fixed the native `@source` path in `apps/mobile/src/global.css` (it pointed one level too high, so nothing in `packages/ui-native` was ever scanned and every shared component rendered unstyled). Made `Screen` content `grow`. Replaced all five `entering=` usages with `useFadeIn`. Replaced the three stock Expo brand assets with renders of the Wearly mark and deleted `assets/expo.icon`. Added a dev-only `EXPO_PUBLIC_WEARLY_THEME` override.
| 2026-09-29 | Mobile Phase 1: recorded the `ui-native` component inventory (§9), the hero-overlay exception and native motion tokens (§10), and the HeroUI Native situation (§16). Added `--wearly-height-sheet`, `--wearly-tracking-brand` and a `bg-backdrop` utility. Removed the orphaned `src/tokens.css`, which carried a conflicting violet palette and the `.dark {}` pattern §2 forbids. |
