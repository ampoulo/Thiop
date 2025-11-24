import axios from 'axios';

// === CONFIGURATION DE L'API ODOO ===
const ODOO_API_BASE_URL = 'http://localhost:8069'; // ton serveur Odoo

// === CLIENT AXIOS CONFIGURÉ ===
const odooClient = axios.create({
  baseURL: ODOO_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

import AsyncStorage from '@react-native-async-storage/async-storage';

// Variable locale pour stocker l'ID en mémoire (plus fiable/rapide que AsyncStorage)
let currentCompanyId: string | null = null;

export const setApiCompanyId = (id: string | null) => {
  currentCompanyId = id;
  console.log(`[API] Company ID set to: ${id}`);
};

// === Gestion des erreurs ===
odooClient.interceptors.request.use(
  async (config) => {
    try {
      // On utilise la variable mémoire en priorité, sinon AsyncStorage
      let companyId = currentCompanyId;
      if (!companyId) {
        companyId = await AsyncStorage.getItem('COMPANY_ID');
      }

      console.log(`[API] Request to ${config.url} - Injecting company_id: ${companyId}`);
      if (companyId) {
        config.params = { ...config.params, company_id: companyId };
      }
    } catch (error) {
      console.error("Error injecting company_id", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
        image: category.image || null,
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
// 🚀  API ODOO : RECHERCHE
// ============================
//
export const searchProducts = async (query: string) => {
  try {
    const response = await odooClient.get('/api/products', {
      params: { search: query }
    });
    const data = response.data;

    if (data.status === 200 && data.data) {
      return data.data.map((product: any) => ({
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
    console.error('❌ Erreur searchProducts:', error);
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
        // 🔹 On ajoute ces deux lignes :
        attributes: product.attributes || [],
        extras: product.extras || [],
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
// 🍽️  RESTAURANTS (COMPANIES)
// ============================
//
export const fetchCompanies = async () => {
  try {
    const response = await odooClient.get('/api/companies');
    const data = response.data;

    if (data.status === 200 && data.data) {
      return data.data.map((company: any) => ({
        id: company.id.toString(),
        name: company.name,
        logo: company.logo || null,
        email: company.email,
        phone: company.phone
      }));
    }
    return [];
  } catch (error) {
    console.error('❌ Erreur fetchCompanies:', error);
    return [];
  }
};

// Garder pour compatibilité temporaire si utilisé ailleurs, sinon à supprimer
export const fetchRestaurants = fetchCompanies;

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
export const fetchCategoryById = async (categoryId: string) => {
  try {
    const response = await odooClient.get(`/api/categories/${categoryId}`);
    const data = response.data;

    if (data.status === 200 && data.data) {
      return data.data; // ✅ on renvoie directement la catégorie
    } else {
      console.warn("⚠️ fetchCategoryById: mauvaise réponse API", data);
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur fetchCategoryById:', error);
    return null;
  }
};






export default {
  fetchCategories,
  fetchFeaturedItems,
  fetchItemDetails,
  fetchCompanies,
  fetchRestaurants,
  fetchProductsByCategory,
  fetchCategoryById,
  searchProducts
};

// === COMMANDES ===
export const createOrder = async (cart: any, type: 'eat_in' | 'take_out') => {
  try {
    // Préparation des lignes de commande
    const lines = cart.items.map((item: any) => ({
      product_id: item.id,
      qty: item.quantity,
      price_unit: item.total_price, // Prix unitaire (avec suppléments déjà calculés dans le cart)
      attributes: item.selectedAttributes?.flatMap((attr: any) =>
        attr.values.map((v: any) => ({ name: attr.name, value: v.name }))
      ) || []
    }));

    const response = await odooClient.post('/api/orders', {
      type,
      lines
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data.data; // { id: 123, name: "S0001" }
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// === AUTHENTIFICATION ===
export const login = async (login, password) => {
  try {
    const response = await odooClient.post('/api/login', { login, password });
    return response.data.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};
