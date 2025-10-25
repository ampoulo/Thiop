import axios from 'axios';
import {OdooResultProducts} from '@/types/odooResultProducts';

// Configuration for Odoo API connection
const ODOO_API_BASE_URL = 'http://localhost:8069';
const API_KEY = process.env.REACT_APP_ODOO_API_KEY; // Replace with actual API key or use environment variable

// Create axios instance with default config
const odooClient = axios.create({
  baseURL: ODOO_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  },
  timeout: 10000
});

// Error handling middleware
odooClient.interceptors.response.use(
  response => response,
  error => {
    // Log errors or handle specific error codes
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ========== Category API ==========

/**
 * Fetch all food categories from Odoo
 * @returns {Promise<Array>} List of food categories
 */
export const fetchCategories = async () => {
  try {
    // TODO: Replace with actual Odoo API call
     //const response:OdooResultProducts = await odooClient.get('/products');
     //return response.result.data;
      const response = await fetch(`${ODOO_API_BASE_URL}/api/products`, {
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${API_KEY}`,
          },
      });
      const data = await response.json();
      console.log(data);
      return data?.data;

      // Mock data for development
    return [
      {
        id: '1',
        name: 'Pizza',
        image: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        id: '2',
        name: 'Burgers',
        image: 'https://images.pexels.com/photos/1639565/pexels-photo-1639565.jpeg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        id: '3',
        name: 'Sushi',
        image: 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        id: '4',
        name: 'Pasta',
        image: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        id: '5',
        name: 'Salads',
        image: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        id: '6',
        name: 'Desserts',
        image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=300'
      }
    ];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
};

// ========== Featured Items API ==========

/**
 * Fetch featured food items from Odoo
 * @returns {Promise<Array>} List of featured food items
 */
export const fetchFeaturedItems = async () => {
  try {
    // TODO: Replace with actual Odoo API call
    // const response = await odooClient.get('/food.item', {
    //   params: { featured: true, limit: 10 }
    // });
    // return response.data;
    
    // Mock data for development
    return [
      {
        id: '101',
        name: 'Margherita Pizza',
        restaurant: 'Pizza Palace',
        image: 'https://images.pexels.com/photos/2714722/pexels-photo-2714722.jpeg?auto=compress&cs=tinysrgb&w=300',
        price: 12.99,
        rating: 4.7
      },
      {
        id: '102',
        name: 'Classic Burger',
        restaurant: 'Burger Joint',
        image: 'https://images.pexels.com/photos/1251198/pexels-photo-1251198.jpeg?auto=compress&cs=tinysrgb&w=300',
        price: 10.49,
        rating: 4.5
      },
      {
        id: '103',
        name: 'California Roll',
        restaurant: 'Sushi Express',
        image: 'https://images.pexels.com/photos/2323398/pexels-photo-2323398.jpeg?auto=compress&cs=tinysrgb&w=300',
        price: 14.99,
        rating: 4.8
      },
      {
        id: '104',
        name: 'Fettuccine Alfredo',
        restaurant: 'Pasta House',
        image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=300',
        price: 13.99,
        rating: 4.6
      },
      {
        id: '105',
        name: 'Caesar Salad',
        restaurant: 'Fresh Greens',
        image: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg?auto=compress&cs=tinysrgb&w=300',
        price: 9.99,
        rating: 4.4
      }
    ];
  } catch (error) {
    console.error('Failed to fetch featured items:', error);
    throw error;
  }
};

// ========== Restaurant API ==========

/**
 * Fetch restaurants from Odoo
 * @param {Object} params - Query parameters for filtering restaurants
 * @returns {Promise<Array>} List of restaurants
 */
export const fetchRestaurants = async (params = {}) => {
  try {
    // TODO: Replace with actual Odoo API call
    // const response = await odooClient.get('/restaurant', { params });
    // return response.data;
    
    // Mock data for development
    return [
      {
        id: '201',
        name: 'Pizza Palace',
        image: 'https://images.pexels.com/photos/905847/pexels-photo-905847.jpeg?auto=compress&cs=tinysrgb&w=300',
        cuisine: 'Italian',
        rating: 4.7,
        deliveryTime: '25-35 min',
        deliveryFee: 2.99,
        distance: 1.2
      },
      {
        id: '202',
        name: 'Burger Joint',
        image: 'https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg?auto=compress&cs=tinysrgb&w=300',
        cuisine: 'American',
        rating: 4.5,
        deliveryTime: '15-25 min',
        deliveryFee: 1.99,
        distance: 0.8
      },
      {
        id: '203',
        name: 'Sushi Express',
        image: 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=300',
        cuisine: 'Japanese',
        rating: 4.8,
        deliveryTime: '30-40 min',
        deliveryFee: 3.99,
        distance: 2.1
      },
      {
        id: '204',
        name: 'Pasta House',
        image: 'https://images.pexels.com/photos/1527603/pexels-photo-1527603.jpeg?auto=compress&cs=tinysrgb&w=300',
        cuisine: 'Italian',
        rating: 4.6,
        deliveryTime: '25-35 min',
        deliveryFee: 2.49,
        distance: 1.7
      }
    ];
  } catch (error) {
    console.error('Failed to fetch restaurants:', error);
    throw error;
  }
};

// ========== Restaurant Details API ==========

/**
 * Fetch details for a specific restaurant from Odoo
 * @param {string} id - Restaurant ID
 * @returns {Promise<Object>} Restaurant details
 */
export const fetchRestaurantDetails = async (id) => {
  try {
    // TODO: Replace with actual Odoo API call
    // const response = await odooClient.get(`/restaurant/${id}`);
    // return response.data;
    
    // Mock data for development
    const restaurants = await fetchRestaurants();
    const restaurant = restaurants.find(r => r.id === id);
    
    if (!restaurant) {
      throw new Error(`Restaurant with ID ${id} not found`);
    }
    
    // Add additional details not included in the list view
    return {
      ...restaurant,
      description: 'A fantastic restaurant serving delicious food.',
      address: '123 Main St, City, Country',
      openingHours: '10:00 AM - 10:00 PM',
      phoneNumber: '+1 123-456-7890',
      categories: ['Pizza', 'Pasta', 'Salads'],
      menu: [
        {
          id: '301',
          name: 'Appetizers',
          items: [
            {
              id: '401',
              name: 'Garlic Bread',
              description: 'Freshly baked bread with garlic butter',
              price: 5.99,
              image: 'https://images.pexels.com/photos/1070053/pexels-photo-1070053.jpeg?auto=compress&cs=tinysrgb&w=300'
            },
            {
              id: '402',
              name: 'Mozzarella Sticks',
              description: 'Breaded mozzarella with marinara sauce',
              price: 7.99,
              image: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=300'
            }
          ]
        },
        {
          id: '302',
          name: 'Main Courses',
          items: [
            {
              id: '403',
              name: 'Margherita Pizza',
              description: 'Classic pizza with tomato, mozzarella, and basil',
              price: 12.99,
              image: 'https://images.pexels.com/photos/2714722/pexels-photo-2714722.jpeg?auto=compress&cs=tinysrgb&w=300'
            },
            {
              id: '404',
              name: 'Pepperoni Pizza',
              description: 'Pizza with tomato sauce, mozzarella, and pepperoni',
              price: 14.99,
              image: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=300'
            }
          ]
        }
      ]
    };
  } catch (error) {
    console.error(`Failed to fetch restaurant details for ID ${id}:`, error);
    throw error;
  }
};

// ========== Item Details API ==========

/**
 * Fetch details for a specific food item from Odoo
 * @param {string} id - Item ID
 * @returns {Promise<Object>} Item details
 */
export const fetchItemDetails = async (id) => {
  try {
    // TODO: Replace with actual Odoo API call
    // const response = await odooClient.get(`/food.item/${id}`);
    // return response.data;
    
    // Mock data for development
    // First check in featured items
    const featuredItems = await fetchFeaturedItems();
    const item = featuredItems.find(i => i.id === id);
    
    if (!item) {
      throw new Error(`Item with ID ${id} not found`);
    }
    
    // Add additional details not included in the list view
    return {
      ...item,
      description: 'A delicious dish made with the finest ingredients.',
      ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
      allergens: ['Gluten', 'Dairy'],
      nutritionalInfo: {
        calories: 450,
        protein: 20,
        carbs: 35,
        fat: 25
      },
      options: [
        {
          id: '501',
          name: 'Size',
          required: true,
          multiple: false,
          items: [
            { id: '601', name: 'Small', price: 0 },
            { id: '602', name: 'Medium', price: 2 },
            { id: '603', name: 'Large', price: 4 }
          ]
        },
        {
          id: '502',
          name: 'Toppings',
          required: false,
          multiple: true,
          items: [
            { id: '604', name: 'Extra Cheese', price: 1.5 },
            { id: '605', name: 'Mushrooms', price: 1 },
            { id: '606', name: 'Pepperoni', price: 1.5 }
          ]
        }
      ]
    };
  } catch (error) {
    console.error(`Failed to fetch item details for ID ${id}:`, error);
    throw error;
  }
};

// ========== Search API ==========

/**
 * Search for restaurants and food items in Odoo
 * @param {string} query - Search query
 * @param {Object} filters - Filters to apply to the search
 * @returns {Promise<Array>} List of search results
 */
export const searchRestaurantsAndItems = async (query, filters = {}) => {
  try {
    // TODO: Replace with actual Odoo API call
    // const response = await odooClient.get('/search', { 
    //   params: { q: query, ...filters }
    // });
    // return response.data;
    
    // Mock data for development
    // Simple search simulation
    if (!query || query.length < 2) {
      return [];
    }
    
    const lowerQuery = query.toLowerCase();
    
    // Get restaurants and items data
    const restaurants = await fetchRestaurants();
    const featuredItems = await fetchFeaturedItems();
    
    // Filter restaurants
    const matchingRestaurants = restaurants
      .filter(restaurant => {
        // Apply cuisine filter if present
        if (filters.cuisine && filters.cuisine.length > 0 && 
            !filters.cuisine.some(c => restaurant.cuisine.includes(c))) {
          return false;
        }
        
        // Apply price range filter if present (simplified)
        if (filters.priceRange && filters.priceRange.length > 0) {
          const priceLevel = restaurant.deliveryFee < 2 ? '$' : 
                             restaurant.deliveryFee < 3 ? '$$' : '$$$';
          if (!filters.priceRange.includes(priceLevel)) {
            return false;
          }
        }
        
        return restaurant.name.toLowerCase().includes(lowerQuery) || 
               restaurant.cuisine.toLowerCase().includes(lowerQuery);
      })
      .map(restaurant => ({
        ...restaurant,
        type: 'restaurant'
      }));
    
    // Filter items
    const matchingItems = featuredItems
      .filter(item => {
        // Apply dietary filter if present (simplified)
        if (filters.dietary && filters.dietary.length > 0) {
          // In real app, would check if item has dietary properties
          return false;
        }
        
        return item.name.toLowerCase().includes(lowerQuery);
      })
      .map(item => ({
        ...item,
        type: 'dish'
      }));
    
    // Combine and return results
    return [...matchingRestaurants, ...matchingItems];
  } catch (error) {
    console.error('Failed to search restaurants and items:', error);
    throw error;
  }
};

// ========== Category Details API ==========

/**
 * Fetch items for a specific category from Odoo
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object>} Category details with items
 */
export const fetchCategoryDetails = async (categoryId) => {
  try {
    // TODO: Replace with actual Odoo API call
    // const response = await odooClient.get(`/food.category/${categoryId}`);
    // return response.data;
    
    // Mock data for development
    const categories = await fetchCategories();
    const category = categories.find(c => c.id === categoryId);
    
    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }
    
    // Generate items for this category
    const items = Array(8).fill(0).map((_, index) => ({
      id: `${categoryId}${index + 1}`,
      name: `${category.name} Item ${index + 1}`,
      restaurant: `Restaurant ${index % 4 + 1}`,
      image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=300',
      price: 9.99 + index,
      rating: 4 + (index % 10) / 10
    }));
    
    return {
      ...category,
      items
    };
  } catch (error) {
    console.error(`Failed to fetch category details for ID ${categoryId}:`, error);
    throw error;
  }
};

export default {
  fetchCategories,
  fetchFeaturedItems,
  fetchRestaurants,
  fetchRestaurantDetails,
  fetchItemDetails,
  searchRestaurantsAndItems,
  fetchCategoryDetails
};