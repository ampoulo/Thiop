import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { fetchCategories } from "@/services/api";

/** 🔹 Carte animée pour une catégorie */
function AnimatedCategoryCard({ item, index, onPress }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(15)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Animation d’apparition
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Effet rebond
  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();

  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();

  return (
    <TouchableWithoutFeedback
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }, { scale }],
          },
        ]}
      >
        <Image
          source={{
            uri:
              item.image ||
              "https://via.placeholder.com/150x150.png?text=No+Image",
          }}
          style={styles.image}
        />
        <Text style={styles.name}>{item.name}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

export default function KioskHome() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Animations globales
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(translateAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }
    };
    load();
  }, []);

  // 🧡 Rebond du bouton "Voir le panier"
  const scaleCart = useRef(new Animated.Value(1)).current;
  const onPressInCart = () =>
    Animated.spring(scaleCart, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  const onPressOutCart = () =>
    Animated.spring(scaleCart, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!loading && categories.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 18, color: "#888" }}>
          Aucune catégorie disponible
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: translateAnim }] },
        ]}
      >
        <Animated.Text style={styles.title}>🍔 Bienvenue!</Animated.Text>
        <Animated.Text style={styles.subtitle}>
          Cliquez sur une catégorie pour commencer votre commande
        </Animated.Text>

        <FlatList
          data={categories}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item, index }) => (
            <AnimatedCategoryCard
              item={item}
              index={index}
              onPress={() => router.push(`/kiosk/category/${item.id}`)}
            />
          )}
        />
      </Animated.View>

      {/* 🟧 Bouton Voir le panier */}
      <TouchableWithoutFeedback
        onPressIn={onPressInCart}
        onPressOut={onPressOutCart}
        onPress={() => router.push("/kiosk/cart")}
      >
        <Animated.View style={[styles.cartButton, { transform: [{ scale: scaleCart }] }]}>
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 0,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 30,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  card: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    alignItems: "center",
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  cartButton: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 30 : 20,
    alignSelf: "center",
    backgroundColor: "#FF6B35",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
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
