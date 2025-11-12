import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "@/services/cartService";
import { Trash2 } from "lucide-react-native";

export default function KioskCart() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

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


  // Taille dynamique pour les boutons de quantité selon la largeur d’écran
  const btnSize = width < 380 ? 26 : 32;
  const fontSize = width < 380 ? 16 : 20;

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top + 10 }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🔝 Bouton Ajouter */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/kiosk")}
        >
          <Text style={styles.addButtonText}>Ajouter d'autres produits</Text>
        </TouchableOpacity>

        {/* 🧾 Titre */}
        <Text style={styles.title}>Votre commande</Text>

        {/* 🧩 En-têtes */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerText, { flex: 2 }]}>Article</Text>
          <Text style={[styles.headerText, { flex: 1, textAlign: "center" }]}>
            Qté
          </Text>
          <Text style={[styles.headerText, { flex: 1, textAlign: "right" }]}>
            Prix
          </Text>
        </View>

        {/* 🛍 Liste */}
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
                {/* 🖼️ Image + infos */}
                <View style={styles.itemInfo}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                  ) : (
                    <View style={[styles.itemImage, styles.placeholderImage]}>
                      <Text style={styles.placeholderText}>🍽️</Text>
                    </View>
                  )}

                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.selectedAttributes?.length > 0 && (
                      <View>
                        {item.selectedAttributes.map((attr: any, i: number) => (
                          <View key={i}>
                            {attr.values.map((v: any, j: number) => (
                              <Text key={j} style={styles.optionText}>
                                • {v.name} (+{v.price_extra.toFixed(2)} €)
                              </Text>
                            ))}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {/* 🔢 Qté */}
                <View style={styles.qtyContainer}>
                  <TouchableOpacity
                    style={[styles.qtyBtn, { width: btnSize, height: btnSize }]}
                    onPress={async () => {
                      await updateCartItem(item.uniqueKey, item.quantity - 1);
                      loadCart();
                    }}
                  >
                    <Text style={[styles.qtySymbol, { fontSize }]}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyNumber}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={[styles.qtyBtn, { width: btnSize, height: btnSize }]}
                    onPress={async () => {
                      await updateCartItem(item.uniqueKey, item.quantity + 1);
                      loadCart();
                    }}
                  >
                    <Text style={[styles.qtySymbol, { fontSize }]}>＋</Text>
                  </TouchableOpacity>
                </View>

                {/* 💰 Prix + poubelle */}
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

        {/* 🧮 Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{cart.total.toFixed(2)} €</Text>
        </View>

        {/* 💳 Bouton Payer */}
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => router.push("/kiosk/payment")}
        >
          <Text style={styles.payText}>Payer</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/** 💅 Styles */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { fontSize: 18, color: "#555", textAlign: "center", marginBottom: 10 },

  /** 🔶 Bouton “Ajouter d’autres produits” */
  addButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
    alignSelf: "flex-start",
    marginBottom: 25,
    shadowColor: "#FF6B35",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  /** 🧾 Titre + en-têtes */
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 20,
    color: "#222",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f7f7f7",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  headerText: { fontSize: 17, fontWeight: "700", color: "#333" },

  /** 🧩 Cartes produits */
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  itemInfo: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { fontSize: 22, opacity: 0.5 },
  itemName: { fontSize: 17, fontWeight: "700", color: "#222" },
  optionText: {
    fontSize: 14,
    color: "#777",
    lineHeight: 18,
  },

  /** 🔢 Qté et prix */
  qtyContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  qtyBtn: {
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  qtySymbol: { fontWeight: "700", color: "#333" },
  qtyNumber: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  priceContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  itemPrice: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    minWidth: 75,
    textAlign: "right",
  },

  /** 🧮 Total */
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
  },
  totalLabel: { fontSize: 20, fontWeight: "700", color: "#222" },
  totalAmount: { fontSize: 20, fontWeight: "800", color: "#222" },

  /** 💳 Bouton Payer (blanc inversé) */
  payButton: {
    borderColor: "#FF6B35",
    borderWidth: 2,
    backgroundColor: "#fff",
    paddingVertical: 20,
    borderRadius: 14,
    marginTop: 25,
    marginBottom: 40,
    shadowColor: "#FF6B35",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  payText: {
    color: "#FF6B35",
    textAlign: "center",
    fontWeight: "800",
    fontSize: 18,
  },
    /** 🧺 Panier vide */
  emptyContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#444",
    fontWeight: "600",
    textAlign: "center",
  },

});
