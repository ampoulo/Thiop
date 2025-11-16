import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchProductsByCategory, fetchCategoryById } from "@/services/api";
import ProductCard from "@/components/ProductCard";

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const fade = useRef(new Animated.Value(0)).current;

  const screenWidth = Dimensions.get("window").width;

  /** McDo-style responsive columns */
  const getColumns = () => {
    if (screenWidth < 400) return 1;  // ultra small phones
    if (screenWidth < 700) return 2;  // standard phones
    if (screenWidth < 1100) return 3;
    if (screenWidth < 1500) return 4;
    if (screenWidth < 2000) return 5;
    return 6;
  };

  const columns = getColumns();
  const gap = 28;

  const itemWidth = (screenWidth - (gap * (columns - 1)) - 40) / columns;
  // -40 = horizontal padding around grid

  useEffect(() => {
    const load = async () => {
      try {
        const c = await fetchCategoryById(id);
        const p = await fetchProductsByCategory(id);

        setCategory(c);
        setProducts(p);
      } finally {
        setLoading(false);
        Animated.timing(fade, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={{ flex: 1, opacity: fade }}>

        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push("/kiosk")}
          >
            <Text style={styles.backTxt}>⟵</Text>
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
            paddingBottom: insets.bottom + 260,
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

        {/* CART BUTTON FIXE */}
        <TouchableOpacity
          onPress={() => router.push("/kiosk/cart")}
          style={[
            styles.cartBtn,
            { bottom: insets.bottom + 20 }
          ]}
        >
          <Text style={styles.cartTxt}>🛒 Voir le panier</Text>
        </TouchableOpacity>

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8F8F8" },

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
    backgroundColor: "#FF6B35",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 50,
  },

  backTxt: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },

  title: {
    fontSize: 34,
    fontWeight: "900",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  cartBtn: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "#FF6B35",
    paddingVertical: 22,
    paddingHorizontal: 40,
    borderRadius: 40,
    width: "80%",
    maxWidth: 460,
  },

  cartTxt: {
    color: "#fff",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
  },
});
