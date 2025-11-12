import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchItemDetails } from "@/services/api";
import { addToCart, replaceCartItem, getItemByKey } from "@/services/cartService";

export default function KioskItem() {
  const { id, edit, uniqueKey } = useLocalSearchParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, number[]>>({});
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  // 🧠 Charger le produit et préremplir si édition
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchItemDetails(id as string);
        setItem(data);

        // 🧩 Si on édite un produit du panier, charger ses valeurs
        if (edit === "true" && uniqueKey) {
          const existing = await getItemByKey(uniqueKey as string);
          if (existing) {
            // 🔁 Construire le mapping des attributs sélectionnés
            const preselected: Record<string, number[]> = {};

            data.attributes?.forEach((attr: any) => {
              const matchAttr = existing.selectedAttributes.find(
                (a: any) => a.name === attr.name
              );
              if (matchAttr) {
                const ids = attr.values
                  .filter((v: any) =>
                    matchAttr.values.some((val: any) => val.name === v.name)
                  )
                  .map((v: any) => v.id);
                if (ids.length > 0) preselected[attr.id] = ids;
              }
            });

            setSelectedAttributes(preselected);
            setQuantity(existing.quantity || 1);
          }
        }
      } catch (e) {
        console.error("Erreur chargement produit :", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, edit, uniqueKey]);

  if (loading)
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#FF6B35" />;

  /** 🎛 Sélection d’un attribut **/
  const handleSelect = (attrId: number, valueId: number, type: string) => {
    setSelectedAttributes((prev) => {
      const current = prev[attrId] || [];
      if (type === "radio") return { ...prev, [attrId]: [valueId] };
      if (current.includes(valueId))
        return { ...prev, [attrId]: current.filter((v) => v !== valueId) };
      else return { ...prev, [attrId]: [...current, valueId] };
    });
  };

  /** 💰 Calcul du prix total **/
  const getTotalPrice = () => {
    let total = item.price;
    item.attributes?.forEach((attr: any) => {
      const selected = selectedAttributes[attr.id];
      if (selected) {
        selected.forEach((valId: number) => {
          const val = attr.values.find((v: any) => v.id === valId);
          if (val) total += val.price_extra;
        });
      }
    });
    return total;
  };

  /** 🧾 Ajout ou remplacement dans le panier **/
  const handleAddToCart = async () => {
    const selectedOptions = item.attributes
      .map((attr) => {
        const selected = selectedAttributes[attr.id];
        if (!selected || selected.length === 0) return null;
        const values = selected
          .map((valId) => {
            const val = attr.values.find((v) => v.id === valId);
            return val ? { name: val.name, price_extra: val.price_extra } : null;
          })
          .filter(Boolean);
        return { name: attr.name, values };
      })
      .filter(Boolean);

    const totalPrice = getTotalPrice();

    const productData = {
      id: item.id,
      name: item.name,
      price: item.price,
      total_price: totalPrice,
      image: item.image,
      quantity,
      selectedAttributes: selectedOptions,
    };

    if (edit === "true" && uniqueKey) {
      await replaceCartItem(uniqueKey as string, productData);
    } else {
      await addToCart(productData);
    }

    router.push("/kiosk/cart");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🔙 Bouton précédent */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>Précédent</Text>
        </TouchableOpacity>

        {/* 🖼️ Image + infos principales */}
        <View style={styles.header}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>🍕</Text>
            </View>
          )}
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.basePrice}>{item.price.toFixed(2)} €</Text>
            <Text style={styles.desc}>{item.description}</Text>
          </View>
        </View>

        {/* 🎛️ Choix d’attributs */}
        {item.attributes?.map((attr: any) => (
          <View key={attr.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{attr.name}</Text>

            {attr.values.map((v: any) => {
              const selected = selectedAttributes[attr.id]?.includes(v.id);
              const isRadio = attr.type === "radio";
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[
                    styles.optionRow,
                    selected && styles.optionRowSelected,
                  ]}
                  onPress={() => handleSelect(attr.id, v.id, attr.type)}
                >
                  <Text style={styles.optionLabel}>
                    {isRadio
                      ? selected
                        ? "🔘"
                        : "⚪"
                      : selected
                      ? "☑️"
                      : "⬜"}{" "}
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

        {/* 🔢 Quantité */}
        <View style={styles.quantityRow}>
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

        {/* 🛒 Bouton d’ajout */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Text style={styles.addButtonText}>
            🛒 {edit === "true" ? "Mettre à jour" : "Ajouter au panier"} •{" "}
            {(getTotalPrice() * quantity).toFixed(2)} €
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/** 💅 Styles */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20, paddingBottom: 120 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B35",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignSelf: "flex-start",
    marginBottom: 20,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  backText: { fontSize: 15, fontWeight: "600", color: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    marginTop: Platform.OS === "ios" ? 20 : 0,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 16,
    marginRight: 15,
  },
  placeholderImage: {
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { fontSize: 30, opacity: 0.6 },
  info: { flex: 1 },
  name: { fontSize: 26, fontWeight: "700" },
  basePrice: { fontSize: 20, color: "#FF6B35", fontWeight: "700" },
  desc: { fontSize: 15, color: "#555", marginTop: 6 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    marginBottom: 10,
  },
  optionRowSelected: {
    backgroundColor: "#FFF3EC",
    borderColor: "#FF6B35",
    borderWidth: 1.5,
  },
  optionLabel: { fontSize: 16, fontWeight: "500" },
  optionPrice: { fontSize: 16, color: "#FF6B35", fontWeight: "600" },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  qtyBtn: {
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  qtyText: { fontSize: 22, fontWeight: "700" },
  qtyNumber: { fontSize: 22, fontWeight: "700", marginHorizontal: 20 },
  addButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  addButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 18,
  },
});
