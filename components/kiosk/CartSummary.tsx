import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShoppingCart } from "lucide-react-native";
import { getCart, addCartListener } from "@/services/cartService";
import { KioskTheme } from "@/constants/theme";
import { Cart } from "@/types/kiosk";

const { width } = Dimensions.get("window");

export default function CartSummary() {
    const [cart, setCart] = useState<Cart | null>(null);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Animation for slide up/down
    const translateY = useRef(new Animated.Value(100)).current;

    const loadCart = async () => {
        const c = await getCart();
        setCart(c);
        console.log("CartSummary: Cart loaded", c ? `Items: ${c.items.length}` : "No cart");

        // Animate based on cart content
        const hasItems = c && c.items && c.items.length > 0;
        Animated.spring(translateY, {
            toValue: hasItems ? 0 : 200,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
        }).start();
    };

    // Listen to cart changes
    useEffect(() => {
        const unsubscribe = addCartListener(() => {
            loadCart();
        });
        return unsubscribe;
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadCart();
        }, [])
    );

    // if (!cart || cart.items.length === 0) return null; // REMOVED to prevent unmounting issues

    const itemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
    const total = cart?.total || 0;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    bottom: insets.bottom + 20,
                    transform: [{ translateY }],
                    // Hide completely if off-screen to avoid touch events
                    opacity: translateY.interpolate({
                        inputRange: [0, 100],
                        outputRange: [1, 0],
                    }),
                },
            ]}
        >
            <TouchableOpacity
                style={styles.content}
                activeOpacity={0.9}
                onPress={() => router.push("/kiosk/cart")}
            >
                {/* LEFT: Total & Count */}
                <View style={styles.infoSection}>
                    <View style={styles.iconBadge}>
                        <ShoppingCart size={24} color={KioskTheme.colors.primary} />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{itemCount}</Text>
                        </View>
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalPrice}>{total.toFixed(2)} €</Text>
                    </View>
                </View>

                {/* RIGHT: Action Button */}
                <View style={styles.actionBtn}>
                    <Text style={styles.actionText}>Procéder au paiement</Text>
                    <Text style={styles.arrow}>→</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        left: 20,
        right: 20,
        alignItems: "center",
        zIndex: 100,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#222", // Dark background for contrast
        borderRadius: 999,
        paddingVertical: 12,
        paddingHorizontal: 24,
        width: "100%",
        maxWidth: 600,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    infoSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    iconBadge: {
        position: "relative",
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 50,
    },
    badge: {
        position: "absolute",
        top: -5,
        right: -5,
        backgroundColor: KioskTheme.colors.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    badgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
    },
    textContainer: {
        justifyContent: "center",
    },
    totalLabel: {
        color: "#aaa",
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    totalPrice: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: KioskTheme.colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 50,
        gap: 8,
    },
    actionText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    arrow: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});
