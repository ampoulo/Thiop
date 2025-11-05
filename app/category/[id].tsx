import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchProductsByCategory } from '@/services/api';
import { addToCart } from '@/services/cartService';
import Toast from 'react-native-toast-message';
import { ArrowLeft } from 'lucide-react-native';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const { width } = useWindowDimensions();

  const numColumns = width < 500 ? 2 : width < 900 ? 3 : 4;
  const itemWidth = width / numColumns - 24;

  useEffect(() => {
    loadProducts();
  }, [id]);

  const loadProducts = async () => {
    try {
      const data = await fetchProductsByCategory(id as string);
      setProducts(data);
    } catch (err) {
      console.error('Erreur chargement produits par catégorie:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item: any) => {
    try {
      setAddingId(item.id);
      await addToCart(item, 1);
      Toast.show({
        type: 'success',
        text1: '🛒 Produit ajouté',
        text2: `${item.name} a été ajouté au panier.`,
        position: 'top',
        topOffset: 60,
        visibilityTime: 2500,
      });
    } catch (err) {
      console.error('Erreur ajout panier:', err);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible d’ajouter le produit.',
        position: 'top',
      });
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft color="#333" size={26} />
      </TouchableOpacity>

      <Text style={styles.title}>Produits de la catégorie</Text>

      {products.length === 0 ? (
        <Text style={styles.emptyText}>Aucun produit trouvé dans cette catégorie.</Text>
      ) : (
        <FlatList
          data={products}
          numColumns={numColumns}
          key={numColumns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <View style={[styles.card, { width: itemWidth }]}>
              <TouchableOpacity
                onPress={() => router.push(`/item/${item.id}`)}
                style={styles.imageWrapper}
              >
                <Image
                  source={{
                    uri:
                      item.image || 'https://via.placeholder.com/200x200.png?text=No+Image',
                  }}
                  style={styles.image}
                />
                {!item.in_stock && (
                  <View style={styles.outOfStockOverlay}>
                    <Text style={styles.outOfStockText}>Rupture de stock</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>

                <View style={styles.bottomRow}>
                  <Text style={styles.price}>{item.price} €</Text>
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      (!item.in_stock || addingId === item.id) && { backgroundColor: '#ccc' },
                    ]}
                    disabled={!item.in_stock || addingId === item.id}
                    onPress={() => handleAddToCart(item)}
                  >
                    <Text style={styles.addButtonText}>
                      {addingId === item.id ? '⏳' : '🛒'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 16 },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 50,
    padding: 8,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#222', marginVertical: 70, textAlign: 'center' },
  grid: { paddingBottom: 120, justifyContent: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  imageWrapper: {
    width: '100%',
    height: 160,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#C0392B',
    fontWeight: '700',
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  info: { padding: 10, flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: { fontSize: 15, color: '#FF6B35', fontWeight: '700' },
  addButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  addButtonText: { color: 'white', fontWeight: '700', fontSize: 14 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#777', fontSize: 16, marginTop: 20 },
});
