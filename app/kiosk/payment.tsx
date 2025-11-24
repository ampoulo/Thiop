import { View, Text, StyleSheet, TouchableOpacity, Animated, useWindowDimensions, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { clearCart, getCart } from "@/services/cartService";
import { createOrder } from "@/services/api";
import { KioskTheme } from "@/constants/theme";
import { CreditCard, Banknote } from "lucide-react-native";
import { useRef, useEffect, useState } from "react";
import { Alert, ActivityIndicator } from "react-native";

export default function KioskPayment() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [processing, setProcessing] = useState(false);

  // Responsive Logic
  const isSmallScreen = width < 800;
  const cardWidth = isSmallScreen ? Math.min(width - 40, 350) : 380;
  const cardHeight = isSmallScreen ? 250 : 420;
  const iconSize = isSmallScreen ? 40 : 60;
  const titleSize = isSmallScreen ? 28 : 48;
  const gap = isSmallScreen ? 20 : 60;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePayment = async (method: string) => {
    console.log("handlePayment called with method:", method);
    if (processing) {
      console.log("Already processing, ignoring click.");
      return;
    }
    setProcessing(true);

    try {
      console.log("Fetching cart...");
      // 1. Récupérer le panier actuel
      const cart = await getCart();
      console.log("Cart fetched:", cart);

      if (!cart || cart.items.length === 0) {
        console.log("Cart is empty");
        Alert.alert("Erreur", "Votre panier est vide.");
        setProcessing(false);
        return;
      }

      console.log("Creating order in Odoo...");
      // 2. Créer la commande dans Odoo
      // TODO: Récupérer le type de commande (sur place / à emporter) depuis le contexte ou le panier
      // Pour l'instant on met 'eat_in' par défaut, à améliorer plus tard
      const order = await createOrder(cart, 'eat_in');

      console.log("Order created successfully:", order);

      // 3. Vider le panier local
      await clearCart();

      // 4. Rediriger vers succès
      router.push("/kiosk/success");
    } catch (error) {
      console.error("Payment failed with error:", error);
      Alert.alert("Erreur", "La création de la commande a échoué. Veuillez réessayer.");
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER FIXED */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>⟵ Retour</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>



          <Text style={[styles.title, { fontSize: titleSize }]}>Moyen de paiement</Text>
          <Text style={[styles.subtitle, { fontSize: isSmallScreen ? 16 : 24, marginBottom: isSmallScreen ? 30 : 80 }]}>
            Comment souhaitez-vous régler votre commande ?
          </Text>

          <View style={[styles.cardsContainer, { gap }]}>
            {/* CARTE BANCAIRE */}
            <TouchableOpacity
              style={[styles.card, { width: cardWidth, height: cardHeight }]}
              activeOpacity={0.9}
              onPress={() => handlePayment('card')}
            >
              <View style={[styles.iconCircle, {
                backgroundColor: "#E6F4FF",
                width: isSmallScreen ? 80 : 120,
                height: isSmallScreen ? 80 : 120,
                borderRadius: isSmallScreen ? 40 : 60,
                marginBottom: isSmallScreen ? 20 : 40
              }]}>
                <CreditCard size={iconSize} color="#007AFF" />
              </View>
              <Text style={[styles.cardTitle, { fontSize: isSmallScreen ? 20 : 28 }]}>Carte Bancaire</Text>
              <Text style={[styles.cardDesc, { fontSize: isSmallScreen ? 14 : 18 }]}>Visa, Mastercard, Sans contact</Text>
            </TouchableOpacity>

            {/* COMPTOIR / ESPECES */}
            <TouchableOpacity
              style={[styles.card, { width: cardWidth, height: cardHeight }]}
              activeOpacity={0.9}
              onPress={() => handlePayment('cash')}
            >
              <View style={[styles.iconCircle, {
                backgroundColor: "#FFF0E6",
                width: isSmallScreen ? 80 : 120,
                height: isSmallScreen ? 80 : 120,
                borderRadius: isSmallScreen ? 40 : 60,
                marginBottom: isSmallScreen ? 20 : 40
              }]}>
                <Banknote size={iconSize} color="#FF6B35" />
              </View>
              <Text style={[styles.cardTitle, { fontSize: isSmallScreen ? 20 : 28 }]}>Au Comptoir</Text>
              <Text style={[styles.cardDesc, { fontSize: isSmallScreen ? 14 : 18 }]}>Espèces, Tickets Restaurant</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KioskTheme.colors.backgroundSecondary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  content: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    width: "100%",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 0,
    backgroundColor: KioskTheme.colors.backgroundSecondary,
    zIndex: 10,
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
    fontWeight: "900",
    marginBottom: 16,
    color: KioskTheme.colors.text.primary,
    textAlign: "center",
  },
  subtitle: {
    color: KioskTheme.colors.text.secondary,
    textAlign: "center",
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    ...KioskTheme.shadows.card,
    shadowRadius: 30,
  },
  iconCircle: {
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontWeight: "800",
    color: KioskTheme.colors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  cardDesc: {
    color: KioskTheme.colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
});
