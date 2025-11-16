import React, { useRef, useEffect } from "react";
import {
  Animated,
  Pressable,
  Text,
  Image,
  StyleSheet,
  Platform,
  Easing,
} from "react-native";

export default function ProductCard({ item, onPress }) {
  const scale = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hover = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const hoverIn = () => {
    Animated.spring(hover, {
      toValue: 1.04,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const hoverOut = () => {
    Animated.spring(hover, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={Platform.OS === "web" ? hoverIn : undefined}
      onHoverOut={Platform.OS === "web" ? hoverOut : undefined}
      onPressIn={Platform.OS !== "web" ? hoverIn : undefined}
      onPressOut={Platform.OS !== "web" ? hoverOut : undefined}
    >
      <Animated.View
        style={[
          styles.card,
          {
            opacity,
            transform: [{ scale }, { scale: hover }],
          },
        ]}
      >
        <Image source={{ uri: item.image }} style={styles.img} />

        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{item.price.toFixed(2)} €</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 42,
    padding: 26,
    marginBottom: 26,

    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 5,

    alignItems: "center",
  },

  img: {
    width: "60%",       // OPTION B — requested size
    aspectRatio: 1,
    resizeMode: "contain",
    marginBottom: 18,
  },

  name: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    color: "#222",
  },

  price: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FF6B35",
    textAlign: "center",
  },
});
