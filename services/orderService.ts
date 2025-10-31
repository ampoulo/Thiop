// services/orderService.ts
import { callOdoo } from "./api";

// 🔹 Créer une commande
export const createOrder = async (orderData: any) => {
  try {
    const result = await callOdoo("pos.order", "create", [orderData]);
    console.log("Commande créée:", result);
    return result;
  } catch (err) {
    console.error("Erreur lors de la création de commande:", err);
    throw err;
  }
};

// 🔹 Lire les commandes existantes
export const fetchOrders = async () => {
  return await callOdoo("pos.order", "search_read", [[]], {
    fields: ["id", "name", "partner_id", "amount_total", "date_order", "state"],
  });
};

// 🔹 Récupérer les lignes d’une commande (order lines)
export const fetchOrderLines = async (orderId: number) => {
  return await callOdoo("pos.order.line", "search_read", [[["order_id", "=", orderId]]], {
    fields: ["product_id", "qty", "price_unit", "price_subtotal"],
  });
};
