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
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { fetchCategories } from "@/services/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsiveGrid } from "@/hooks/useResponsiveGrid";
import { KioskTheme } from "@/constants/theme";
import { Category } from "@/types/kiosk";
import CartSummary from "@/components/kiosk/CartSummary";

export default function KioskMenu() {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { itemWidth, gap } = useResponsiveGrid();

  // Page animation
  const fadeScreen = useRef(new Animated.Value(0)).current;
  const translateScreen = useRef(new Animated.Value(20)).current;

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
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={KioskTheme.colors.primary} />
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 20, color: KioskTheme.colors.text.secondary }}>
          Aucune catégorie disponible
        </Text>
      </View>
    );
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
        <TouchableOpacity onPress={() => router.replace("/kiosk")} style={styles.backButton}>
          <Text style={styles.backText}>⟵ Retour</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Notre Carte</Text>
          <Text style={styles.subtitle}>
            Sélectionnez une catégorie
          </Text>
        </View>
        <View style={{ width: 80 }} />
      </View>

      {/* FULLSCREEN GRID */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100, // Adjusted padding for CartSummary
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
                useNativeDriver: KioskTheme.animations.config.useNativeDriver,
              }),
              Animated.timing(translate, {
                toValue: 0,
                duration: 500,
                delay: idx * 70,
                useNativeDriver: KioskTheme.animations.config.useNativeDriver,
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

      {/* PANIER SUMMARY BAR */}
      <CartSummary />

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: KioskTheme.colors.background,
    paddingTop: 20,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 20,
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

  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: KioskTheme.colors.text.secondary,
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
});
