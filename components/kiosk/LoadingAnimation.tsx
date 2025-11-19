import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { KioskTheme } from '@/constants/theme';

export const LoadingAnimation = () => {
    const bounceAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Bouncing Animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(bounceAnim, {
                    toValue: -20,
                    duration: 400,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(bounceAnim, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.bounce,
                    useNativeDriver: true,
                }),
                Animated.delay(100),
            ])
        ).start();

        // Subtle Rotation
        Animated.loop(
            Animated.sequence([
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: -1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const rotate = rotateAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-10deg', '10deg'],
    });

    return (
        <View style={styles.container}>
            <Animated.View
                style={{
                    transform: [
                        { translateY: bounceAnim },
                        { rotate: rotate }
                    ],
                }}
            >
                <Text style={styles.emoji}>🍔</Text>
            </Animated.View>
            <Text style={styles.text}>Préparation en cours...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: KioskTheme.colors.background,
    },
    emoji: {
        fontSize: 60,
        marginBottom: 20,
    },
    text: {
        fontSize: 18,
        fontWeight: '600',
        color: KioskTheme.colors.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
