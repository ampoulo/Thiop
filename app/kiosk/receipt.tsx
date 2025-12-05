import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { KioskTheme } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import { Check, Receipt } from "lucide-react-native";

export default function KioskReceipt() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [order, setOrder] = useState<any>(null);

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const ticketAnim = useRef(new Animated.Value(500)).current; // Slide up for ticket

    useEffect(() => {
        if (params.orderData) {
            try {
                const parsedOrder = JSON.parse(params.orderData as string);
                setOrder(parsedOrder);
            } catch (e) {
                console.error("Failed to parse order data", e);
            }
        }

        // Animations
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(ticketAnim, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        // Auto redirect after 30 seconds (longer for receipt reading)
        const timer = setTimeout(() => {
            router.replace("/kiosk");
        }, 30000);

        return () => clearTimeout(timer);
    }, []);

    if (!order) return null;

    // Format date
    const date = new Date(order.date || Date.now());
    const formattedDate = date.toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* SUCCESS ICON */}
                <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
                    <Check size={50} color="#fff" strokeWidth={4} />
                </Animated.View>

                <Animated.View style={{ opacity: fadeAnim, alignItems: "center", width: '100%' }}>
                    <Text style={styles.title}>Commande confirmée !</Text>
                    <Text style={styles.subtitle}>Merci de votre visite</Text>

                    {/* TICKET DE CAISSE */}
                    <Animated.View style={[styles.ticket, { transform: [{ translateY: ticketAnim }] }]}>

                        {/* Ticket Header */}
                        <View style={styles.ticketHeader}>
                            <Text style={styles.restaurantName}>THIOP</Text>
                            <Text style={styles.ticketInfo}>{formattedDate}</Text>
                            <Text style={styles.ticketInfo}>Commande: {order.name}</Text>
                            <View style={styles.dashedLine} />
                        </View>

                        {/* Order Number Big */}
                        <View style={styles.orderNumberContainer}>
                            <Text style={styles.orderNumberLabel}>VOTRE NUMÉRO</Text>
                            <Text style={styles.orderNumber}>{order.id}</Text>
                            {/* Note: using ID as short number, or extract from name if needed */}
                        </View>

                        <View style={styles.dashedLine} />

                        {/* Items List */}
                        <View style={styles.itemsList}>
                            {order.lines?.map((line: any, index: number) => (
                                <View key={index} style={styles.itemRow}>
                                    <Text style={styles.itemQty}>{line.qty}x</Text>
                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemName}>{line.product_name}</Text>
                                    </View>
                                    <Text style={styles.itemPrice}>{line.price_total.toFixed(2)} €</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.dashedLine} />

                        {/* Total */}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>TOTAL</Text>
                            <Text style={styles.totalAmount}>{order.total.toFixed(2)} €</Text>
                        </View>

                        {/* Footer */}
                        <View style={styles.ticketFooter}>
                            <Text style={styles.footerText}>Conservez ce ticket</Text>
                            <Text style={styles.footerText}>Bon appétit !</Text>

                            {/* Barcode simulation */}
                            <View style={styles.barcode}>
                                {[...Array(20)].map((_, i) => (
                                    <View
                                        key={i}
                                        style={{
                                            width: Math.random() > 0.5 ? 2 : 4,
                                            height: 40,
                                            backgroundColor: '#000',
                                            marginHorizontal: 1
                                        }}
                                    />
                                ))}
                            </View>
                        </View>

                        {/* Zigzag bottom effect (simulated with triangles or image, simplified here) */}

                    </Animated.View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.replace("/kiosk")}
                    >
                        <Text style={styles.buttonText}>Nouvelle commande</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: KioskTheme.colors.backgroundSecondary,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: "center",
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#4CD964",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        shadowColor: "#4CD964",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: "900",
        color: KioskTheme.colors.text.primary,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 18,
        color: KioskTheme.colors.text.secondary,
        marginBottom: 30,
    },

    /* TICKET STYLES */
    ticket: {
        backgroundColor: "#fff",
        width: "100%",
        maxWidth: 400,
        padding: 24,
        borderRadius: 12, // Only top rounded usually, but full rounded looks cleaner here
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 5,
        marginBottom: 40,
    },
    ticketHeader: {
        alignItems: "center",
        marginBottom: 15,
    },
    restaurantName: {
        fontSize: 24,
        fontWeight: "900",
        color: "#000",
        marginBottom: 5,
        textTransform: "uppercase",
    },
    ticketInfo: {
        fontSize: 14,
        color: "#666",
        marginBottom: 2,
    },
    dashedLine: {
        width: "100%",
        height: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderStyle: "dashed",
        marginVertical: 15,
    },

    orderNumberContainer: {
        alignItems: "center",
        marginVertical: 5,
    },
    orderNumberLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: "#888",
        letterSpacing: 2,
        marginBottom: 5,
    },
    orderNumber: {
        fontSize: 64,
        fontWeight: "900",
        color: "#000",
    },

    itemsList: {
        width: "100%",
    },
    itemRow: {
        flexDirection: "row",
        marginBottom: 8,
        alignItems: "flex-start",
    },
    itemQty: {
        fontWeight: "700",
        width: 30,
        color: "#000",
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        color: "#000",
        fontWeight: "500",
    },
    itemPrice: {
        fontWeight: "700",
        color: "#000",
        width: 70,
        textAlign: "right",
    },

    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 5,
    },
    totalLabel: {
        fontSize: 20,
        fontWeight: "900",
        color: "#000",
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: "900",
        color: "#000",
    },

    ticketFooter: {
        alignItems: "center",
        marginTop: 20,
    },
    footerText: {
        fontSize: 14,
        color: "#888",
        marginBottom: 5,
    },
    barcode: {
        flexDirection: 'row',
        marginTop: 15,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.7,
    },

    button: {
        backgroundColor: KioskTheme.colors.primary,
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 999,
        width: "100%",
        maxWidth: 300,
        alignItems: "center",
        ...KioskTheme.shadows.button,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 18,
    },
});
