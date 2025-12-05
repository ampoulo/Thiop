import { useFocusEffect } from "expo-router";
import { useCallback, useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    Image,
    Animated,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Keyboard,
    Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { fetchCategories, searchProducts, fetchProductsByCategory, fetchItemDetails } from "@/services/api";
import { getCart, setOrderType, addToCart } from "@/services/cartService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsiveGrid } from "@/hooks/useResponsiveGrid";
import { KioskTheme } from "@/constants/theme";
import { Category, Product } from "@/types/kiosk";
import CartSummary from "@/components/kiosk/CartSummary";
import { XCircle, RefreshCw, LogOut, Search, X } from "lucide-react-native";
import { LoadingAnimation } from "@/components/kiosk/LoadingAnimation";
import ProductDetailsModal from "@/components/kiosk/ProductDetailsModal";
import ProductCard from "@/components/ProductCard";
import Reanimated from "react-native-reanimated";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function KioskMenu() {
    const insets = useSafeAreaInsets();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showExitModal, setShowExitModal] = useState(false);
    const [orderType, setOrderTypeState] = useState<'eat_in' | 'take_out'>('eat_in');

    // View Mode State
    const [viewMode, setViewMode] = useState<'grid' | 'category'>('grid');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Product Modal State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeout = useRef<any>(null);

    const router = useRouter();
    const { itemWidth, gap } = useResponsiveGrid();

    // Page animation
    const fadeScreen = useRef(new Animated.Value(0)).current;
    const translateScreen = useRef(new Animated.Value(20)).current;

    // Layout animations
    const sidebarTranslateX = useRef(new Animated.Value(-280)).current;
    const productsOpacity = useRef(new Animated.Value(0)).current;
    const gridOpacity = useRef(new Animated.Value(1)).current;

    // Category animation refs (for staggered animation)
    const categoryAnimRefs = useRef<Map<number, Animated.ValueXY>>(new Map());

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                setLoading(true);
                try {
                    const [cats, cart] = await Promise.all([fetchCategories(), getCart()]);
                    setCategories(cats);
                    if (cart) setOrderTypeState(cart.orderType || 'eat_in');

                    // Initialize animation values for each category
                    cats.forEach((cat) => {
                        if (!categoryAnimRefs.current.has(cat.id)) {
                            categoryAnimRefs.current.set(cat.id, new Animated.ValueXY({ x: 0, y: 0 }));
                        }
                    });
                } finally {
                    setLoading(false);

                    // animations
                    Animated.parallel([
                        Animated.timing(fadeScreen, {
                            toValue: 1,
                            duration: KioskTheme.animations.duration.medium,
                            useNativeDriver: KioskTheme.animations.config.useNativeDriver,
                        }),
                        Animated.timing(translateScreen, {
                            toValue: 0,
                            duration: KioskTheme.animations.duration.medium,
                            useNativeDriver: KioskTheme.animations.config.useNativeDriver,
                        }),
                    ]).start();
                }
            };

            load();
        }, [])
    );

    const handleBackPress = async () => {
        if (viewMode === 'category') {
            // Return to grid
            handleReturnToGrid();
            return;
        }

        const cart = await getCart();
        if (!cart || cart.items.length === 0) {
            router.replace("/kiosk");
        } else {
            setShowExitModal(true);
        }
    };

    const handleSwitchMode = async () => {
        const newType = orderType === 'eat_in' ? 'take_out' : 'eat_in';
        await setOrderType(newType);
        setOrderTypeState(newType);
        setShowExitModal(false);
    };

    const handleConfirmExit = () => {
        setShowExitModal(false);
        router.replace("/kiosk");
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.length > 2) {
            setIsSearching(true);

            if (viewMode === 'grid') {
                // Global search via API
                if (searchTimeout.current) clearTimeout(searchTimeout.current);
                searchTimeout.current = setTimeout(async () => {
                    const results = await searchProducts(text);
                    setSearchResults(results);
                }, 500);
            } else {
                // Local search within current category products
                if (searchTimeout.current) clearTimeout(searchTimeout.current);
                searchTimeout.current = setTimeout(() => {
                    const filtered = products.filter((p) =>
                        p.name.toLowerCase().includes(text.toLowerCase())
                    );
                    setSearchResults(filtered);
                }, 300);
            }
        } else {
            setIsSearching(false);
            setSearchResults([]);
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setIsSearching(false);
        Keyboard.dismiss();
    };

    const handleCategoryPress = async (category: Category) => {
        setLoadingProducts(true);
        setSelectedCategory(category);

        try {
            const prods = await fetchProductsByCategory(category.id.toString());
            setProducts(prods);
        } finally {
            setLoadingProducts(false);
        }

        // SIMPLIFIED ANIMATION: Staggered left movement
        setViewMode('category');

        // Animate categories flying left in staggered fashion
        const animations = categories.map((cat, idx) => {
            const animValue = categoryAnimRefs.current.get(cat.id);
            if (!animValue) return null;

            return Animated.parallel([
                Animated.timing(animValue.x, {
                    toValue: -SCREEN_WIDTH, // Move far left
                    duration: 500,
                    delay: idx * 50, // Stagger each by 50ms
                    useNativeDriver: true,
                }),
                Animated.timing(animValue.y, {
                    toValue: idx * 10, // Slight vertical spacing
                    duration: 500,
                    delay: idx * 50,
                    useNativeDriver: true,
                }),
            ]);
        }).filter(Boolean);

        Animated.parallel([
            ...animations,
            Animated.timing(gridOpacity, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(sidebarTranslateX, {
                toValue: 0,
                damping: 15,
                stiffness: 70,
                mass: 1,
                useNativeDriver: true,
            }),
            Animated.timing(productsOpacity, {
                toValue: 1,
                duration: 500,
                delay: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Reset animations for next time
            categories.forEach((cat) => {
                const animValue = categoryAnimRefs.current.get(cat.id);
                if (animValue) {
                    animValue.setValue({ x: 0, y: 0 });
                }
            });
        });
    };

    const handleReturnToGrid = () => {
        // Animate back to grid
        Animated.parallel([
            Animated.timing(productsOpacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(sidebarTranslateX, {
                toValue: -280,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(gridOpacity, {
                toValue: 1,
                duration: 300,
                delay: 100,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setViewMode('grid');
            setSelectedCategory(null);
            setProducts([]);
        });
    };

    const handleProductPress = (product: Product) => {
        setSelectedProduct(product);
        setModalVisible(true);
    };

    const handleQuickAdd = async (product: Product) => {
        // Fetch full product details to check for attributes
        try {
            const fullProduct = await fetchItemDetails(product.id.toString());

            // Check if product has attributes that require selection
            const hasAttributes = fullProduct.attributes && fullProduct.attributes.length > 0;

            if (hasAttributes) {
                // Open modal for configuration
                setSelectedProduct(fullProduct);
                setModalVisible(true);
            } else {
                // Add directly to cart
                await addToCart({
                    id: fullProduct.id,
                    name: fullProduct.name,
                    price: fullProduct.price,
                    image: fullProduct.image,
                    quantity: 1,
                    selectedAttributes: [],
                });

                // Show toast notification
                Toast.show({
                    type: "success",
                    text1: "Ajouté au panier",
                    text2: `${fullProduct.name}`,
                });
            }
        } catch (error) {
            console.error("Error adding product:", error);
        }
    };

    if (loading) {
        return <LoadingAnimation />;
    }

    return (
        <Animated.View
            style={[
                styles.screen,
                {
                    opacity: fadeScreen,
                    transform: [{ translateY: translateScreen }],
                },
            ]}
        >
            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                        <Text style={styles.backText}>⟵ {viewMode === 'category' ? 'Menu' : 'Retour'}</Text>
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={styles.title}>
                            {viewMode === 'category' && selectedCategory ? selectedCategory.name : 'Notre Carte'}
                        </Text>
                        {viewMode === 'grid' && (
                            <View style={styles.modeBadge}>
                                <Text style={styles.modeText}>
                                    {orderType === 'eat_in' ? '🍽️ Sur place' : '🛍️ À emporter'}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={{ width: 80 }} />
                </View>

                {/* SEARCH BAR */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Search size={24} color={KioskTheme.colors.text.secondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Rechercher un produit..."
                            placeholderTextColor={KioskTheme.colors.text.secondary}
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={clearSearch}>
                                <X size={24} color={KioskTheme.colors.text.secondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* MAIN CONTENT AREA */}
            <View style={styles.contentContainer}>

                {/* SIDEBAR (Category View) */}
                {viewMode === 'category' && (
                    <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarTranslateX }] }]}>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarContent}>
                            {categories.map((cat) => {
                                const isActive = selectedCategory?.id === cat.id;
                                return (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                                        onPress={() => handleCategoryPress(cat)}
                                    >
                                        <Reanimated.Image
                                            source={{ uri: cat.image || "https://via.placeholder.com/50" }}
                                            style={styles.sidebarIcon}
                                            sharedTransitionTag={`category-icon-${cat.id}`}
                                        />
                                        <Text style={[styles.sidebarText, isActive && styles.sidebarTextActive]}>
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </Animated.View>
                )}

                {/* GRID VIEW */}
                {viewMode === 'grid' && (
                    <Animated.View style={[styles.gridContainer, { opacity: gridOpacity }]}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{
                                paddingHorizontal: 20,
                                paddingBottom: insets.bottom + 100,
                            }}
                        >
                            <View style={[styles.grid, { gap }]}>
                                {isSearching ? (
                                    searchResults.length > 0 ? (
                                        searchResults.map((item) => (
                                            <TouchableWithoutFeedback
                                                key={item.id}
                                                onPress={() => handleProductPress(item)}
                                            >
                                                <View
                                                    style={[
                                                        styles.card,
                                                        { width: itemWidth, alignItems: 'center' }
                                                    ]}
                                                >
                                                    <Image
                                                        source={{ uri: item.image || "https://via.placeholder.com/200" }}
                                                        style={styles.image}
                                                    />
                                                    <Text style={styles.name} numberOfLines={2}>
                                                        {item.name}
                                                    </Text>
                                                    <Text style={styles.price}>{item.price} €</Text>
                                                </View>
                                            </TouchableWithoutFeedback>
                                        ))
                                    ) : (
                                        <View style={styles.noResults}>
                                            <Text style={styles.noResultsText}>Aucun produit trouvé pour "{searchQuery}"</Text>
                                        </View>
                                    )
                                ) : categories.length === 0 ? (
                                    <View style={{ width: '100%', alignItems: 'center', marginTop: 100 }}>
                                        <Text style={{ fontSize: 20, color: KioskTheme.colors.text.secondary }}>
                                            Aucune catégorie disponible
                                        </Text>
                                    </View>
                                ) : (
                                    categories.map((item, idx) => {
                                        const animValue = categoryAnimRefs.current.get(item.id) || new Animated.ValueXY();

                                        return (
                                            <Animated.View
                                                key={item.id}
                                                style={{
                                                    width: itemWidth,
                                                    transform: animValue.getTranslateTransform(),
                                                }}
                                            >
                                                <TouchableWithoutFeedback
                                                    onPress={() => handleCategoryPress(item)}
                                                >
                                                    <View style={styles.card}>
                                                        <Reanimated.Image
                                                            source={{
                                                                uri: item.image || "https://via.placeholder.com/200",
                                                            }}
                                                            style={styles.image}
                                                            sharedTransitionTag={`category-icon-${item.id}`}
                                                        />

                                                        <Text style={styles.name} numberOfLines={1}>
                                                            {item.name}
                                                        </Text>
                                                    </View>
                                                </TouchableWithoutFeedback>
                                            </Animated.View>
                                        );
                                    })
                                )}
                            </View>
                        </ScrollView>
                    </Animated.View>
                )}

                {/* PRODUCTS VIEW (Category View) */}
                {viewMode === 'category' && (
                    <Animated.View style={[styles.productsContainer, { opacity: productsOpacity }]}>
                        {loadingProducts ? (
                            <LoadingAnimation />
                        ) : (
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{
                                    paddingHorizontal: 20,
                                    paddingTop: 20,
                                    paddingBottom: insets.bottom + 100,
                                }}
                            >
                                <View style={[styles.grid, { gap }]}>
                                    {isSearching ? (
                                        searchResults.length > 0 ? (
                                            searchResults.map((item) => (
                                                <View key={item.id} style={{ width: itemWidth }}>
                                                    <ProductCard
                                                        item={item}
                                                        onQuickAdd={handleQuickAdd}
                                                    />
                                                </View>
                                            ))
                                        ) : (
                                            <View style={styles.noResults}>
                                                <Text style={styles.noResultsText}>Aucun produit trouvé pour "{searchQuery}"</Text>
                                            </View>
                                        )
                                    ) : (
                                        products.map((item) => (
                                            <View key={item.id} style={{ width: itemWidth }}>
                                                <ProductCard
                                                    item={item}
                                                    onQuickAdd={handleQuickAdd}
                                                />
                                            </View>
                                        ))
                                    )}
                                </View>
                            </ScrollView>
                        )}
                    </Animated.View>
                )}
            </View>

            {/* CART SUMMARY BAR */}
            <CartSummary />

            {/* PRODUCT DETAILS MODAL */}
            <ProductDetailsModal
                visible={modalVisible}
                product={selectedProduct}
                onClose={() => setModalVisible(false)}
            />

            {/* EXIT / MODE MODAL */}
            <Modal
                transparent
                visible={showExitModal}
                animationType="fade"
                onRequestClose={() => setShowExitModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Déjà fini ? 🥺</Text>
                        <Text style={styles.modalText}>
                            Vous avez des articles dans votre panier. Que voulez-vous faire ?
                        </Text>

                        <View style={styles.modalActions}>
                            {/* SWITCH MODE */}
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.btnSwitch]}
                                onPress={handleSwitchMode}
                            >
                                <RefreshCw size={24} color="#fff" style={{ marginRight: 10 }} />
                                <Text style={styles.modalBtnText}>
                                    Passer en {orderType === 'eat_in' ? 'À emporter' : 'Sur place'}
                                </Text>
                            </TouchableOpacity>

                            {/* CANCEL ORDER */}
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.btnCancel]}
                                onPress={handleConfirmExit}
                            >
                                <LogOut size={24} color="#FF512F" style={{ marginRight: 10 }} />
                                <Text style={[styles.modalBtnText, { color: '#FF512F' }]}>
                                    Annuler ma commande
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.closeModal}
                            onPress={() => setShowExitModal(false)}
                        >
                            <Text style={styles.closeText}>Non, je continue mes achats</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Toast Message */}
            <Toast />

        </Animated.View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: KioskTheme.colors.background,
        paddingTop: 20,
    },

    header: {
        marginBottom: 20,
        paddingHorizontal: 20,
        zIndex: 100,
    },

    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },

    headerCenter: {
        alignItems: 'center',
    },

    searchContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },

    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        width: '100%',
        maxWidth: 600,
        ...KioskTheme.shadows.card,
    },

    searchInput: {
        flex: 1,
        fontSize: 18,
        marginLeft: 12,
        color: KioskTheme.colors.text.primary,
        fontWeight: '500',
    },

    noResults: {
        width: '100%',
        alignItems: 'center',
        marginTop: 50,
    },

    noResultsText: {
        fontSize: 20,
        color: KioskTheme.colors.text.secondary,
        fontWeight: '600',
    },

    price: {
        fontSize: 18,
        fontWeight: "700",
        color: KioskTheme.colors.primary,
        marginTop: 8,
    },

    backButton: {
        padding: 10,
    },

    backText: {
        fontSize: 16,
        fontWeight: '600',
        color: KioskTheme.colors.text.secondary,
    },

    title: {
        fontSize: 38,
        fontWeight: "900",
        textAlign: "center",
        marginBottom: 4,
        color: KioskTheme.colors.text.primary,
    },

    modeBadge: {
        backgroundColor: KioskTheme.colors.backgroundSecondary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 5,
    },

    modeText: {
        fontSize: 14,
        fontWeight: "700",
        color: KioskTheme.colors.text.secondary,
        textTransform: "uppercase",
    },

    contentContainer: {
        flex: 1,
        flexDirection: 'row',
    },

    sidebar: {
        width: 280,
        backgroundColor: "#fff",
        borderRightWidth: 1,
        borderRightColor: "#eee",
        zIndex: 10,
    },

    sidebarContent: {
        padding: 15,
    },

    sidebarItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 12,
        marginBottom: 8,
    },

    sidebarItemActive: {
        backgroundColor: "#FFF0E6",
    },

    sidebarIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: "#f9f9f9",
    },

    sidebarText: {
        fontSize: 16,
        fontWeight: "600",
        color: KioskTheme.colors.text.secondary,
        flex: 1,
    },

    sidebarTextActive: {
        color: KioskTheme.colors.primary,
        fontWeight: "800",
    },

    gridContainer: {
        flex: 1,
    },

    productsContainer: {
        flex: 1,
        backgroundColor: KioskTheme.colors.backgroundSecondary,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },

    card: {
        backgroundColor: KioskTheme.colors.background,
        borderRadius: KioskTheme.layout.borderRadius.large,
        paddingVertical: 26,
        paddingHorizontal: 10,
        ...KioskTheme.shadows.card,
        alignItems: "center",
    },

    image: {
        width: "60%",
        aspectRatio: 1,
        resizeMode: "contain",
        marginBottom: 18,
    },

    name: {
        fontSize: 22,
        fontWeight: "800",
        textAlign: "center",
        width: "90%",
        color: KioskTheme.colors.text.primary,
    },

    /* MODAL STYLES */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '90%',
        maxWidth: 600,
        padding: 40,
        borderRadius: 30,
        alignItems: 'center',
        ...KioskTheme.shadows.card,
    },
    modalTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: KioskTheme.colors.text.primary,
        marginBottom: 16,
    },
    modalText: {
        fontSize: 20,
        color: KioskTheme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 30,
    },
    modalActions: {
        width: '100%',
        gap: 20,
        marginBottom: 30,
    },
    modalBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        borderRadius: 16,
        width: '100%',
    },
    btnSwitch: {
        backgroundColor: KioskTheme.colors.primary,
    },
    btnCancel: {
        backgroundColor: '#FFF0E6',
        borderWidth: 2,
        borderColor: '#FF512F',
    },
    modalBtnText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    closeModal: {
        padding: 10,
    },
    closeText: {
        fontSize: 18,
        color: KioskTheme.colors.text.secondary,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
