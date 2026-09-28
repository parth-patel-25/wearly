import { useFonts } from "expo-font";

/**
 * Satoshi — Indian Type Foundry, via Fontshare. Licensed under the ITF Free
 * Font License; see `docs/DESIGN_SYSTEM.md` for the licence note.
 *
 * Loaded from local TTFs rather than a hosted stylesheet so the family name is
 * plain "Satoshi" on every platform. That matters: the shared
 * `--wearly-font-sans` token names the family directly, and a build-hashed name
 * (which is what `next/font` and a font CDN would give us) would resolve on web
 * and break on native.
 *
 * Only the weights the type scale actually uses are bundled — Satoshi ships no
 * 600, so 300/400/500/700 is the complete set.
 */
const satoshiFonts = {
  "Satoshi-Bold": require("../../assets/fonts/satoshi-Bold.ttf"),
  "Satoshi-Light": require("../../assets/fonts/satoshi-Light.ttf"),
  "Satoshi-Medium": require("../../assets/fonts/satoshi-Medium.ttf"),
  "Satoshi-Regular": require("../../assets/fonts/satoshi-Regular.ttf"),
};

/** Load the brand family. Returns `false` until it is safe to render. */
export const useSatoshi = () => useFonts(satoshiFonts);
