// services/restaurantService.ts
import { callOdoo } from "./api";

/**
 * Récupère toutes les tables de restaurant
 */
export const fetchTables = async () => {
  return await callOdoo("restaurant.table", "search_read", [[]], {
    fields: ["id", "name", "floor_id", "active"],
  });
};

/**
 * Récupère toutes les commandes d'une table donnée
 */
export const fetchOrdersByTable = async (tableId: number) => {
  return await callOdoo(
    "pos.order",
    "search_read",
    [[["table_id", "=", tableId]]],
    {
      fields: [
        "id",
        "name",
        "partner_id",
        "amount_total",
        "date_order",
        "state",
      ],
    }
  );
};

/**
 * Crée une commande pour une table donnée
 */
export const createOrderForTable = async (
  tableId: number,
  partnerId: number,
  orderLines: Array<{ product_id: number; qty: number; price_unit: number }>
) => {
  const orderData = {
    table_id: tableId,
    partner_id: partnerId,
    lines: orderLines.map((line) => [
      0,
      0,
      {
        product_id: line.product_id,
        qty: line.qty,
        price_unit: line.price_unit,
      },
    ]),
    state: "draft",
  };
  return await callOdoo("pos.order", "create", [orderData]);
};

/**
 * Met à jour l'état d'une commande (ex: paid, done, cancelled)
 */
export const updateOrderState = async (orderId: number, newState: string) => {
  return await callOdoo("pos.order", "write", [[orderId], { state: newState }]);
};
