import React, { useState, useEffect, useRef } from "react";
import { View, Image, StyleSheet, TouchableWithoutFeedback, Dimensions, TouchableOpacity, Modal } from "react-native";

interface ImagePreviewProps {
  urls: string[];
  init: number;
  show: boolean;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const ImagePreview: React.FC<ImagePreviewProps> = ({ urls, init, show, onClose }) => {
  const [current, setCurrent] = useState(init);
  const startX = useRef<number | null>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (show) setCurrent(init);
  }, [show, init]);

  if (!show) return null;

  const handleTouchStart = (e: any) => {
    startX.current = e.nativeEvent.touches[0].clientX;
    moved.current = false;
  };

  const handleTouchMove = (e: any) => {
    if (startX.current !== null) {
      const diff = e.nativeEvent.touches[0].clientX - startX.current;
      if (Math.abs(diff) > 30) {
        moved.current = true;
      }
    }
  };

  const handleTouchEnd = (e: any) => {
    if (startX.current === null) return;
    const endX = e.nativeEvent.changedTouches[0].clientX;
    const diff = endX - startX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && current > 0) {
        setCurrent(current - 1);
      } else if (diff < 0 && current < urls.length - 1) {
        setCurrent(current + 1);
      }
    } else if (!moved.current) {
      onClose();
    }
    startX.current = null;
    moved.current = false;
  };

  return (
    <Modal
      visible={show}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={styles.overlay}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
          <View style={styles.closeIconContainer}>
            <View style={styles.closeLine1} />
            <View style={styles.closeLine2} />
          </View>
        </TouchableOpacity>
        <TouchableWithoutFeedback>
          <Image
            source={{ uri: urls[current] }}
            style={styles.image}
            resizeMode="contain"
          />
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "fixed",
    zIndex: 9999,
    left: 0,
    top: 0,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: "#00000090",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: screenWidth,
    height: screenHeight,
    borderRadius: 8
  },
  closeButton: {
    position: "absolute",
    top: 30,
    right: 30,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000088",
    borderRadius: 18,
    zIndex: 10000,
  },
  closeIconContainer: {
    width: 20,
    height: 20,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  closeLine1: {
    position: "absolute",
    width: 20,
    height: 2,
    backgroundColor: "#fff",
    transform: [{ rotate: "45deg" }],
  },
  closeLine2: {
    position: "absolute",
    width: 20,
    height: 2,
    backgroundColor: "#fff",
    transform: [{ rotate: "-45deg" }],
  },
});

export default ImagePreview;
