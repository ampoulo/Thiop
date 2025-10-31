declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
      EXPO_PUBLIC_ODOO_URL: string;
      EXPO_PUBLIC_ODOO_DB: string;
      EXPO_PUBLIC_ODOO_USER_ID: string;
      EXPO_PUBLIC_ODOO_API_KEY: string;
    }
  }
}

export {};