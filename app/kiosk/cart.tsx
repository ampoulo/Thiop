import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  useWindowDimensions,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "@/services/cartService";
import { Trash2, ShoppingCart } from "lucide-react-native";
import { KioskTheme } from "@/constants/theme";
import { Cart, CartItem } from "@/types/kiosk";
import { LoadingAnimation } from "@/components/kiosk/LoadingAnimation";

export default function KioskCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  /** ---------------- SLIDE-IN PAGE ---------------- **/
  const slideAnim = useRef(new Animated.Value(200)).current;
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: KioskTheme.animations.duration.medium,
      useNativeDriver: KioskTheme.animations.config.useNativeDriver,
    }).start();
  }, []);

  /** ---------------- LOAD CART ---------------- **/
  const loadCart = async () => {
    // Don't show full loading spinner on updates, just refresh
    if (!cart) setLoading(true);
    const c = await getCart();
    setCart(c);
    setLoading(false);
  };

  useEffect(() => {
    loadCart();
  }, []);

  if (loading && !cart)
    return <LoadingAnimation />;

  if (!cart || cart.items.length === 0)
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>🛒 Votre panier est vide</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/kiosk/menu")}
          >
            <Text style={styles.addButtonText}>Continuer ma commande</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );

  const btnSize = width < 380 ? 26 : 32;
  const fontSize = width < 380 ? 16 : 20;

  const renderItem = ({ item }: { item: CartItem }) => (
    <CartItemRow
      item={item}
      btnSize={btnSize}
      fontSize={fontSize}
      onUpdate={loadCart}
      router={router}
    />
  );

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top + 10 }]}>
      <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>

        <View style={styles.container}>
          {/* 🔶 HEADER PREMIUM */}
          <View style={styles.topHeader}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push("/kiosk/menu")}
            >
              <Text style={styles.headerBtnText}>Continuer ma commande</Text>
            </TouchableOpacity>
          </View>

          {/* 🔶 TITRE CENTRÉ */}
          <View style={styles.titleRow}>
            <ShoppingCart size={30} color={KioskTheme.colors.text.primary} strokeWidth={2.5} />
            <Text style={styles.headerTitle}>Votre commande</Text>
          </View>

          {/* 🔶 EN-TÊTE DU TABLEAU */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, { width: "50%" }]}>Article</Text>
            <Text style={[styles.headerText, { width: "22%", textAlign: "center" }]}>
              Qté
            </Text>
            <Text style={[styles.headerText, { width: "28%", textAlign: "right" }]}>
              Prix
            </Text>
          </View>

          {/* 🔶 LISTE PRODUITS (FlatList) */}
          <FlatList
            data={cart.items}
            keyExtractor={(item) => item.uniqueKey}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>{cart.total.toFixed(2)} €</Text>
              </View>
            }
          />
        </View>

        {/* ------- BOUTON PAYER FIXE ------- */}
        <View style={[styles.payButtonWrapper, { bottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => router.push("/kiosk/payment")}
          >
            <Text style={styles.payText}>Payer</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

// Sub-component for Cart Item to handle its own animations
const CartItemRow = ({ item, btnSize, fontSize, onUpdate, router }: { item: CartItem, btnSize: number, fontSize: number, onUpdate: () => void, router: any }) => {
  const bounce = useRef(new Animated.Value(1)).current;

  const animateQty = () => {
    Animated.sequence([
      Animated.timing(bounce, {
        toValue: 1.2,
        duration: 120,
        useNativeDriver: KioskTheme.animations.config.useNativeDriver,
      }),
      Animated.timing(bounce, {
        toValue: 1,
        duration: 100,
        useNativeDriver: KioskTheme.animations.config.useNativeDriver,
      }),
    ]).start();
  };

  const handleEdit = () => {
    router.push({
      pathname: `/kiosk/item/${item.id}`,
      params: { edit: "true", uniqueKey: item.uniqueKey },
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.itemRow}>

        {/* ------- ARTICLE (Clickable for Edit) ------- */}
        <TouchableOpacity
          style={styles.itemInfo}
          activeOpacity={0.7}
          onPress={handleEdit}
        >
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.itemImage}
            />
          ) : (
            <View style={[styles.itemImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>🍽️</Text>
            </View>
          )}

          <View style={{ flexShrink: 1 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.selectedAttributes?.map((attr: any, i: number) => (
              <View key={i}>
                {attr.values.map((v: any, j: number) => (
                  <Text key={j} style={styles.optionText}>
                    • {v.name} (+{v.price_extra.toFixed(2)} €)
                  </Text>
                ))}
              </View>
            ))}

            {/* EDIT INDICATOR REMOVED FOR CLEANER UI */}
          </View>
        </TouchableOpacity>

        {/* ------- QUANTITÉ ------- */}
        <View style={styles.qtyContainer}>
          <TouchableOpacity
            style={[styles.qtyBtn, { width: btnSize, height: btnSize }]}
            onPress={async () => {
              animateQty();
              await updateCartItem(item.uniqueKey, item.quantity - 1);
              onUpdate();
            }}
          >
            <Text style={[styles.qtySymbol, { fontSize }]}>−</Text>
          </TouchableOpacity>

          <Animated.Text
            style={[styles.qtyNumber, { transform: [{ scale: bounce }] }]}
          >
            {item.quantity}
          </Animated.Text>

          <TouchableOpacity
            style={[styles.qtyBtn, { width: btnSize, height: btnSize }]}
            onPress={async () => {
              animateQty();
              await updateCartItem(item.uniqueKey, item.quantity + 1);
              onUpdate();
            }}
          >
            <Text style={[styles.qtySymbol, { fontSize }]}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* ------- PRIX ------- */}
        <View style={styles.priceContainer}>
          <Text style={styles.itemPrice}>
            {(item.total_price * item.quantity).toFixed(2)} €
          </Text>

          <TouchableOpacity
            onPress={async () => {
              await removeCartItem(item.uniqueKey);
              onUpdate();
            }}
            style={styles.deleteBtn}
          >
            <Trash2 size={20} color="#FF512F" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

/* --------------------------------------------------- */
/*                       STYLES                        */
/* --------------------------------------------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: KioskTheme.colors.background },
  container: { flex: 1, paddingHorizontal: 20 },

  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  /* HEADER PREMIUM */
  topHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
  },

  headerBtn: {
    backgroundColor: KioskTheme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
  },

  headerBtnText: { color: KioskTheme.colors.text.light, fontWeight: "700", fontSize: 17 },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 5,
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: "900",
    marginLeft: 10,
    color: KioskTheme.colors.text.primary,
  },

  /* EN-TÊTES TABLEAU */
  headerRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: KioskTheme.colors.backgroundSecondary,
    marginBottom: 14,
  },

  headerText: {
    fontSize: 16,
    fontWeight: "700",
    color: KioskTheme.colors.text.primary,
  },

  /* PRODUIT */
  card: {
    backgroundColor: KioskTheme.colors.background,
    borderRadius: KioskTheme.layout.borderRadius.medium,
    padding: 16,
    marginBottom: 20,
    ...KioskTheme.shadows.small,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },

  itemInfo: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#eee",
  },

  placeholderImage: { justifyContent: "center", alignItems: "center" },
  placeholderText: { fontSize: 26, opacity: 0.5 },

  itemName: { fontSize: 17, fontWeight: "700", color: KioskTheme.colors.text.primary },
  optionText: { fontSize: 14, color: KioskTheme.colors.text.secondary },

  /* QUANTITY */
  qtyContainer: {
    width: "22%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  qtyBtn: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  qtySymbol: { fontWeight: "800", color: "#333" },
  qtyNumber: { fontSize: 17, fontWeight: "800", color: KioskTheme.colors.text.primary },

  /* PRICE */
  priceContainer: {
    width: "28%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },

  itemPrice: { fontSize: 17, fontWeight: "800", textAlign: "right", color: KioskTheme.colors.text.primary },

  deleteBtn: {
    padding: 10,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
  },

  /* TOTAL */
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  totalLabel: { fontSize: 20, fontWeight: "800", color: KioskTheme.colors.text.primary },
  totalAmount: { fontSize: 20, fontWeight: "900", color: KioskTheme.colors.text.primary },

  /* BOUTON FIXE */
  payButtonWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },

  payButton: {
    backgroundColor: KioskTheme.colors.primary,
    paddingVertical: 18,
    borderRadius: 999,
    width: "80%",
    maxWidth: 450,
    ...KioskTheme.shadows.button,
  },

  payText: {
    color: KioskTheme.colors.text.light,
    fontWeight: "900",
    fontSize: 18,
    textAlign: "center",
  },

  /* PANIER VIDE */
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: KioskTheme.colors.background },
  emptyContent: { gap: 20, alignItems: "center" },
  emptyText: { fontSize: 18, fontWeight: "700", color: KioskTheme.colors.text.primary },
  addButton: {
    backgroundColor: KioskTheme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  addButtonText: { color: KioskTheme.colors.text.light, fontWeight: "700", fontSize: 16 },
});
