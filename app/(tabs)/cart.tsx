import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Minus, Plus, X, ArrowRight } from 'lucide-react-native';
import { getCart, updateCartItem, removeCartItem, clearCart } from '@/services/cartService';
import EmptyState from '@/components/common/EmptyState';

export default function CartScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    deliveryFee: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const cartData = await getCart();
      setCart(cartData);
    } catch (err) {
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, quantity) => {
    try {
      if (quantity <= 0) {
        await handleRemoveItem(itemId);
        return;
      }
      
      await updateCartItem(itemId, quantity);
      loadCart();
    } catch (err) {
      console.error('Error updating item:', err);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeCartItem(itemId);
      loadCart();
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to clear your cart?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
  try {
    await clearCart();
    await loadCart(); // 🟢 recharge immédiatement le panier vide
  } catch (err) {
    console.error('Error clearing cart:', err);
  }
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      Alert.alert('Your cart is empty', 'Add some items to your cart before checking out.');
      return;
    }
    
    router.push('/checkout');
  };

  const renderCartItem = ({ item }) => (
    <View style={[
      styles.cartItem,
      {backgroundColor: isDark ? '#222222' : '#FFFFFF'}
    ]}>
      <Image 
        source={{ uri: item.image }} 
        style={styles.itemImage}
      />
      
      <View style={styles.itemDetails}>
        <View style={styles.itemNameContainer}>
          <Text style={[
            styles.itemName,
            {color: isDark ? '#FFFFFF' : '#333333'}
          ]}>
            {item.name}
          </Text>
          
          <TouchableOpacity
            onPress={() => handleRemoveItem(item.id)}
            style={styles.removeButton}
          >
            <X size={16} color={isDark ? '#BBBBBB' : '#999999'} />
          </TouchableOpacity>
        </View>
        
        {item.options && item.options.length > 0 && (
          <Text style={styles.itemOptions}>
            {item.options.join(', ')}
          </Text>
        )}
        
        <View style={styles.itemBottom}>
          <Text style={[
            styles.itemPrice,
            {color: isDark ? '#FFFFFF' : '#333333'}
          ]}>
            ${item.price.toFixed(2)}
          </Text>
          
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                {backgroundColor: isDark ? '#333333' : '#F0F0F0'}
              ]}
              onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
            >
              <Minus size={16} color={isDark ? '#FFFFFF' : '#333333'} />
            </TouchableOpacity>
            
            <Text style={[
              styles.quantityText,
              {color: isDark ? '#FFFFFF' : '#333333'}
            ]}>
              {item.quantity}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.quantityButton,
                {backgroundColor: isDark ? '#333333' : '#F0F0F0'}
              ]}
              onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Plus size={16} color={isDark ? '#FFFFFF' : '#333333'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[
      styles.container,
      {backgroundColor: isDark ? '#121212' : '#F8F9FA'}
    ]}>
      <View style={styles.header}>
        <Text style={[
          styles.title,
          {color: isDark ? '#FFFFFF' : '#333333'}
        ]}>
          Your Cart
        </Text>
        
        {cart.items.length > 0 && (
          <TouchableOpacity
            onPress={handleClearCart}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {cart.items.length === 0 ? (
        <EmptyState
          icon="shopping-cart"
          title="Your cart is empty"
          message="Add items from restaurants to start your order"
          actionLabel="Browse Restaurants"
          onAction={() => router.push('/')}
        />
      ) : (
        <>
          <FlatList
            data={cart.items}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.cartList}
          />
          
          <View style={[
            styles.summaryContainer,
            {backgroundColor: isDark ? '#222222' : '#FFFFFF'}
          ]}>
            <View style={styles.summaryRow}>
              <Text style={[
                styles.summaryLabel,
                {color: isDark ? '#BBBBBB' : '#666666'}
              ]}>
                Subtotal
              </Text>
              <Text style={[
                styles.summaryValue,
                {color: isDark ? '#FFFFFF' : '#333333'}
              ]}>
                ${cart.subtotal.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[
                styles.summaryLabel,
                {color: isDark ? '#BBBBBB' : '#666666'}
              ]}>
                Delivery Fee
              </Text>
              <Text style={[
                styles.summaryValue,
                {color: isDark ? '#FFFFFF' : '#333333'}
              ]}>
                ${cart.deliveryFee.toFixed(2)}
              </Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[
                styles.totalLabel,
                {color: isDark ? '#FFFFFF' : '#333333'}
              ]}>
                Total
              </Text>
              <Text style={[
                styles.totalValue,
                {color: isDark ? '#FFFFFF' : '#333333'}
              ]}>
                ${cart.total.toFixed(2)}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>
                Proceed to Checkout
              </Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  clearButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  cartList: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  itemOptions: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  checkoutButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
});