import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useColorScheme,
  FlatList,
  Dimensions,
} from "react-native";

interface Category {
  id: string;
  name: string;
  image?: string | null;
}

interface CategoryListProps {
  categories: Category[];
  onSelectCategory: (id: string) => void;
}

export default function CategoryList({ categories, onSelectCategory }: CategoryListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const numColumns = Dimensions.get("window").width < 600 ? 2 : 3; // mobile / tablette / desktop

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: isDark ? "#FFF" : "#222" }]}>🍽️ Nos catégories</Text>

      <FlatList
        data={categories}
        key={numColumns}
        numColumns={numColumns}
        keyExtractor={(item) => item.id.toString()}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor: isDark ? "#2B2B2B" : "#FFF",
                shadowColor: isDark ? "#000" : "#ccc",
              },
            ]}
            onPress={() => onSelectCategory(item.id)}
          >
            <Image
              source={{
                uri:
                  item.image ||
                  "https://via.placeholder.com/300x300.png?text=No+Image",
              }}
              style={styles.image}
            />
            <Text
              style={[
                styles.name,
                { color: isDark ? "#FFF" : "#222" },
              ]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  row: {
    justifyContent: "space-around",
    marginBottom: 20,
  },
  card: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: "center",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60, // cercle propre
    resizeMode: "cover",
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
});
