import React, { useRef, useEffect, useState } from 'react';
import { View, PanResponder, Text, Modal, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { KioskTheme } from '@/constants/theme';

const WARNING_THRESHOLD_MS = 45000; // 45 seconds
const MAX_INACTIVITY_MS = 60000;    // 60 seconds

export const InactivityHandler = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(15);

  const lastInteraction = useRef<number>(Date.now());
  const checkInterval = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const resetTimer = () => {
    lastInteraction.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setSecondsRemaining(15);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetTimer();
        return false;
      },
      onMoveShouldSetPanResponderCapture: () => {
        resetTimer();
        return false;
      },
    })
  ).current;

  useEffect(() => {
    checkInterval.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastInteraction.current;

      if (elapsed >= MAX_INACTIVITY_MS) {
        // Timeout reached
        if (pathname !== '/kiosk' && pathname !== '/kiosk/' && pathname !== '/kiosk/login') {
          console.log("Inactivity timeout - redirecting");
          router.replace('/kiosk');
        }
        resetTimer(); // Reset after redirect
      } else if (elapsed >= WARNING_THRESHOLD_MS) {
        // Warning threshold reached
        if (!showWarning && pathname !== '/kiosk/login') {
          setShowWarning(true);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
          }).start();
        }
        setSecondsRemaining(Math.ceil((MAX_INACTIVITY_MS - elapsed) / 1000));
      }
    }, 1000);

    return () => {
      if (checkInterval.current) clearInterval(checkInterval.current);
    };
  }, [pathname, showWarning]);

  // Si on est sur l'écran de login, pas besoin de timeout
  if (pathname === '/kiosk/login') {
    return <View style={{ flex: 1 }}>{children}</View>;
  }

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}

      {/* WARNING MODAL */}
      <Modal
        transparent
        visible={showWarning}
        animationType="none"
      >
        <View style={styles.overlay}>
          <Animated.View style={[styles.alertBox, { opacity: fadeAnim }]}>
            <Text style={styles.alertTitle}>Êtes-vous toujours là ?</Text>
            <Text style={styles.alertText}>
              Votre session va expirer dans <Text style={styles.countdown}>{secondsRemaining}s</Text>
            </Text>

            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={resetTimer}
            >
              <Text style={styles.buttonText}>Oui, je continue</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    width: 500,
    ...KioskTheme.shadows.card,
  },
  alertTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: KioskTheme.colors.text.primary,
    marginBottom: 16,
  },
  alertText: {
    fontSize: 20,
    color: KioskTheme.colors.text.secondary,
    marginBottom: 40,
  },
  countdown: {
    color: KioskTheme.colors.primary,
    fontWeight: '900',
    fontSize: 24,
  },
  button: {
    backgroundColor: KioskTheme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  }
});
