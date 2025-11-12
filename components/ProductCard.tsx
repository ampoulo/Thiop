import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  Platform,
  StyleSheet,
  Image,
  Text,
} from "react-native";

interface ProductCardProps {
  item: {
    id: string | number;
    name: string;
    price: number;
    image?: string | null;
  };
  onPress: () => void;
}

export default function ProductCard({ item, onPress }: ProductCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // ✅ Apparition fluide à l’arrivée
  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const animateIn = () => {
    Animated.spring(scale, {
      toValue: 1.05,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={Platform.OS === "web" ? animateIn : undefined}
      onHoverOut={Platform.OS === "web" ? animateOut : undefined}
      onPressIn={Platform.OS !== "web" ? animateIn : undefined}
      onPressOut={Platform.OS !== "web" ? animateOut : undefined}
      style={{ flex: 1 }}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <Image
          source={{ uri: item.image || "https://via.placeholder.com/150" }}
          style={styles.image}
        />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{item.price.toFixed(2)} €</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginHorizontal: 8, // ✅ espace horizontal
    marginVertical: 10, // ✅ espace vertical
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    color: "#FF6B35",
    fontWeight: "700",
  },
});
