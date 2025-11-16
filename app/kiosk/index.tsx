import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  ActivityIndicator,
  Animated,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { fetchCategories } from "@/services/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function KioskHome() {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Page animation
  const fadeScreen = useRef(new Animated.Value(0)).current;
  const translateScreen = useRef(new Animated.Value(20)).current;

  const screenWidth = Dimensions.get("window").width;

  /* ---------------------------------------------
     🟧 FULLSCREEN McDo GRID LOGIC (same as Category)
  ----------------------------------------------*/
  const getColumns = () => {
    if (screenWidth < 400) return 1;    // very small phones
    if (screenWidth < 700) return 2;    // phones
    if (screenWidth < 1100) return 3;   // tablets
    if (screenWidth < 1500) return 4;   // small desktop
    if (screenWidth < 2000) return 5;   // medium desktop
    return 6;                           // large screens
  };

  const columns = getColumns();
  const gap = 28; // McDo premium spacing

  const itemWidth =
    (screenWidth - (gap * (columns - 1)) - 40) / columns;
  // -40 = paddingHorizontal of ScrollView


  /* ---------------------------------------------
     Fetch catégories
  ----------------------------------------------*/
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } finally {
        setLoading(false);

        // animations
        Animated.parallel([
          Animated.timing(fadeScreen, {
            toValue: 1,
            duration: 460,
            useNativeDriver: true,
          }),
          Animated.timing(translateScreen, {
            toValue: 0,
            duration: 460,
            useNativeDriver: true,
          }),
        ]).start();
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  /* ---------------------------------------------
     🟥 Pas de catégories
  ----------------------------------------------*/
  if (categories.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 20, color: "#999" }}>
          Aucune catégorie disponible
        </Text>
      </View>
    );
  }

  /* ---------------------------------------------
     🟩 UI FINAL
  ----------------------------------------------*/
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
      <Text style={styles.title}>🍔 Bienvenue !</Text>
      <Text style={styles.subtitle}>
        Sélectionnez une catégorie pour commencer votre commande
      </Text>

      {/* FULLSCREEN GRID */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 260,
        }}
      >
        <View style={[styles.grid, { gap }]}>
          {categories.map((item, idx) => {
            const fade = new Animated.Value(0);
            const translate = new Animated.Value(20);

            Animated.parallel([
              Animated.timing(fade, {
                toValue: 1,
                duration: 500,
                delay: idx * 70,
                useNativeDriver: true,
              }),
              Animated.timing(translate, {
                toValue: 0,
                duration: 500,
                delay: idx * 70,
                useNativeDriver: true,
              }),
            ]).start();

            return (
              <TouchableWithoutFeedback
                key={item.id}
                onPress={() =>
                  router.push(`/kiosk/category/${item.id}`)
                }
              >
                <Animated.View
                  style={[
                    styles.card,
                    {
                      width: itemWidth,
                      opacity: fade,
                      transform: [{ translateY: translate }],
                    },
                  ]}
                >
                  <Image
                    source={{
                      uri: item.image || "https://via.placeholder.com/200",
                    }}
                    style={styles.image}
                  />

                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                </Animated.View>
              </TouchableWithoutFeedback>
            );
          })}
        </View>
      </ScrollView>

      {/* PANIER FIXE */}
      <TouchableWithoutFeedback onPress={() => router.push("/kiosk/cart")}>
  <View
    style={[
      styles.cartButton,
      { bottom: insets.bottom + 20 },
    ]}
  >
    <Text style={styles.cartText}>🛒 Voir le panier</Text>
  </View>
</TouchableWithoutFeedback>

    </Animated.View>
  );
}

/* ---------------------------------------------
   🎨 Styles McDo Premium
----------------------------------------------*/
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 38,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 4,
    color: "#222",
  },

  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#777",
    marginBottom: 32,
    paddingHorizontal: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 42,
    paddingVertical: 26,
    paddingHorizontal: 10,

    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,

    alignItems: "center",
  },

  image: {
    width: "60%", // cohérent avec ProductCard (Option B)
    aspectRatio: 1,
    resizeMode: "contain",
    marginBottom: 18,
  },

  name: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    width: "90%",
    color: "#222",
  },

  cartButton: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "#FF6B35",
    paddingVertical: 22,
    paddingHorizontal: 40,
    borderRadius: 40,
    width: "80%",
    maxWidth: 460,

    shadowColor: "#FF6B35",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },

  cartText: {
    color: "#FFF",
    fontWeight: "900",
    textAlign: "center",
    fontSize: 20,
  },
});
