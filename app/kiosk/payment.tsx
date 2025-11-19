import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { clearCart } from "@/services/cartService";
import { KioskTheme } from "@/constants/theme";

export default function KioskPayment() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Payment Method</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          clearCart();
          router.push("/kiosk/success")
        }}
      >
        <Text style={styles.text}>💳 Pay by Card</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          clearCart();
          router.push("/kiosk/success")
        }}
      >
        <Text style={styles.text}>💵 Pay by Cash</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: KioskTheme.colors.background },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 40, color: KioskTheme.colors.text.primary },
  button: {
    backgroundColor: KioskTheme.colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginVertical: 10,
    ...KioskTheme.shadows.button,
  },
  text: { color: KioskTheme.colors.text.light, fontSize: 18, fontWeight: "700" },
});
