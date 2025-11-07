import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import Toast from 'react-native-toast-message';
import { BaseToast } from 'react-native-toast-message';
export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      <Toast
        position="top"
        topOffset={60}
        config={{
          success: (props) => (
            <BaseToast
              {...props}
              style={{
                borderLeftColor: '#FF6B35',
                backgroundColor: '#FF6B35',
                borderRadius: 12,
                paddingVertical: 8,
              }}
              contentContainerStyle={{ paddingHorizontal: 15 }}
              text1Style={{
                fontSize: 16,
                fontWeight: '700',
                color: 'white',
              }}
              text2Style={{
                fontSize: 14,
                color: '#fff',
                opacity: 0.9,
              }}
              text1={props.text1}
              text2={props.text2}
            />
          ),
          error: (props) => (
            <ErrorToast
              {...props}
              style={{
                borderLeftColor: '#E53935',
                backgroundColor: '#E53935',
                borderRadius: 12,
              }}
              text1Style={{
                fontSize: 16,
                fontWeight: '700',
                color: 'white',
              }}
              text2Style={{
                fontSize: 14,
                color: '#fff',
                opacity: 0.9,
              }}
            />
          ),
        }}
      />
    </>
    
  );
}
