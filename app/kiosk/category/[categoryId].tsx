import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Image,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchProductsByCategory, fetchCategoryById, fetchCategories } from "@/services/api";
import ProductCard from "@/components/ProductCard";
import { useResponsiveGrid } from "@/hooks/useResponsiveGrid";
import { KioskTheme } from "@/constants/theme";
import { Category, Product } from "@/types/kiosk";
import CartSummary from "@/components/kiosk/CartSummary";
import { LoadingAnimation } from "@/components/kiosk/LoadingAnimation";
import ProductDetailsModal from "@/components/kiosk/ProductDetailsModal";
import Reanimated from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function CategoryScreen() {
  const { categoryId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [products, setProducts] = useState<Product[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const sidebarAnim = useRef(new Animated.Value(-100)).current;
  const { itemWidth, gap } = useResponsiveGrid();

  // Load Data
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const id = Array.isArray(categoryId) ? categoryId[0] : categoryId;

        // Parallel fetching
        const [cat, prods, allCats] = await Promise.all([
          fetchCategoryById(id),
          fetchProductsByCategory(id),
          fetchCategories() // Fetch all for sidebar
        ]);

        setCurrentCategory(cat);
        setProducts(prods);
        setAllCategories(allCats);
      } finally {
        setLoading(false);
        // Animations
        Animated.parallel([
          Animated.timing(fade, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(sidebarAnim, {
            toValue: 0,
            damping: 15,
            useNativeDriver: true,
          })
        ]).start();
      }
    };

    load();
  }, [categoryId]);

  const handleCategoryPress = (catId: number) => {
    // Navigate to new category (replace to avoid stack buildup)
    router.replace(`/kiosk/category/${catId}`);
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* SIDEBAR (Left Column) */}
        <View style={styles.sidebar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push("/kiosk/menu")}
          >
            <Text style={styles.backTxt}>⟵ Menu</Text>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarContent}>
            {allCategories.map((cat) => {
              const isActive = cat.id.toString() === (Array.isArray(categoryId) ? categoryId[0] : categoryId);
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                  onPress={() => handleCategoryPress(cat.id)}
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
        </View>

        {/* MAIN CONTENT (Right Column) */}
        <Animated.View style={[styles.mainContent, { opacity: fade }]}>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>{currentCategory?.name}</Text>
          </View>

          {/* GRID */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 100,
            }}
          >
            <View style={[styles.grid, { gap }]}>
              {products.map((item) => (
                <View key={item.id} style={{ width: itemWidth }}>
                  <ProductCard
                    item={item}
                    onPress={() => handleProductPress(item)}
                  />
                </View>
              ))}
            </View>
          </ScrollView>

        </Animated.View>

        {/* CART SUMMARY BAR (Floating) */}
        <CartSummary />

        {/* PRODUCT DETAILS MODAL */}
        <ProductDetailsModal
          visible={modalVisible}
          product={selectedProduct}
          onClose={() => setModalVisible(false)}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: KioskTheme.colors.backgroundSecondary },
  container: { flex: 1, flexDirection: "row" },

  /* SIDEBAR */
  sidebar: {
    width: 280, // Fixed width for sidebar
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#eee",
    zIndex: 10,
  },
  sidebarContent: {
    padding: 15,
  },
  backBtn: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 10,
  },
  backTxt: {
    fontSize: 18,
    fontWeight: "700",
    color: KioskTheme.colors.text.secondary,
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
    backgroundColor: "#FFF0E6", // Light orange
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

  /* MAIN CONTENT */
  mainContent: {
    flex: 1,
    backgroundColor: KioskTheme.colors.backgroundSecondary,
  },
  header: {
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: KioskTheme.colors.text.primary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
