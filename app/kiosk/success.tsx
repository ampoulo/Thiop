import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useRouter } from "expo-router";
import { KioskTheme } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react-native";

export default function KioskSuccess() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("00");

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Generate random order number
    const num = Math.floor(Math.random() * 90) + 10; // 10-99
    setOrderNumber(num.toString());

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      router.replace("/kiosk");
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>

      <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Check size={60} color="#fff" strokeWidth={4} />
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
        <Text style={styles.title}>Commande confirmée !</Text>
        <Text style={styles.subtitle}>Veuillez récupérer votre ticket</Text>

        <View style={styles.ticket}>
          <Text style={styles.ticketLabel}>COMMANDE N°</Text>
          <Text style={styles.ticketNumber}>{orderNumber}</Text>
        </View>

        <Text style={styles.infoText}>
          Gardez ce numéro, nous vous appellerons lorsqu'elle sera prête.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/kiosk")}
        >
          <Text style={styles.buttonText}>Terminer</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: KioskTheme.colors.background,
    padding: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#4CD964", // Success Green
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    shadowColor: "#4CD964",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 10,
    color: KioskTheme.colors.text.primary
  },
  subtitle: {
    color: KioskTheme.colors.text.secondary,
    fontSize: 18,
    marginBottom: 40
  },
  ticket: {
    backgroundColor: "#f8f8f8",
    paddingVertical: 30,
    paddingHorizontal: 60,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#eee",
    borderStyle: "dashed",
    marginBottom: 40,
  },
  ticketLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#888",
    letterSpacing: 2,
    marginBottom: 5,
  },
  ticketNumber: {
    fontSize: 80,
    fontWeight: "900",
    color: "#222",
  },
  infoText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    maxWidth: 400,
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: KioskTheme.colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 999,
    ...KioskTheme.shadows.button,
  },
  buttonText: {
    color: KioskTheme.colors.text.light,
    fontWeight: "700",
    fontSize: 18
  },
});
