import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  Animated,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchProductsByCategory, fetchCategoryById } from "@/services/api";
import ProductCard from "@/components/ProductCard";

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const screenWidth = Dimensions.get("window").width;
  const numColumns = screenWidth < 800 ? 2 : 3;

  /** 🌀 Animation bouton “Précédent” */
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animatePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [categoryData, productData] = await Promise.all([
          fetchCategoryById(id),
          fetchProductsByCategory(id),
        ]);
        setCategory(categoryData || null);
        setProducts(productData || []);
      } catch (e) {
        console.error("Erreur chargement catégorie :", e);
      } finally {
        setLoading(false);
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
    <SafeAreaView style={styles.safeContainer}>
      {/* 🔙 Header */}
      <View style={styles.header}>
        <TouchableWithoutFeedback
          onPressIn={animatePressIn}
          onPressOut={animatePressOut}
          onPress={() => router.push("/kiosk")}
        >
          <Animated.View style={[styles.backButton, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.backText}>Précédent</Text>
          </Animated.View>
        </TouchableWithoutFeedback>

        <Text style={styles.title}>{category?.name || "Catégorie"}</Text>
      </View>

      {/* 🛍️ Liste des produits */}
      <FlatList
        data={products}
        numColumns={numColumns}
        keyExtractor={(item) => item.id.toString()}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onPress={() => router.push(`/kiosk/item/${item.id}`)}
          />
        )}
      />

      {/* 🟧 Bouton Voir le panier */}
      <TouchableWithoutFeedback onPress={() => router.push("/kiosk/cart")}>
        <Animated.View style={styles.cartButton}>
          <Text style={styles.cartText}>🛒 Voir le panier</Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /** 🔝 Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
    position: "relative",
  },

  backButton: {
    position: "absolute",
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B35",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  backText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#333",
  },

  /** 🧩 Grille */
  row: {
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },

  /** 🔄 Loader */
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /** 🛒 Bouton Voir le panier */
  cartButton: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 30 : 20,
    alignSelf: "center",
    backgroundColor: "#FF6B35",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    width: "80%",
    maxWidth: 400,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cartText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: 0.3,
  },
});
