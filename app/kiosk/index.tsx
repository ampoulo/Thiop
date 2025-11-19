import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { KioskTheme } from "@/constants/theme";
import { setOrderType, clearCart } from "@/services/cartService";

export default function KioskWelcome() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        // Reset cart on welcome screen
        clearCart();

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleSelection = async (type: 'eat_in' | 'take_out') => {
        await setOrderType(type);
        router.push("/kiosk/menu");
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>

                {/* LOGO / BRANDING */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>🍔 Thiop</Text>
                </View>

                <Text style={styles.question}>Où souhaitez-vous manger ?</Text>

                <View style={styles.buttonsRow}>
                    {/* SUR PLACE */}
                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.8}
                        onPress={() => handleSelection('eat_in')}
                    >
                        <View style={styles.iconCircle}>
                            <Text style={styles.icon}>🍽️</Text>
                        </View>
                        <Text style={styles.cardTitle}>Sur place</Text>
                    </TouchableOpacity>

                    {/* A EMPORTER */}
                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.8}
                        onPress={() => handleSelection('take_out')}
                    >
                        <View style={[styles.iconCircle, styles.iconCircleAlt]}>
                            <Text style={styles.icon}>🛍️</Text>
                        </View>
                        <Text style={styles.cardTitle}>À emporter</Text>
                    </TouchableOpacity>
                </View>

            </Animated.View>

            {/* FOOTER DECO */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Touchez l'écran pour commencer</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: KioskTheme.colors.primary, // Brand color background
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        alignItems: "center",
        width: "100%",
        maxWidth: 900,
    },
    logoContainer: {
        marginBottom: 60,
        alignItems: "center",
    },
    logoText: {
        fontSize: 60,
        fontWeight: "900",
        color: "#fff",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 24,
        color: "rgba(255,255,255,0.8)",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 2,
    },
    question: {
        fontSize: 32,
        fontWeight: "800",
        color: "#fff",
        marginBottom: 40,
    },
    buttonsRow: {
        flexDirection: "row",
        gap: 40,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 30,
        paddingVertical: 50,
        paddingHorizontal: 60,
        alignItems: "center",
        width: 300,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#FFF0E6",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    iconCircleAlt: {
        backgroundColor: "#E6F4FF",
    },
    icon: {
        fontSize: 50,
    },
    cardTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#333",
    },
    footer: {
        position: "absolute",
        bottom: 40,
    },
    footerText: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 18,
        fontWeight: "600",
    },
});
