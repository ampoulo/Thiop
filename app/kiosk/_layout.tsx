import { Stack, useRouter, useSegments, usePathname } from "expo-router";
import { SafeAreaView } from "react-native";
import { View, StyleSheet, Platform } from "react-native";
import { InactivityHandler } from "@/components/kiosk/InactivityHandler";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function KioskLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        await AsyncStorage.getItem('COMPANY_ID');
      } catch (e) {
        console.error("Error checking config:", e);
      } finally {
        setIsReady(true);
      }
    };
    checkConfig();
  }, []);

  if (!isReady) return <View style={styles.container} />;

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
