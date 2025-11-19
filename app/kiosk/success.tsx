import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { KioskTheme } from "@/constants/theme";

export default function KioskSuccess() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>✅</Text>
      <Text style={styles.title}>Order Confirmed!</Text>
      <Text style={styles.subtitle}>Your order is being prepared 👨‍🍳</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/kiosk")}
      >
        <Text style={styles.buttonText}>Nouvelle Commande</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: KioskTheme.colors.background },
  emoji: { fontSize: 80, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 10, color: KioskTheme.colors.text.primary },
  subtitle: { color: KioskTheme.colors.text.secondary, fontSize: 16, marginBottom: 30 },
  button: {
    backgroundColor: KioskTheme.colors.primary,
    padding: 16,
    borderRadius: 12,
    ...KioskTheme.shadows.button,
  },
  buttonText: { color: KioskTheme.colors.text.light, fontWeight: "700", fontSize: 18 },
});
