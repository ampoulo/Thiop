import React from 'react';
import { View, FlatList, StyleSheet, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import RecentOrderCard from '@/components/profile/RecentOrderCard';
const ProfileScreen = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Données mockées pour tester
  const mockOrders = [
    {
      id: '123',
      restaurantName: 'Le Petit Dakar',
      restaurantImage: 'https://via.placeholder.com/80',
      date: '20/06/2025',
      status: 'processing',
      total: 15.99,
      items: 2,
    },
    {
      id: '124',
      restaurantName: 'Chez Mamadou',
      restaurantImage: 'https://via.placeholder.com/80',
      date: '19/06/2025',
      status: 'delivered',
      total: 22.50,
      items: 3,
    },
  ];

  const handlePress = (order: any) => {
    router.push(`/track/${order.id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F8F9FA' }]}>
      <FlatList
        data={mockOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecentOrderCard
            order={item}
            onPress={() => handlePress(item)}
            isDark={isDark}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 10 },
});

export default ProfileScreen;