// services/cartService.ts
import { callOdoo } from "./api";

// 🔹 Ajouter un produit au panier (ligne POS)
export const addToCart = async (orderId: number, productId: number, quantity: number, price: number) => {
  const lineData = {
    order_id: orderId,
    product_id: productId,
    qty: quantity,
    price_unit: price,
  };

  try {
    const result = await callOdoo("pos.order.line", "create", [lineData]);
    console.log("Ligne de commande ajoutée:", result);
    return result;
  } catch (err) {
    console.error("Erreur ajout panier:", err);
    throw err;
  }
};

// 🔹 Supprimer une ligne du panier
export const removeFromCart = async (lineId: number) => {
  return await callOdoo("pos.order.line", "unlink", [[lineId]]);
};

// 🔹 Mettre à jour la quantité d’un produit
export const updateCartItem = async (lineId: number, qty: number) => {
  return await callOdoo("pos.order.line", "write", [[lineId], { qty }]);
};
