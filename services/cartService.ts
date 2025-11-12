import AsyncStorage from "@react-native-async-storage/async-storage";

const CART_STORAGE_KEY = "food_delivery_cart";
let currentCart: any = null;

// ---------- Utils ----------

// Tri des attributs/valeurs pour une clé stable, peu importe l'ordre de sélection
const canonicalizeAttributes = (attrs: any[] = []) => {
  try {
    const copy = (attrs || []).map((a) => ({
      name: a.name,
      // Certaines structures ont attr.id ou attribute_id, on garde name/id si dispo
      id: a.id ?? a.attribute_id,
      values: (a.values || [])
        .map((v: any) => ({
          id: v.id,
          name: v.name,
          price_extra: Number(v.price_extra || 0),
        }))
        .sort((v1: any, v2: any) =>
          (String(v1.name) || "").localeCompare(String(v2.name) || "")
        ),
    }));
    // Tri des attributs par nom (ou id)
    copy.sort((a: any, b: any) =>
      (String(a.name) || "").localeCompare(String(b.name) || "")
    );
    return copy;
  } catch {
    return attrs || [];
  }
};

// Génère une clé unique par ligne en fonction du produit + options (canonicalisées)
const makeUniqueKey = (item: any) => {
  const attrs = canonicalizeAttributes(item.selectedAttributes || []);
  const attributesKey = JSON.stringify(attrs);
  return `${item.id}_${attributesKey}`;
};

const toStr = (id: any) => String(id);

const createEmptyCart = () => ({
  items: [] as any[],
  subtotal: 0,
  deliveryFee: 0,
  total: 0,
});

const computeTotalPriceIfMissing = (item: any) => {
  // Si total_price n'est pas fourni, on le calcule = base + extras
  if (typeof item.total_price === "number") return Number(item.total_price);
  const extras = (item.selectedAttributes || []).flatMap((a: any) => a.values || []);
  const extraSum = extras.reduce(
    (s: number, v: any) => s + Number(v.price_extra || 0),
    0
  );
  return Number(item.price || 0) + extraSum;
};

const recalc = () => {
  if (!currentCart) currentCart = createEmptyCart();

  const subtotal = currentCart.items.reduce(
    (sum: number, i: any) => sum + Number(i.total_price || 0) * Number(i.quantity || 0),
    0
  );

  currentCart.subtotal = +subtotal.toFixed(2);
  currentCart.deliveryFee = 0; // remets ton calcul si besoin
  currentCart.total = +(subtotal + currentCart.deliveryFee).toFixed(2);
};

const saveCart = async () => {
  try {
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(currentCart));
  } catch {
    // on ignore, mais on pourrait logger
  }
};

const loadCart = async () => {
  try {
    const data = await AsyncStorage.getItem(CART_STORAGE_KEY);
    currentCart = data ? JSON.parse(data) : createEmptyCart();
  } catch {
    currentCart = createEmptyCart();
  }
  recalc();
  return currentCart;
};

// ---------- API publique ----------

export const getCart = async () => {
  if (!currentCart) await loadCart();
  recalc();
  return currentCart;
};

export const clearCart = async () => {
  currentCart = createEmptyCart();
  try {
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    // noop
  }
  await saveCart();
  return currentCart;
};

// Ajoute une ligne (ou cumule la quantité si même produit + mêmes options)
export const addToCart = async (item: any, quantity = 1) => {
  if (!currentCart || !Array.isArray(currentCart.items)) {
    currentCart = createEmptyCart();
  }

  const normalizedAttrs = canonicalizeAttributes(item.selectedAttributes || []);
  const key = makeUniqueKey({ ...item, selectedAttributes: normalizedAttrs });

  const existing = currentCart.items.find((i: any) => i.uniqueKey === key);

  if (existing) {
    existing.quantity = Number(existing.quantity || 0) + Number(quantity || 0);
  } else {
    currentCart.items.push({
      uniqueKey: key,
      id: toStr(item.id),
      name: item.name,
      base_price: Number(item.price || 0),
      total_price: computeTotalPriceIfMissing({
        ...item,
        selectedAttributes: normalizedAttrs,
      }),
      image: item.image || null,
      quantity: Number(quantity || 1),
      selectedAttributes: normalizedAttrs,
    });
  }

  recalc();
  await saveCart();
  return currentCart;
};

// Met à jour la quantité (supprime si <= 0)
export const updateCartItem = async (uniqueKey: string, quantity: number) => {
  await loadCart();
  const index = currentCart.items.findIndex((i: any) => i.uniqueKey === uniqueKey);
  if (index === -1) return currentCart;

  if (quantity <= 0) {
    currentCart.items.splice(index, 1);
  } else {
    currentCart.items[index].quantity = Number(quantity || 0);
  }

  recalc();
  await saveCart();
  return currentCart;
};

// Supprime une ligne précise
export const removeCartItem = async (uniqueKey: string) => {
  await loadCart();
  currentCart.items = currentCart.items.filter((i: any) => i.uniqueKey !== uniqueKey);
  recalc();
  await saveCart();
  return currentCart;
};

// Remplace une ligne (ex: après modification depuis la fiche produit)
// -> si la nouvelle clé correspond déjà à une ligne existante, on fusionne les quantités
export const replaceCartItem = async (oldKey: string, newItem: any) => {
  await loadCart();

  // Enlève l’ancienne ligne
  const old = currentCart.items.find((i: any) => i.uniqueKey === oldKey);
  currentCart.items = currentCart.items.filter((i: any) => i.uniqueKey !== oldKey);

  // Canonicalise et calcule la nouvelle clé
  const normalizedAttrs = canonicalizeAttributes(newItem.selectedAttributes || []);
  const newKey = makeUniqueKey({ ...newItem, selectedAttributes: normalizedAttrs });

  const existing = currentCart.items.find((i: any) => i.uniqueKey === newKey);
  const base = {
    uniqueKey: newKey,
    id: toStr(newItem.id),
    name: newItem.name,
    base_price: Number(newItem.price || 0),
    total_price: computeTotalPriceIfMissing({
      ...newItem,
      selectedAttributes: normalizedAttrs,
    }),
    image: newItem.image || null,
    quantity: Number(newItem.quantity || (old?.quantity ?? 1)),
    selectedAttributes: normalizedAttrs,
  };

  if (existing) {
    existing.quantity = Number(existing.quantity || 0) + Number(base.quantity || 0);
  } else {
    currentCart.items.push(base);
  }

  recalc();
  await saveCart();
  return currentCart;
};

// Récupérer une ligne précise (pratique pour ouvrir la page d’édition)
export const getItemByKey = async (uniqueKey: string) => {
  await loadCart();
  return currentCart.items.find((i: any) => i.uniqueKey === uniqueKey) || null;
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  replaceCartItem,
  getItemByKey,
  clearCart,
};
