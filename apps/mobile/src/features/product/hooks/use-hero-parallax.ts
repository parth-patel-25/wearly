import { DURATION } from "@wearly/design-tokens/motion";
import { useRef, useState } from "react";
import type { LayoutChangeEvent, View } from "react-native";
import { Dimensions } from "react-native";
import {
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/**
 * Hero parallax for the product screen.
 *
 * The photograph is fixed behind the sheet; as the sheet slides up over it,
 * the photo drifts up at half the scroll speed instead of sitting static or
 * scrolling 1:1 with the content. That lag is the depth.
 *
 * Everything scroll-linked runs on the UI thread through Reanimated shared
 * values, so no re-render happens per frame. The photo height is measured
 * with `onLayout` (estimated from the full-bleed 3:4 frame first, so the
 * sheet starts in the right place on frame one). Under reduced motion the
 * photo stays put — only the movement is dropped.
 *
 * It also reports when the in-content title has scrolled fully past the
 * header (`titleHidden`), so the header can take over showing the piece name.
 * Both flags only flip on crossings, never per-frame.
 */

// `SHEET_PEEK` (size-16): how far the sheet overlaps the photo's bottom edge
// at rest, so the rounded top corners read against the photograph.
export const SHEET_PEEK = 64;

// How far the photo drifts for each point of scroll. Below 1.0 so the photo
// lags the sheet.
const PARALLAX_FACTOR = 0.5;

// Scroll offset past which the header turns solid. Clears at rest (`y <= 0`),
// so the band between never flickers mid-scroll.
const HEADER_SOLID_AT = 8;

export function useHeroParallax() {
  const reduceMotion = useReducedMotion() === true;
  const scrollY = useSharedValue(0);
  const solidShared = useSharedValue(false);
  const crossAt = useSharedValue(0);
  const titleHiddenShared = useSharedValue(false);
  const titleOpacity = useSharedValue(0);
  const chromeOpacity = useSharedValue(0);
  const headerRef = useRef<View>(null);
  const titleRef = useRef<View>(null);
  const [photoHeight, setPhotoHeight] = useState(
    Dimensions.get("window").width * (4 / 3)
  );
  const [titleHidden, setTitleHidden] = useState(false);

  const onPhotoLayout = (event: LayoutChangeEvent): void => {
    setPhotoHeight(event.nativeEvent.layout.height);
  };

  // The crossing point is measured in page coordinates — title bottom minus
  // header bottom — so insets and type sizes cannot throw it off. Recomputed
  // on either layout, which also covers rotation.
  const onCrossingLayout = (): void => {
    titleRef.current?.measure((_x, _y, _w, h, _pageX, pageY) => {
      headerRef.current?.measure((_hx, _hy, _hw, hh, _hpageX, hpageY) => {
        crossAt.value = pageY + h - (hpageY + hh);
      });
    });
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // The chrome (status backdrop, bar background, hairline) shares one
  // animated opacity rather than swapping classes.
  useAnimatedReaction(
    () => scrollY.value,
    (y) => {
      if (y > HEADER_SOLID_AT && !solidShared.value) {
        solidShared.value = true;
        chromeOpacity.value = reduceMotion
          ? 1
          : withTiming(1, { duration: DURATION.base });
      } else if (y <= 0 && solidShared.value) {
        solidShared.value = false;
        chromeOpacity.value = reduceMotion
          ? 0
          : withTiming(0, { duration: DURATION.base });
      }
    }
  );

  // The header title handoff. Each flag flips on crossings only, so `runOnJS`
  // fires rarely (rest <-> scrolled) instead of per-frame.
  useAnimatedReaction(
    () => scrollY.value,
    (y) => {
      const hidden = y > crossAt.value;
      if (hidden !== titleHiddenShared.value) {
        titleHiddenShared.value = hidden;
        if (reduceMotion) {
          titleOpacity.value = hidden ? 1 : 0;
        } else {
          titleOpacity.value = withTiming(hidden ? 1 : 0, {
            duration: DURATION.base,
          });
        }
        runOnJS(setTitleHidden)(hidden);
      }
    }
  );

  const photoStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          reduceMotion || scrollY.value <= 0
            ? 0
            : -scrollY.value * PARALLAX_FACTOR,
      },
    ],
  }));

  // The header title fade. Always mounted — opacity alone shows and hides it,
  // so fade-outs never unmount mid-transition.
  const titleFadeStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  // Status backdrop, bar background and hairline fade as one.
  const chromeStyle = useAnimatedStyle(() => ({
    opacity: chromeOpacity.value,
  }));

  return {
    chromeStyle,
    headerRef,
    onCrossingLayout,
    onPhotoLayout,
    onScroll,
    photoStyle,
    scrollerMarginTop: -photoHeight,
    spacerHeight: Math.max(photoHeight - SHEET_PEEK, 0),
    titleFadeStyle,
    titleHidden,
    titleRef,
  };
}
