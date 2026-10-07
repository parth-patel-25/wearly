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
  const headerRef = useRef<View>(null);
  const titleRef = useRef<View>(null);
  const [photoHeight, setPhotoHeight] = useState(
    Dimensions.get("window").width * (4 / 3)
  );
  const [headerSolid, setHeaderSolid] = useState(false);
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

  // The worklet above must stay on the UI thread — calling it from a JS
  // scroll callback throws — so the header flag syncs back separately. It
  // flips on threshold crossings only, so `runOnJS` fires rarely (rest <->
  // scrolled) instead of per-frame.
  useAnimatedReaction(
    () => scrollY.value,
    (y) => {
      if (y > HEADER_SOLID_AT && !solidShared.value) {
        solidShared.value = true;
        runOnJS(setHeaderSolid)(true);
      } else if (y <= 0 && solidShared.value) {
        solidShared.value = false;
        runOnJS(setHeaderSolid)(false);
      }
      const hidden = y > crossAt.value;
      if (hidden !== titleHiddenShared.value) {
        titleHiddenShared.value = hidden;
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

  return {
    headerRef,
    headerSolid,
    onCrossingLayout,
    onPhotoLayout,
    onScroll,
    photoStyle,
    scrollerMarginTop: -photoHeight,
    spacerHeight: Math.max(photoHeight - SHEET_PEEK, 0),
    titleHidden,
    titleRef,
  };
}
