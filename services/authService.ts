// services/authService.ts
import { callOdoo } from "./api";

const DB_NAME = "odoo_db_thiop";
const USER_ID = 2; // ID de l'utilisateur admin

// Vérifie la clé API (facultatif)
export const verifyApiKey = async () => {
  try {
    const result = await callOdoo("res.users", "search_read", [[["id", "=", USER_ID]]], {
      fields: ["id", "name", "login"],
    });
    return result?.[0] || null;
  } catch (err) {
    console.error("Erreur de vérification API:", err);
    return null;
  }
};

// Récupère les infos de l'utilisateur actuel
export const getCurrentUser = async () => {
  return await callOdoo("res.users", "read", [[USER_ID]], {
    fields: ["id", "name", "login", "email"],
  });
};
