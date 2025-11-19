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
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { fetchCategories } from "@/services/api";
import { getCart, setOrderType } from "@/services/cartService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsiveGrid } from "@/hooks/useResponsiveGrid";
import { KioskTheme } from "@/constants/theme";
import { Category } from "@/types/kiosk";
import CartSummary from "@/components/kiosk/CartSummary";
import { XCircle, RefreshCw, LogOut } from "lucide-react-native";
import { LoadingAnimation } from "@/components/kiosk/LoadingAnimation";

export default function KioskMenu() {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [orderType, setOrderTypeState] = useState<'eat_in' | 'take_out'>('eat_in');

  const router = useRouter();
  const { itemWidth, gap } = useResponsiveGrid();

  // Page animation
  const fadeScreen = useRef(new Animated.Value(0)).current;
  const translateScreen = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const load = async () => {
      try {
        const [cats, cart] = await Promise.all([fetchCategories(), getCart()]);
        setCategories(cats);
        if (cart) setOrderTypeState(cart.orderType || 'eat_in');
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

  const handleBackPress = async () => {
    const cart = await getCart();
    if (!cart || cart.items.length === 0) {
      router.replace("/kiosk");
    } else {
      setShowExitModal(true);
    }
  };

  const handleSwitchMode = async () => {
    const newType = orderType === 'eat_in' ? 'take_out' : 'eat_in';
    await setOrderType(newType);
    setOrderTypeState(newType);
    setShowExitModal(false);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    router.replace("/kiosk");
  };

  if (loading) {
    return <LoadingAnimation />;
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
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backText}>⟵ Retour</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.title}>Notre Carte</Text>
          <View style={styles.modeBadge}>
            <Text style={styles.modeText}>
              {orderType === 'eat_in' ? '🍽️ Sur place' : '🛍️ À emporter'}
            </Text>
          </View>
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

      {/* EXIT / MODE MODAL */}
      <Modal
        transparent
        visible={showExitModal}
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Déjà fini ? 🥺</Text>
            <Text style={styles.modalText}>
              Vous avez des articles dans votre panier. Que voulez-vous faire ?
            </Text>

            <View style={styles.modalActions}>
              {/* SWITCH MODE */}
              <TouchableOpacity
                style={[styles.modalBtn, styles.btnSwitch]}
                onPress={handleSwitchMode}
              >
                <RefreshCw size={24} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.modalBtnText}>
                  Passer en {orderType === 'eat_in' ? 'À emporter' : 'Sur place'}
                </Text>
              </TouchableOpacity>

              {/* CANCEL ORDER */}
              <TouchableOpacity
                style={[styles.modalBtn, styles.btnCancel]}
                onPress={handleConfirmExit}
              >
                <LogOut size={24} color="#FF512F" style={{ marginRight: 10 }} />
                <Text style={[styles.modalBtnText, { color: '#FF512F' }]}>
                  Annuler ma commande
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeModal}
              onPress={() => setShowExitModal(false)}
            >
              <Text style={styles.closeText}>Non, je continue mes achats</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

  modeBadge: {
    backgroundColor: KioskTheme.colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 5,
  },

  modeText: {
    fontSize: 14,
    fontWeight: "700",
    color: KioskTheme.colors.text.secondary,
    textTransform: "uppercase",
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

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: 600,
    padding: 40,
    borderRadius: 30,
    alignItems: 'center',
    ...KioskTheme.shadows.card,
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: KioskTheme.colors.text.primary,
    marginBottom: 16,
  },
  modalText: {
    fontSize: 20,
    color: KioskTheme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 30,
  },
  modalActions: {
    width: '100%',
    gap: 20,
    marginBottom: 30,
  },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    width: '100%',
  },
  btnSwitch: {
    backgroundColor: KioskTheme.colors.primary,
  },
  btnCancel: {
    backgroundColor: '#FFF0E6',
    borderWidth: 2,
    borderColor: '#FF512F',
  },
  modalBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  closeModal: {
    padding: 10,
  },
  closeText: {
    fontSize: 18,
    color: KioskTheme.colors.text.secondary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
