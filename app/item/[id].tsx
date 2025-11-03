import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions, Platform } from 'react-native';
import { fetchItemDetails } from '@/services/api';
import { ArrowLeft } from 'lucide-react-native';

const { height } = Dimensions.get('window');

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItem = async () => {
      try {
        const data = await fetchItemDetails(id as string);
        setItem(data);
      } catch (err) {
        setError('Impossible de charger le produit.');
      } finally {
        setLoading(false);
      }
    };
    loadItem();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft color="#333" size={26} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrapper}>
          <Image
            source={item.image ? { uri: item.image } : { uri: 'https://via.placeholder.com/400x300.png?text=No+Image' }}
            style={styles.image}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>{item.price} €</Text>
          <Text style={[styles.stock, { color: item.in_stock ? 'green' : 'red' }]}>
            {item.in_stock ? 'En stock' : 'Rupture de stock'}
          </Text>
          <Text style={styles.description}>{item.description || 'Aucune description disponible.'}</Text>
          <Text style={styles.unit}>Unité : {item.uom || '-'}</Text>

          <TouchableOpacity
            style={[styles.addButton, !item.in_stock && { backgroundColor: '#ccc' }]}
            disabled={!item.in_stock}
          >
            <Text style={styles.addButtonText}>
              {item.in_stock ? '🛒 Ajouter au panier' : 'Indisponible'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContainer: { flexGrow: 1, justifyContent: 'space-between', paddingBottom: 30 },
  imageWrapper: {
    width: '100%',
    height: height * 0.35,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  image: { width: '100%', height: '100%', resizeMode: Platform.OS === 'web' ? 'contain' : 'cover' },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 20,
    padding: 20,
    minHeight: height * 0.5,
    justifyContent: 'space-between',
  },
  name: { fontSize: 22, fontWeight: '700', color: '#222', marginBottom: 8 },
  price: { fontSize: 20, color: '#FF6B35', fontWeight: '600', marginBottom: 4 },
  stock: { fontSize: 15, fontWeight: '500', marginBottom: 10 },
  description: { fontSize: 16, color: '#555', lineHeight: 22, marginBottom: 16 },
  unit: { fontSize: 15, color: '#444' },
  addButton: { backgroundColor: '#FF6B35', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  addButtonText: { color: 'white', fontWeight: '700', fontSize: 16 },
  backButton: { position: 'absolute', top: 50, left: 16, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 50, padding: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', fontSize: 16, marginBottom: 16 },
  retryButton: { backgroundColor: '#FF6B35', padding: 10, borderRadius: 8 },
  retryButtonText: { color: 'white', fontWeight: '600' },
});
