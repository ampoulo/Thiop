import { useWindowDimensions } from 'react-native';
import { KioskTheme } from '@/constants/theme';

export function useResponsiveGrid() {
    const { width } = useWindowDimensions();

    const getColumns = () => {
        if (width < 400) return 1;    // very small phones
        if (width < 700) return 2;    // phones
        if (width < 1100) return 3;   // tablets
        if (width < 1500) return 4;   // small desktop
        if (width < 2000) return 5;   // medium desktop
        return 6;                     // large screens
    };

    const columns = getColumns();
    const gap = KioskTheme.layout.gap;
    const paddingHorizontal = 20; // Standard padding

    // Calculate item width based on available space
    // (Total Width - (Gap * (Columns - 1)) - (Padding * 2)) / Columns
    const itemWidth = (width - (gap * (columns - 1)) - (paddingHorizontal * 2)) / columns;

    return {
        columns,
        itemWidth,
        gap,
        screenWidth: width,
    };
}
