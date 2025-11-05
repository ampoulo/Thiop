import axios from 'axios';

// === CONFIGURATION DE L'API ODOO ===
const ODOO_API_BASE_URL = 'http://172.28.145.203:8069'; // ton serveur Odoo

// === CLIENT AXIOS CONFIGURÉ ===
const odooClient = axios.create({
  baseURL: ODOO_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// === Gestion des erreurs ===
odooClient.interceptors.response.use(
  response => response,
  error => {
    console.error('❌ Erreur API Odoo:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

//
// ============================
// 🚀  API ODOO : CATÉGORIES
// ============================
//
export const fetchCategories = async () => {
  try {
    const response = await odooClient.get('/api/categories');
    const data = response.data;

    if (data.status === 200 && data.data) {
      return data.data.map(category => ({
        id: category.id.toString(),
        name: category.name,
      }));
    }

    return [];
  } catch (error) {
    console.error('❌ Erreur fetchCategories:', error);
    return [];
  }
};

//
// ============================
// 🚀  API ODOO : PRODUITS
// ============================
//
export const fetchFeaturedItems = async () => {
  try {
    const response = await odooClient.get('/api/products?limit=10');
    const data = response.data;

    if (data.status === 200 && data.data) {
      return data.data.map(product => ({
        id: product.id.toString(),
        name: product.name,
        restaurant: product.category?.name || 'Restaurant',
        image: product.image || null,
        price: product.price,
        rating: 4.5,
        in_stock: product.in_stock,
      }));
    }

    return [];
  } catch (error) {
    console.error('❌ Erreur fetchFeaturedItems:', error);
    return [];
  }
};

//
// ============================
// 🚀  API ODOO : DÉTAIL PRODUIT
// ============================
//
export const fetchItemDetails = async (id: string) => {
  try {
    const response = await odooClient.get(`/api/products/${id}`);
    const data = response.data;

    if (data.status === 200 && data.data) {
      const product = data.data;
      return {
        id: product.id.toString(),
        name: product.name,
        description: product.description || '',
        price: product.price,
        image: product.image || null,
        in_stock: product.in_stock,
        uom: product.uom || '',
      };
    }

    throw new Error('Produit introuvable');
  } catch (error) {
    console.error(`❌ Erreur fetchItemDetails(${id}):`, error);
    throw error;
  }
};

//
// ============================
// 🍽️  RESTAURANTS (FAUX TEMPORAIRE)
// ============================
//
export const fetchRestaurants = async () => [
  { id: '201', name: 'Pizza Palace', cuisine: 'Italian', rating: 4.7, deliveryTime: '25-35 min', deliveryFee: 2.99, distance: 1.2 },
  { id: '202', name: 'Burger Joint', cuisine: 'American', rating: 4.5, deliveryTime: '15-25 min', deliveryFee: 1.99, distance: 0.8 },
];
export const fetchProductsByCategory = async (categoryId: string) => {
  try {
    const response = await odooClient.get(`/api/categories/${categoryId}/products`);
    const data = response.data;

    if (data.status === 200 && data.data) {
      return data.data.map((product) => ({
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.image,
        in_stock: product.in_stock,
        uom: product.uom,
      }));
    }

    return [];
  } catch (error) {
    console.error('❌ Erreur fetchProductsByCategory:', error);
    return [];
  }
};

export default {
  fetchCategories,
  fetchFeaturedItems,
  fetchItemDetails,
  fetchRestaurants,
  fetchProductsByCategory
};
