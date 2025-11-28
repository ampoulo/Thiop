import { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import {
  addToCart,
  replaceCartItem,
  getItemByKey,
} from "@/services/cartService";
import { fetchItemDetails } from "@/services/api";
import { KioskTheme } from "@/constants/theme";
import { Product, Attribute, AttributeValue } from "@/types/kiosk";
import { LoadingAnimation } from "@/components/kiosk/LoadingAnimation";

export default function KioskItem() {
  const { productId, edit, uniqueKey } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [item, setItem] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<number, number[]>>({});
  const [quantity, setQuantity] = useState(1);

  /** ------- Anim bouton -------- */
  const addAnim = useRef(new Animated.Value(1)).current;

  const animateAdd = () => {
    Animated.sequence([
      Animated.timing(addAnim, {
        toValue: 0.92,
        duration: KioskTheme.animations.duration.short,
        useNativeDriver: KioskTheme.animations.config.useNativeDriver
      }),
      Animated.timing(addAnim, {
        toValue: 1,
        duration: KioskTheme.animations.duration.short,
        useNativeDriver: KioskTheme.animations.config.useNativeDriver
      }),
    ]).start();
  };

  /** ------- Load produit -------- */
  useEffect(() => {
    const load = async () => {
      try {
        const id = Array.isArray(productId) ? productId[0] : productId;
        const data = await fetchItemDetails(id);
        setItem(data);

        if (edit === "true" && uniqueKey) {
          const key = Array.isArray(uniqueKey) ? uniqueKey[0] : uniqueKey;
          const existing = await getItemByKey(key);
          if (existing) {
            const initial: Record<number, number[]> = {};
            data.attributes?.forEach((attr: Attribute) => {
              const matchAttr = existing.selectedAttributes?.find(
                (a: any) => a.name === attr.name
              );
              if (matchAttr) {
                const ids = attr.values
                  .filter((v) =>
                    matchAttr.values.some((x: any) => x.name === v.name)
                  )
                  .map((v) => v.id);
                if (ids.length > 0) initial[attr.id] = ids;
              }
            });
            setSelectedAttributes(initial);
            setQuantity(existing.quantity);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /** Prix total */
  const basePrice = useMemo(() => {
    if (!item) return 0;
    let p = item.price;
    item.attributes?.forEach((attr) => {
      selectedAttributes[attr.id]?.forEach((id) => {
        const obj = attr.values.find((v) => v.id === id);
        p += obj?.price_extra ?? 0;
      });
    });
    return p;
  }, [item, selectedAttributes]);

  const totalDisplay = (basePrice * quantity).toFixed(2);

  if (loading || !item)
    return <LoadingAnimation />;

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

  /** Ajouter / Modifier panier */
  const saveCart = async () => {
    const selectedOptions = item.attributes
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
      id: item.id,
      name: item.name,
      price: item.price,
      total_price: basePrice,
      quantity,
      image: item.image,
      selectedAttributes: selectedOptions,
    };

    if (edit === "true" && uniqueKey) {
      const key = Array.isArray(uniqueKey) ? uniqueKey[0] : uniqueKey;
      await replaceCartItem(key, data);
      Toast.show({
        type: "success",
        text1: "Panier mis à jour",
        text2: `${item.name} a été modifié`,
      });
    } else {
      await addToCart(data);
      Toast.show({
        type: "success",
        text1: "Ajouté au panier",
        text2: `${quantity}x ${item.name}`,
      });
    }

    // UX Improvement: Go back instead of to cart
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER FIXED */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>⟵ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 200 }}>
        {/* HEADER */}


        {/* IMAGE CENTRALE */}
        <View style={{ alignItems: "center", marginTop: 10 }}>
          <Image
            source={{ uri: item.image }}
            style={styles.mainImage}
          />
        </View>

        {/* DESCRIPTION */}
        <Text style={styles.price}>{item.price.toFixed(2)} €</Text>
        <Text style={styles.desc}>{item.description}</Text>

        {/* ATTRIBUTES */}
        {item.attributes?.map((attr) => (
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

        {/* QUANTITY */}
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Text style={styles.qtyText}>−</Text>
          </TouchableOpacity>

          <Text style={styles.qtyNumber}>{quantity}</Text>

          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity((q) => q + 1)}
          >
            <Text style={styles.qtyText}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* BTN AJOUTER */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            animateAdd();
            saveCart();
          }}
        >
          <Animated.View
            style={[
              styles.addBtn,
              { transform: [{ scale: addAnim }] },
            ]}
          >
            <Text style={styles.addTxt}>
              🛒 {edit === "true" ? "Modifier" : "Ajouter"} • {totalDisplay} €
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- STYLES MCDO PREMIUM ---------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: KioskTheme.colors.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: KioskTheme.colors.background,
    zIndex: 10,
  },

  backBtn: {
    padding: 10,
    marginRight: 10,
  },

  backTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: KioskTheme.colors.text.secondary,
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 30,
    fontWeight: "900",
    marginRight: 40,
    color: KioskTheme.colors.text.primary,
  },

  mainImage: {
    width: Platform.OS === "web" ? "28%" : "40%",
    maxWidth: 280,
    aspectRatio: 1,
    resizeMode: "contain",
    borderRadius: KioskTheme.layout.borderRadius.medium,
    marginVertical: 15,
  },

  price: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    color: KioskTheme.colors.primary,
  },

  desc: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
    marginTop: 8,
    color: KioskTheme.colors.text.secondary,
  },

  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
    color: KioskTheme.colors.text.primary,
  },

  option: {
    backgroundColor: KioskTheme.colors.backgroundSecondary,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionActive: {
    backgroundColor: KioskTheme.colors.activeOption,
    borderWidth: 2,
    borderColor: KioskTheme.colors.primary,
  },
  optionLabel: { fontSize: 18, color: KioskTheme.colors.text.primary },
  optionPrice: { fontSize: 18, fontWeight: "800", color: KioskTheme.colors.primary },

  qtyRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 35,
    marginBottom: 20,
  },

  qtyBtn: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 14,
  },
  qtyText: { fontSize: 24, fontWeight: "800", color: KioskTheme.colors.text.primary },
  qtyNumber: { fontSize: 24, fontWeight: "800", marginHorizontal: 25, color: KioskTheme.colors.text.primary },

  addBtn: {
    backgroundColor: KioskTheme.colors.primary,
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 20,
    borderRadius: 40,
    ...KioskTheme.shadows.button,
  },
  addTxt: {
    color: KioskTheme.colors.text.light,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "900",
  },
});
