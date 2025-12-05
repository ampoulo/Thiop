import React, { useEffect, useState, useRef, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Modal,
    Animated,
    Platform,
    Dimensions,
    TouchableWithoutFeedback,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { X } from "lucide-react-native";

import { addToCart } from "@/services/cartService";
import { fetchItemDetails } from "@/services/api";
import { KioskTheme } from "@/constants/theme";
import { Product, Attribute } from "@/types/kiosk";
import { LoadingAnimation } from "@/components/kiosk/LoadingAnimation";

interface ProductDetailsModalProps {
    visible: boolean;
    product: Product | null;
    onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ProductDetailsModal({
    visible,
    product,
    onClose,
}: ProductDetailsModalProps) {
    const insets = useSafeAreaInsets();
    const [fullItem, setFullItem] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<number, number[]>>({});
    const [quantity, setQuantity] = useState(1);

    // Animations
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current; // For add button

    useEffect(() => {
        if (visible && product) {
            // Reset state
            setLoading(true);
            setQuantity(1);
            setSelectedAttributes({});
            setFullItem(null);

            // Start Animations
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    damping: 20,
                    stiffness: 90,
                    useNativeDriver: true,
                }),
            ]).start();

            // Fetch Details
            loadDetails(product.id.toString());
        } else {
            // Close Animations
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: SCREEN_HEIGHT,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, product]);

    const loadDetails = async (id: string) => {
        try {
            const data = await fetchItemDetails(id);
            setFullItem(data);
        } catch (error) {
            console.error("Failed to load item details", error);
            Toast.show({
                type: "error",
                text1: "Erreur",
                text2: "Impossible de charger les détails du produit",
            });
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
        });
    };

    /** Prix total */
    const basePrice = useMemo(() => {
        if (!fullItem) return product?.price || 0;
        let p = fullItem.price;
        fullItem.attributes?.forEach((attr) => {
            selectedAttributes[attr.id]?.forEach((id) => {
                const obj = attr.values.find((v) => v.id === id);
                p += obj?.price_extra ?? 0;
            });
        });
        return p;
    }, [fullItem, selectedAttributes, product]);

    const totalDisplay = (basePrice * quantity).toFixed(2);

    /** Sélection d’une option */
    const selectValue = (attrId: number, valId: number, type: 'radio' | 'checkbox') => {
        setSelectedAttributes((prev) => {
            const current = prev[attrId] || [];
            if (type === "radio") return { ...prev, [attrId]: [valId] };

            if (current.includes(valId))
                return { ...prev, [attrId]: current.filter((v) => v !== valId) };

            return { ...prev, [attrId]: [...current, valId] };
        });
    };

    /** Ajouter au panier */
    const handleAddToCart = async () => {
        if (!fullItem) return;

        // Button Animation
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();

        const selectedOptions = fullItem.attributes
            ?.map((attr) => {
                const sel = selectedAttributes[attr.id];
                if (!sel) return null;

                const values = sel
                    .map((id) => {
                        const v = attr.values.find((x) => x.id === id);
                        return v
                            ? { id: v.id, name: v.name, price_extra: v.price_extra }
                            : null;
                    })
                    .filter(Boolean);

                return { id: attr.id, name: attr.name, values };
            })
            .filter(Boolean);

        const data = {
            id: fullItem.id,
            name: fullItem.name,
            price: fullItem.price,
            total_price: basePrice,
            quantity,
            image: fullItem.image,
            selectedAttributes: selectedOptions,
        };

        await addToCart(data);

        Toast.show({
            type: "success",
            text1: "Ajouté au panier",
            text2: `${quantity}x ${fullItem.name}`,
        });

        handleClose();
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            onRequestClose={handleClose}
            animationType="none"
        >
            <View style={styles.container}>
                {/* BLUR BACKGROUND */}
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
                    <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleClose} activeOpacity={1} />
                </Animated.View>

                {/* MODAL CONTENT */}
                <Animated.View
                    style={[
                        styles.modalCard,
                        {
                            transform: [{ translateY: slideAnim }],
                            paddingBottom: insets.bottom + 20,
                        },
                    ]}
                >
                    {/* HANDLE BAR */}
                    <View style={styles.handleBarContainer}>
                        <View style={styles.handleBar} />
                        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                            <X size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {loading || !fullItem ? (
                        <View style={styles.loadingContainer}>
                            <LoadingAnimation />
                        </View>
                    ) : (
                        <>
                            <ScrollView
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {/* IMAGE */}
                                <View style={styles.imageContainer}>
                                    <Image
                                        source={{ uri: fullItem.image }}
                                        style={styles.image}
                                    />
                                </View>

                                {/* HEADER INFO */}
                                <Text style={styles.title}>{fullItem.name}</Text>
                                <Text style={styles.price}>{fullItem.price.toFixed(2)} €</Text>
                                {fullItem.description ? (
                                    <Text style={styles.description}>{fullItem.description}</Text>
                                ) : null}

                                {/* ATTRIBUTES */}
                                {fullItem.attributes?.map((attr) => (
                                    <View key={attr.id} style={styles.section}>
                                        <Text style={styles.sectionTitle}>{attr.name}</Text>
                                        {attr.values.map((v) => {
                                            const selected = selectedAttributes[attr.id]?.includes(v.id);
                                            const isRadio = attr.type === "radio";
                                            return (
                                                <TouchableOpacity
                                                    key={v.id}
                                                    style={[styles.option, selected && styles.optionActive]}
                                                    onPress={() => selectValue(attr.id, v.id, attr.type)}
                                                >
                                                    <Text style={styles.optionLabel}>
                                                        {isRadio ? (selected ? "🔘" : "⚪") : selected ? "☑️" : "⬜"}
                                                        {"  "}
                                                        {v.name}
                                                    </Text>
                                                    <Text style={styles.optionPrice}>
                                                        +{v.price_extra.toFixed(2)} €
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                ))}

                                {/* SPACER FOR BOTTOM BAR */}
                                <View style={{ height: 100 }} />
                            </ScrollView>

                            {/* BOTTOM BAR (Fixed) */}
                            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
                                {/* QUANTITY */}
                                <View style={styles.qtyContainer}>
                                    <TouchableOpacity
                                        style={styles.qtyBtn}
                                        onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                                    >
                                        <Text style={styles.qtyText}>−</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.qtyValue}>{quantity}</Text>
                                    <TouchableOpacity
                                        style={styles.qtyBtn}
                                        onPress={() => setQuantity((q) => q + 1)}
                                    >
                                        <Text style={styles.qtyText}>＋</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* ADD BUTTON */}
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={handleAddToCart}
                                    style={{ flex: 1 }}
                                >
                                    <Animated.View style={[styles.addBtn, { transform: [{ scale: scaleAnim }] }]}>
                                        <Text style={styles.addBtnText}>
                                            Ajouter • {totalDisplay} €
                                        </Text>
                                    </Animated.View>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-end",
    },
    modalCard: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: "90%", // Takes up 90% of screen
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 20,
        overflow: "hidden",
    },
    handleBarContainer: {
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        backgroundColor: "#fff",
        zIndex: 10,
    },
    handleBar: {
        width: 50,
        height: 5,
        backgroundColor: "#ddd",
        borderRadius: 10,
    },
    closeBtn: {
        position: "absolute",
        right: 20,
        top: 15,
        padding: 5,
        backgroundColor: "#f5f5f5",
        borderRadius: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    imageContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    image: {
        width: 250,
        height: 250,
        resizeMode: "contain",
    },
    title: {
        fontSize: 28,
        fontWeight: "900",
        color: KioskTheme.colors.text.primary,
        textAlign: "center",
        marginBottom: 5,
    },
    price: {
        fontSize: 24,
        fontWeight: "800",
        color: KioskTheme.colors.primary,
        textAlign: "center",
        marginBottom: 15,
    },
    description: {
        fontSize: 16,
        color: KioskTheme.colors.text.secondary,
        textAlign: "center",
        marginBottom: 30,
        lineHeight: 22,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "800",
        marginBottom: 15,
        color: KioskTheme.colors.text.primary,
    },
    option: {
        backgroundColor: "#f9f9f9",
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "transparent",
    },
    optionActive: {
        backgroundColor: "#fff5f0",
        borderColor: KioskTheme.colors.primary,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    optionPrice: {
        fontSize: 16,
        fontWeight: "800",
        color: KioskTheme.colors.primary,
    },
    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        paddingTop: 15,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },
    qtyContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: 50,
        padding: 5,
    },
    qtyBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    qtyText: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333",
    },
    qtyValue: {
        fontSize: 18,
        fontWeight: "800",
        marginHorizontal: 15,
        minWidth: 20,
        textAlign: "center",
    },
    addBtn: {
        backgroundColor: KioskTheme.colors.primary,
        borderRadius: 50,
        paddingVertical: 15,
        alignItems: "center",
        shadowColor: KioskTheme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    addBtnText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "800",
    },
});
