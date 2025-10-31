// services/productService.ts
import { callOdoo } from "./api";

// ========================
// 🔍 LISTER TOUS LES PRODUITS
// ========================
export const fetchProducts = async () => {
  try {
    const result = await callOdoo("product.product", "search_read", [[]], {
      fields: ["id", "name", "list_price", "standard_price", "categ_id", "type"],
    });
    return result;
  } catch (err) {
    console.error("Erreur lors du chargement des produits:", err);
    throw err;
  }
};

// ========================
// ➕ CRÉER UN PRODUIT
// ========================
export const createProduct = async (productData: any) => {
  try {
    const result = await callOdoo("product.template", "create", [productData]);
    console.log("Produit créé:", result);
    return result;
  } catch (err) {
    console.error("Erreur lors de la création du produit:", err);
    throw err;
  }
};

// ========================
// ✏️ METTRE À JOUR UN PRODUIT
// ========================
export const updateProduct = async (productId: number, newData: any) => {
  try {
    const result = await callOdoo("product.template", "write", [[productId], newData]);
    console.log("Produit mis à jour:", result);
    return result;
  } catch (err) {
    console.error("Erreur lors de la mise à jour du produit:", err);
    throw err;
  }
};

// ========================
// ❌ SUPPRIMER UN PRODUIT
// ========================
export const deleteProduct = async (productId: number) => {
  try {
    const result = await callOdoo("product.template", "unlink", [[productId]]);
    console.log("Produit supprimé:", result);
    return result;
  } catch (err) {
    console.error("Erreur lors de la suppression du produit:", err);
    throw err;
  }
};

// ========================
// 🔍 RECHERCHER UN PRODUIT PAR NOM
// ========================
export const searchProductByName = async (name: string) => {
  try {
    const result = await callOdoo(
      "product.product",
      "search_read",
      [[["name", "ilike", name]]],
      { fields: ["id", "name", "list_price", "standard_price"] }
    );
    return result;
  } catch (err) {
    console.error("Erreur lors de la recherche du produit:", err);
    throw err;
  }
};
