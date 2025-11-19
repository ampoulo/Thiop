import { Stack } from "expo-router";
import { SafeAreaView } from "react-native";
import { View, StyleSheet, Platform } from "react-native";
import { InactivityHandler } from "@/components/kiosk/InactivityHandler";

export default function KioskLayout() {
  return (
    <SafeAreaView style={styles.safe}>
      <InactivityHandler>
        <View style={styles.container}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade",
            }}
          />
        </View>
      </InactivityHandler>
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
    backgroundColor: "#fff",
  },
});
