import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function KioskPayment() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Payment Method</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/kiosk/success")}
      >
        <Text style={styles.text}>💳 Pay by Card</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/kiosk/success")}
      >
        <Text style={styles.text}>💵 Pay by Cash</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 40 },
  button: {
    backgroundColor: "#FF6B35",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginVertical: 10,
  },
  text: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
