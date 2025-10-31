import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { MapPin, CreditCard } from 'lucide-react-native';
import { fetchFeaturedItems, fetchCategories, fetchRestaurants } from '@/services/api';
import CategoryList from '@/components/home/CategoryList';
import FeaturedSection from '@/components/home/FeaturedSection';
import RestaurantList from '@/components/home/RestaurantList';
import LocationHeader from '@/components/common/LocationHeader';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(true);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState(null);

  // Fetch data from Odoo backend
  const loadInitialData = async () => {
    try {
      const categoriesData = await fetchCategories();
      const featuredData = await fetchFeaturedItems();
      const restaurantsData = await fetchRestaurants();

      setCategories(categoriesData);
      setFeaturedItems(featuredData);
      setRestaurants(restaurantsData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            loadInitialData();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[
      styles.container, 
      {backgroundColor: isDark ? '#121212' : '#F8F9FA'}
    ]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <LocationHeader />
      
      {/* Demo Payment Button - Moved to top for better visibility */}
      <View style={styles.demoContainer}>
        <TouchableOpacity
          style={styles.demoButton}
          onPress={() => router.push('/payment-demo')}
        >
          <CreditCard size={20} color="#FFFFFF" />
          <Text style={styles.demoButtonText}>
            🎯 Voir la Simulation de Paiement
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Categories Section */}
        <CategoryList categories={categories} onSelectCategory={(id) => {
          router.push(`/category/${id}`);
        }} />
        
        {/* Featured Items Section */}
        <FeaturedSection 
          items={featuredItems} 
          onSelectItem={(id) => {
            router.push(`/item/${id}`);
          }}
        />
        
        {/* Nearby Restaurants */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
              Nearby Restaurants
            </Text>
            <TouchableOpacity onPress={() => router.push('/restaurants')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <RestaurantList 
            restaurants={restaurants} 
            onSelectRestaurant={(id) => {
              router.push(`/restaurant/${id}`);
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  demoButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 8,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  textLight: {
    color: '#FFFFFF',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});