import { useState } from "react";
import { Dimensions, Modal, Pressable, ScrollView, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { Button } from "@wearly/ui-native/button";
import { Icon } from "@wearly/ui-native/icon";
import { Text } from "@wearly/ui-native/text";

interface ImageViewerProps {
  images: string[];
  initialIndex?: number;
  visible: boolean;
  onClose: () => void;
}

function ZoomableImage({ uri }: { uri: string }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        return;
      }
      savedScale.value = scale.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withSpring(2);
        savedScale.value = 2;
      }
    });

  const composed = Gesture.Simultaneous(pinch, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <Image
          contentFit="contain"
          source={{ uri }}
          style={{ flex: 1, width: "100%", height: "100%" }}
        />
      </Animated.View>
    </GestureDetector>
  );
}

export function FullScreenImageViewer({
  images,
  initialIndex = 0,
  visible,
  onClose,
}: ImageViewerProps) {
  const [index, setIndex] = useState(initialIndex);
  const { width } = Dimensions.get("window");

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-black">
        <View className="flex-row items-center justify-between px-4 pt-safe pb-2">
          <Text tone="primary-foreground" variant="bodySm">
            {`${index + 1} / ${images.length}`}
          </Text>
          <Pressable onPress={onClose}>
            <Icon name="close" size="md" tone="primary-foreground" />
          </Pressable>
        </View>
        <ScrollView
          horizontal
          onMomentumScrollEnd={(e) => {
            const next = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
            setIndex(next);
          }}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        >
          {images
            .filter((img) => !!img)
            .map((img, i) => (
              <View key={`${img}-${i}`} style={{ width }}>
                <ZoomableImage uri={img} />
              </View>
            ))}
        </ScrollView>
        <View className="flex-row justify-center gap-4 px-4 pb-8 pt-2">
          <Button onPress={onClose} variant="soft">
            Close
          </Button>
        </View>
      </View>
      </GestureHandlerRootView>
    </Modal>
  );
}