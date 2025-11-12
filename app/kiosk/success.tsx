import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

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
        <Text style={styles.buttonText}>New Order</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  emoji: { fontSize: 80, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 10 },
  subtitle: { color: "#555", fontSize: 16, marginBottom: 30 },
  button: { backgroundColor: "#FF6B35", padding: 16, borderRadius: 12 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 18 },
});
