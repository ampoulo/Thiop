import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_STORAGE_KEY = 'food_delivery_cart';
let currentCart: any = null;

// 🔧 Convertit toujours l'ID en string (évite les conflits nombre/texte)
const toStr = (id: any) => String(id);

// 🛒 Crée un panier vide
const createEmptyCart = () => ({
  items: [],
  subtotal: 0,
  deliveryFee: 0,
  total: 0,
});

// 🔄 Recalcule les totaux
const recalc = () => {
  if (!currentCart) currentCart = createEmptyCart();

  const subtotal = currentCart.items.reduce(
    (sum: number, i: any) => sum + i.price * i.quantity,
    0
  );

  const count = currentCart.items.reduce((s: number, i: any) => s + i.quantity, 0);
  const delivery = count ? 2.99 + 0.5 * 1.5 + 0.2 * (count - 1) : 0;

  currentCart.subtotal = +subtotal.toFixed(2);
  currentCart.deliveryFee = +delivery.toFixed(2);
  currentCart.total = +(subtotal + delivery).toFixed(2);
};

// 💾 Sauvegarde le panier dans AsyncStorage
const saveCart = async () => {
  await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(currentCart));
};

// 📥 Charge le panier depuis AsyncStorage
const loadCart = async () => {
  const data = await AsyncStorage.getItem(CART_STORAGE_KEY);
  currentCart = data ? JSON.parse(data) : createEmptyCart();
  recalc();
  return currentCart;
};

// 📦 Récupère le panier actuel
export const getCart = async () => {
  if (!currentCart) await loadCart();
  recalc();
  return currentCart;
};

// 🧹 Vide le panier
export const clearCart = async () => {
  currentCart = createEmptyCart();
  await AsyncStorage.removeItem(CART_STORAGE_KEY);
  // 🟢 Re-sauvegarde un panier vide pour éviter les problèmes après clear
  await saveCart();
  return currentCart;
};

// ➕ Ajoute un produit au panier
export const addToCart = async (item: any, quantity = 1) => {
  // 🟢 Si le panier est nul ou vide, on le recrée
  if (!currentCart || !Array.isArray(currentCart.items)) {
    currentCart = createEmptyCart();
  }

  const idStr = toStr(item.id);
  const existing = currentCart.items.find((i: any) => toStr(i.id) === idStr);

  if (existing) {
    existing.quantity += quantity;
  } else {
    currentCart.items.push({
      id: idStr,
      name: item.name,
      price: item.price,
      image: item.image || null,
      quantity,
    });
  }

  recalc();
  await saveCart();
  return currentCart;
};

// 🔁 Met à jour la quantité d’un article
export const updateCartItem = async (itemId: any, quantity: number) => {
  await loadCart();

  const idStr = toStr(itemId);
  const index = currentCart.items.findIndex((i: any) => toStr(i.id) === idStr);

  if (index === -1) {
    console.warn(`⚠️ updateCartItem: item ${idStr} introuvable`);
    return currentCart;
  }

  if (quantity <= 0) {
    currentCart.items.splice(index, 1);
  } else {
    currentCart.items[index].quantity = quantity;
  }

  recalc();
  await saveCart();
  return currentCart;
};

// ❌ Supprime un article du panier
export const removeCartItem = async (itemId: any) => {
  await loadCart();

  const idStr = toStr(itemId);
  const before = currentCart.items.length;

  currentCart.items = currentCart.items.filter(
    (i: any) => toStr(i.id) !== idStr
  );

  if (before === currentCart.items.length) {
    console.warn(`⚠️ removeCartItem: item ${idStr} introuvable`);
  }

  recalc();
  await saveCart();
  return currentCart;
};

// 📦 Export par défaut (facultatif)
export default {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
