import React, { useRef, useEffect, useState } from "react";
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
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "@/services/cartService";
import { Trash2, ShoppingCart } from "lucide-react-native";

export default function KioskCart() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  /** ---------------- SLIDE-IN PAGE ---------------- **/
  const slideAnim = useRef(new Animated.Value(200)).current;
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  /** ---------------- BOUNCE QUANTITY ---------------- **/
  const bounce = useRef(new Animated.Value(1)).current;

  const animateQty = () => {
    Animated.sequence([
      Animated.timing(bounce, {
        toValue: 1.2,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(bounce, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /** ---------------- LOAD CART ---------------- **/
  const loadCart = async () => {
    setLoading(true);
    const c = await getCart();
    setCart(c);
    setLoading(false);
  };

  useEffect(() => {
    loadCart();
  }, []);

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );

  if (!cart || cart.items.length === 0)
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>🛒 Votre panier est vide</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/kiosk")}
          >
            <Text style={styles.addButtonText}>Ajouter d'autres produits</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );

  const btnSize = width < 380 ? 26 : 32;
  const fontSize = width < 380 ? 16 : 20;

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top + 10 }]}>
      <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
        <ScrollView contentContainerStyle={styles.container}>
          
          {/* 🔶 HEADER PREMIUM */}
          <View style={styles.topHeader}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push("/kiosk")}
            >
              <Text style={styles.headerBtnText}>Ajouter d'autres produits</Text>
            </TouchableOpacity>
          </View>

          {/* 🔶 TITRE CENTRÉ */}
          <View style={styles.titleRow}>
            <ShoppingCart size={30} color="#222" strokeWidth={2.5} />
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

          {/* 🔶 LISTE PRODUITS */}
          {cart.items.map((item: any) => (
            <View key={item.uniqueKey} style={styles.card}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: `/kiosk/item/${item.id}`,
                    params: { edit: "true", uniqueKey: item.uniqueKey },
                  })
                }
              >
                <View style={styles.itemRow}>
                  
                  {/* ------- ARTICLE ------- */}
                  <View style={styles.itemInfo}>
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
                    </View>
                  </View>

                  {/* ------- QUANTITÉ ------- */}
                  <View style={styles.qtyContainer}>
                    <TouchableOpacity
                      style={[styles.qtyBtn, { width: btnSize, height: btnSize }]}
                      onPress={async () => {
                        animateQty();
                        await updateCartItem(item.uniqueKey, item.quantity - 1);
                        loadCart();
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
                        loadCart();
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
                        loadCart();
                      }}
                    >
                      <Trash2 size={18} color="#bbb" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}

          {/* TOTAL */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>{cart.total.toFixed(2)} €</Text>
          </View>

          <View style={{ height: 40 }} /> 
        </ScrollView>

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

/* --------------------------------------------------- */
/*                       STYLES                        */
/* --------------------------------------------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { paddingHorizontal: 20, paddingBottom: 60 },

  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  /* HEADER PREMIUM */
  topHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
  },

  headerBtn: {
    backgroundColor: "#FF6B35",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
  },

  headerBtnText: { color: "#fff", fontWeight: "700", fontSize: 17 },

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
    color: "#222",
  },

  /* EN-TÊTES TABLEAU */
  headerRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    marginBottom: 14,
  },

  headerText: {
    fontSize: 16,
    fontWeight: "700",
  },

  /* PRODUIT */
  card: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
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

  itemName: { fontSize: 17, fontWeight: "700" },
  optionText: { fontSize: 14, color: "#777" },

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
  qtyNumber: { fontSize: 17, fontWeight: "800" },

  /* PRICE */
  priceContainer: {
    width: "28%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },

  itemPrice: { fontSize: 17, fontWeight: "800", textAlign: "right" },

  /* TOTAL */
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  totalLabel: { fontSize: 20, fontWeight: "800" },
  totalAmount: { fontSize: 20, fontWeight: "900" },

  /* BOUTON FIXE */
  payButtonWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },

  payButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 18,
    borderRadius: 999,
    width: "80%",
    maxWidth: 450,
    shadowColor: "#FF6B35",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  payText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
    textAlign: "center",
  },

  /* PANIER VIDE */
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContent: { gap: 20, alignItems: "center" },
  emptyText: { fontSize: 18, fontWeight: "700" },
});
