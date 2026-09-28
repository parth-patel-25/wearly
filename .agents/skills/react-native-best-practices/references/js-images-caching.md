---
title: Image Caching and Right-Sizing
impact: HIGH
tags: images, expo-image, cache, contentfit, placeholder, thumbnails, blurhash
---

# Skill: Image Caching and Right-Sizing

Use `expo-image` with a deliberate cache policy, and request images at the size you actually display. The core `Image` from `react-native` re-decodes on every mount, and oversized sources are the most common avoidable cause of scroll jank on low-end Android.

## Quick Pattern

**Incorrect:**

```jsx
import { Image } from "react-native"

// No cache. Decodes a 3000px source into a 100px slot. Re-fetches on re-mount.
<Image source={{ uri: item.avatarUrl }} style={{ width: 40, height: 40 }} />
```

**Correct:**

```jsx
import { Image } from "expo-image"

<Image
  source={{ uri: item.avatarUrl }}
  style={{ width: 40, height: 40 }}
  contentFit="cover"
  cachePolicy="memory-disk"
  placeholder={{ blurhash: item.blurhash }}
  transition={150}
/>
```

## When to Use

- Any screen rendering more than a handful of images
- Avatars, feeds, galleries, and product grids
- Images inside virtualized list rows, where cells mount and unmount constantly
- Thumbnails or previews derived from larger originals
- Symptoms: images flash or blank while scrolling, repeated network hits for the same URL, visible jank when a list of images first appears

## Prerequisites

- `expo-image` installed via `npx expo install expo-image`
- A server or CDN that can serve resized derivatives
- Blurhash or thumbnail URLs available for placeholder states

## Version Guardrail

- Confirm `expo-image` is installed before suggesting any fix here. If the project has no `expo-image` dependency, recommend adding it rather than rewriting props against an API that is not present.
- `placeholder` accepts a blurhash string, a thumbnail URI, or a hashed array. Confirm which the codebase already stores before proposing one.
- `cachePolicy` values are `none`, `memory`, `disk`, and `memory-disk`. Do not assume a default; state the policy explicitly for remote images.
- If the project is bare React Native without Expo, `expo-image` still works via `npx install-expo-modules`, but confirm the project accepts Expo modules before recommending it.

## Step-by-Step Instructions

### 1. Replace core `Image` with `expo-image`

Import `Image` from `expo-image`, not `react-native`. Keep the same `style`; the component accepts standard RN style props.

```jsx
// BEFORE
import { Image } from "react-native"

// AFTER
import { Image } from "expo-image"
```

### 2. Set an explicit cache policy

Remote images need a disk-backed policy to survive unmount and app restart. `memory` alone re-fetches every time the view remounts.

```jsx
<Image source={{ uri: url }} cachePolicy="memory-disk" />
```

Use `cachePolicy="none"` only for images that must always be fresh, such as a live camera frame.

### 3. Right-size the source, not just the container

Setting `width` and `height` in `style` only changes layout. The full-resolution source is still downloaded and decoded, which is where the cost lands. Request the derivative your slot needs.

```jsx
// Requests a ~200px-wide asset, not the 3000px original
const src = { uri: `https://cdn.example.com/photo.jpg?w=200&h=200&fit=crop` }

<Image source={src} style={{ width: 100, height: 100 }} contentFit="cover" />
```

When the backend is not yours, treat server-side resizing as an API requirement and request it explicitly. Check what the endpoint supports before assuming query parameters exist.

### 4. Reserve space with a placeholder

Without a placeholder the image has no intrinsic size, so the row shifts when it resolves. A blurhash or tiny thumbnail removes the layout jump.

```jsx
<Image
  source={{ uri: url }}
  placeholder={{ blurhash: hash }}   // or {{ uri: thumbnailUrl }}
  style={{ width: 100, height: 100 }}
/>
```

### 5. Use `contentFit` and `transition` instead of local state

`contentFit` replaces manual resize logic. `transition` fades the real image in over the placeholder, which removes the need for your own `isLoaded` state and its re-render.

```jsx
<Image source={src} contentFit="cover" transition={150} />
```

## Common Pitfalls

- **Core `Image` from `react-native`**: no memory or disk cache. The single highest-impact fix in this skill.
- **Oversized sources**: a 3000px photo in a 100px thumbnail slot. The most common issue in practice, and invisible until you inspect the payload.
- **Layout shift on load**: missing `placeholder` combined with no fixed dimensions.
- **Freshness bugs**: over-aggressive `memory-disk` caching on data that must update, such as an avatar after a profile edit. Use a cache-busting query param or `cachePolicy` scoped to that screen.
- **Recreated `source` objects**: `{ uri }` built inline in render is fine for the value itself, but do not append a timestamp or random token to defeat caching.
- **Unbounded memory**: caching many large images inflates the heap. Pair right-sizing with `recyclingKey` on long lists so recycled cells drop stale decoded bitmaps.

## Related Skills

- [js-lists-flatlist-flashlist.md](./js-lists-flatlist-flashlist.md) - Images are usually rendered inside list rows, where remounting makes caching matter most
- [js-memory-leaks.md](./js-memory-leaks.md) - Unbounded image caching shows up as retained memory
- [bundle-native-assets.md](./bundle-native-assets.md) - Bundle-size and asset-catalog side of the same problem
- [js-measure-fps.md](./js-measure-fps.md) - Measure scroll FPS before and after the change
