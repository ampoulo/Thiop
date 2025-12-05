import React, { useRef, useEffect, useState } from "react";
import {
  Animated,
  Text,
  Image,
  StyleSheet,
  Easing,
  TouchableOpacity,
  View,
} from "react-native";
import { Plus, Minus } from "lucide-react-native";
import { getCart, updateCartItem } from "@/services/cartService";

import { Product } from "@/types/kiosk";

interface ProductCardProps {
  item: Product;
  onQuickAdd?: (product: Product) => void;
}

export default function ProductCard({ item, onQuickAdd }: ProductCardProps) {
  const scale = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [cartQuantity, setCartQuantity] = useState(0);
  const [cartItemKey, setCartItemKey] = useState<string | null>(null);

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

    // Check if item is in cart
    checkCartQuantity();
  }, []);

  const checkCartQuantity = async () => {
    const cart = await getCart();
    if (cart && cart.items) {
      // Find item in cart (simple match by product id without attributes)
      const cartItem = cart.items.find((ci: any) => ci.id === item.id.toString());
      if (cartItem) {
        setCartQuantity(cartItem.quantity);
        setCartItemKey(cartItem.uniqueKey);
      } else {
        setCartQuantity(0);
        setCartItemKey(null);
      }
    }
  };

  const handleQuickAdd = async (e: any) => {
    e.stopPropagation();
    if (onQuickAdd) {
      await onQuickAdd(item);
      // Refresh cart quantity
      setTimeout(checkCartQuantity, 300);
    }
  };

  const handleIncrement = async (e: any) => {
    e.stopPropagation();
    if (cartItemKey) {
      await updateCartItem(cartItemKey, cartQuantity + 1);
      setCartQuantity(cartQuantity + 1);
    }
  };

  const handleDecrement = async (e: any) => {
    e.stopPropagation();
    if (cartItemKey) {
      const newQty = cartQuantity - 1;
      if (newQty <= 0) {
        await updateCartItem(cartItemKey, 0);
        setCartQuantity(0);
        setCartItemKey(null);
      } else {
        await updateCartItem(cartItemKey, newQty);
        setCartQuantity(newQty);
      }
    }
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <Image source={{ uri: item.image }} style={styles.img} />

      <Text style={styles.name}>{item.name}</Text>

      {/* Description */}
      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.priceRow}>
        <Text style={styles.price}>{item.price.toFixed(2)} €</Text>

        {/* Quantity Controls or Add Button */}
        {cartQuantity > 0 ? (
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={handleDecrement}
              activeOpacity={0.7}
            >
              <Minus size={20} color="#fff" strokeWidth={3} />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{cartQuantity}</Text>

            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={handleIncrement}
              activeOpacity={0.7}
            >
              <Plus size={20} color="#fff" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleQuickAdd}
            activeOpacity={0.7}
          >
            <Plus size={24} color="#fff" strokeWidth={3} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
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
    width: "60%",
    aspectRatio: 1,
    resizeMode: "contain",
    marginBottom: 18,
  },

  name: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
    color: "#222",
  },

  description: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    color: "#666",
    marginBottom: 12,
    paddingHorizontal: 8,
    lineHeight: 18,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    width: "100%",
  },

  price: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FF6B35",
    textAlign: "center",
  },

  addBtn: {
    backgroundColor: "#FF6B35",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },

  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FF6B35",
    borderRadius: 22,
    paddingHorizontal: 6,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },

  quantityBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },

  quantityText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    minWidth: 30,
    textAlign: "center",
  },
});
