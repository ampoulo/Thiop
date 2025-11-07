import axios from 'axios';

// === CONFIGURATION DE L'API ODOO ===
const ODOO_API_BASE_URL = 'http://localhost:8069'; // ton serveur Odoo
const API_KEY = 'your-api-key'; // optionnel pour l'instant

// === CLIENT AXIOS CONFIGURÉ ===
const odooClient = axios.create({
  baseURL: ODOO_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  },
  timeout: 10000
});

// === Gestion des erreurs ===
odooClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

//
// ============================
//  🚀  API ODOO : CATÉGORIES
// ============================
//
export const fetchCategories = async () => {
  try {
    const response = await odooClient.get('/api/categories');
    const data = response.data;
    console.log('✅ Catégories depuis Odoo:', data);

    if (data.status === 200 && data.data) {
      return data.data.map(category => ({
        id: category.id.toString(),
        name: category.name
      }));
    }

    return getMockCategories();
  } catch (error) {
    console.error('❌ Erreur fetchCategories:', error);
    return getMockCategories();
  }
};

// === Mock fallback si Odoo n’est pas dispo ===
const getMockCategories = () => [
  { id: '1', name: 'Pizza' },
  { id: '2', name: 'Burgers' },
  { id: '3', name: 'Sushi' },
  { id: '4', name: 'Pasta' },
  { id: '5', name: 'Salads' },
  { id: '6', name: 'Desserts' },
];

//
// ============================
//  🚀  API ODOO : PRODUITS
// ============================
//
export const fetchFeaturedItems = async () => {
  try {
    const response = await odooClient.get('/api/products?limit=10');
    const data = response.data;
    console.log('✅ Produits depuis Odoo:', data);

    if (data.status === 200 && data.data) {
      return data.data.map(product => ({
        id: product.id.toString(),
        name: product.name,
        restaurant: product.category?.name || 'Restaurant',
        image: product.image || null,
        price: product.price,
        rating: 4.5,
        in_stock: product.in_stock
      }));
    }

    return getMockFeaturedItems();
  } catch (error) {
    console.error('❌ Erreur fetchFeaturedItems:', error);
    return getMockFeaturedItems();
  }
};

// === Mock fallback pour les produits ===
const getMockFeaturedItems = () => [
  { id: '101', name: 'Margherita Pizza', restaurant: 'Pizza Palace', price: 12.99, rating: 4.7 },
  { id: '102', name: 'Classic Burger', restaurant: 'Burger Joint', price: 10.49, rating: 4.5 },
  { id: '103', name: 'California Roll', restaurant: 'Sushi Express', price: 14.99, rating: 4.8 },
  { id: '104', name: 'Fettuccine Alfredo', restaurant: 'Pasta House', price: 13.99, rating: 4.6 },
  { id: '105', name: 'Caesar Salad', restaurant: 'Fresh Greens', price: 9.99, rating: 4.4 }
];

//
// ============================
//  🍽️  AUTRES FONCTIONS MOCK
// ============================
//
export const fetchRestaurants = async () => [
  { id: '201', name: 'Pizza Palace', cuisine: 'Italian', rating: 4.7, deliveryTime: '25-35 min', deliveryFee: 2.99, distance: 1.2 },
  { id: '202', name: 'Burger Joint', cuisine: 'American', rating: 4.5, deliveryTime: '15-25 min', deliveryFee: 1.99, distance: 0.8 },
];

export const fetchRestaurantDetails = async (id) => ({
  id,
  name: 'Pizza Palace',
  description: 'A fantastic restaurant serving delicious food.',
  categories: ['Pizza', 'Pasta'],
  menu: [],
});

export const fetchItemDetails = async (id) => ({
  id,
  name: 'Margherita Pizza',
  description: 'A delicious pizza made with the finest ingredients.',
  price: 12.99,
  rating: 4.7,
});

export const searchRestaurantsAndItems = async (query) => {
  if (!query || query.length < 2) return [];
  const products = await fetchFeaturedItems();
  return products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
};

export const fetchCategoryDetails = async (categoryId) => {
  const categories = await fetchCategories();
  const category = categories.find(c => c.id === categoryId);
  if (!category) throw new Error('Category not found');
  const items = await fetchFeaturedItems();
  return { ...category, items };
};

// === Export global ===
export default {
  fetchCategories,
  fetchFeaturedItems,
  fetchRestaurants,
  fetchRestaurantDetails,
  fetchItemDetails,
  searchRestaurantsAndItems,
  fetchCategoryDetails
};
