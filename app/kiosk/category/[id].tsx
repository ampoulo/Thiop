import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchProductsByCategory, fetchCategoryById } from "@/services/api";
import ProductCard from "@/components/ProductCard";
import { useResponsiveGrid } from "@/hooks/useResponsiveGrid";
import { KioskTheme } from "@/constants/theme";
import { Category, Product } from "@/types/kiosk";
import CartSummary from "@/components/kiosk/CartSummary";
import { LoadingAnimation } from "@/components/kiosk/LoadingAnimation";

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  const fade = useRef(new Animated.Value(0)).current;
  const { itemWidth, gap } = useResponsiveGrid();

  useEffect(() => {
    const load = async () => {
      try {
        const c = await fetchCategoryById(Array.isArray(id) ? id[0] : id);
        const p = await fetchProductsByCategory(Array.isArray(id) ? id[0] : id);

        setCategory(c);
        setProducts(p);
      } finally {
        setLoading(false);
        Animated.timing(fade, {
          toValue: 1,
          duration: KioskTheme.animations.duration.medium,
          useNativeDriver: KioskTheme.animations.config.useNativeDriver,
        }).start();
      }
    };

    load();
  }, [id]);

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={{ flex: 1, opacity: fade }}>

        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backTxt}>⟵ Retour</Text>
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: "center", marginRight: 60 }}>
            <Text style={styles.title}>{category?.name}</Text>
          </View>
        </View>

        {/* GRID */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 100, // Adjusted padding for CartSummary
          }}
        >
          <View style={[styles.grid, { gap }]}>
            {products.map((item) => (
              <View key={item.id} style={{ width: itemWidth }}>
                <ProductCard
                  item={item}
                  onPress={() => router.push(`/kiosk/item/${item.id}`)}
                />
              </View>
            ))}
          </View>
        </ScrollView>

        {/* CART SUMMARY BAR */}
        <CartSummary />

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: KioskTheme.colors.backgroundSecondary },

  centered: {
    flex: 1, justifyContent: "center", alignItems: "center",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 10,
  },

  backBtn: {
    padding: 10,
  },

  backTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: KioskTheme.colors.text.secondary,
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
