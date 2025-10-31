// app/testOdoo.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { fetchProducts } from "../services/productService";
import Constants from "expo-constants";

export default function TestOdoo() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("🔄 Connexion à Odoo...");
        const data = await fetchProducts();
        console.log("✅ Produits reçus :", data);
        setProducts(data);
      } catch (err: any) {
        console.error("❌ Erreur Odoo:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Chargement depuis Odoo...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Erreur : {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📦 Produits Odoo ({products.length})</Text>
      {products.map((p) => (
        <View key={p.id} style={styles.card}>
          <Text style={styles.name}>{p.name}</Text>
          <Text style={styles.price}>💰 Prix : {p.list_price} €</Text>
        </View>
      ))}
      <Text style={styles.env}>
        ENV : {Constants?.expoConfig?.name || "Expo App"}  
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  price: {
    color: "#007AFF",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  error: {
    color: "red",
    fontWeight: "600",
  },
  env: {
    marginTop: 20,
    fontSize: 12,
    color: "#777",
  },
});
