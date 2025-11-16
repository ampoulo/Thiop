import { Stack } from "expo-router";
import { SafeAreaView } from "react-native";
import { View, StyleSheet, Platform } from "react-native";

export default function KioskLayout() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 1200, // ⭐ Very important for desktop layout
    alignSelf: "center",
    backgroundColor: "#fff",
  },
});
