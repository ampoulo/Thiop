import { Platform } from 'react-native';

export const KioskTheme = {
    colors: {
        primary: '#FF6B35',
        background: '#FFFFFF',
        backgroundSecondary: '#F8F8F8',
        text: {
            primary: '#222222',
            secondary: '#777777',
            light: '#FFFFFF',
        },
        border: '#EEEEEE',
        activeOption: '#FFF1E9',
        error: '#E53935',
        success: '#4CAF50',
    },
    shadows: {
        card: {
            shadowColor: "#000",
            shadowOpacity: 0.13,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 },
            elevation: 5,
        },
        button: {
            shadowColor: "#FF6B35",
            shadowOpacity: 0.4,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 4,
        },
        small: {
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
        }
    },
    layout: {
        gap: 28,
        borderRadius: {
            small: 12,
            medium: 22,
            large: 42,
            round: 999,
        }
    },
    animations: {
        duration: {
            short: 200,
            medium: 400,
            long: 600,
        },
        config: {
            useNativeDriver: Platform.OS !== 'web',
        }
    }
};
