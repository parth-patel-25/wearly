---
description: Enforce the standard assets folder structure (images, icons, audio, video, fonts) for all media files
globs: ["**"]
---

# Assets Folder Structure Rules (MANDATORY)

## Standard Assets Structure

Every media file (image, icon, font, audio, video) MUST live in its matching subfolder under the `assets` directory:

```
assets/
├── images/
├── icons/
├── audio/
├── video/
└── fonts/
```

Applied to the project layout:

```
src/
└── assets/
    ├── images/   # PNG, JPG, JPEG, WEBP, GIF, SVG illustrations, photos
    ├── icons/    # SVG icons, logo marks, favicon variants
    ├── audio/    # MP3, WAV, OGG, AAC
    ├── video/    # MP4, WEBM, MOV
    └── fonts/    # WOFF, WOFF2, TTF, OTF
```

## Rules

### 1. Categorize Every Asset
- Photos, illustrations, hero images, banners → `assets/images/`
- Icons, logos, logo components → `assets/icons/`
- Sound effects, music, narration → `assets/audio/`
- Video clips, backgrounds → `assets/video/`
- Font files, variable fonts → `assets/fonts/`

### 2. NEVER Mix Asset Types
```text
# ❌ BAD - Mixed types in the root
src/assets/hero.png
src/assets/logo.svg
src/assets/sound.mp3
src/assets/font.woff2

# ✅ GOOD - Categorized
src/assets/images/hero.png
src/assets/icons/logo.svg
src/assets/audio/sound.mp3
src/assets/fonts/font.woff2
```

### 3. Public Assets Follow the Same Pattern
- Root-served assets in `public/` use the same subfolders: `public/images/`, `public/icons/`, `public/fonts/`, etc.
- The site favicon stays at `public/icons/favicon.svg` and is referenced as `/icons/favicon.svg`
- Keep the browser-convention `/favicon.svg` or `/favicon.ico` at the root ONLY when a browser must auto-discover it without markup

### 4. Imports Reference the Subfolder
```typescript
// ✅ GOOD - import from the categorized path
import heroImg from "@/assets/images/hero.png"
import { LogoIcon } from "@/assets/icons/logo.svg"

// ❌ BAD - flat import
import heroImg from "@/assets/hero"
```

### 5. Naming Convention
- `kebab-case` filenames (e.g., `profile-avatar.png`, `hero-banner.webp`)
- SVGs used as React components are named `PascalCase.tsx` and kept in `src/assets/icons/`

## Asset Checklist

- [ ] File placed in the correct subfolder (images/icons/audio/video/fonts)
- [ ] `kebab-case` filename
- [ ] No asset type mixed at the folder root
- [ ] Imports/URLs updated to the new path

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-09-15 | Initial assets folder structure rules |