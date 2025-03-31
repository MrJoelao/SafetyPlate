"use client"

import { useEffect, useState } from "react"
import { Modal, StyleSheet, View, TouchableOpacity, FlatList, TextInput, Alert, Dimensions } from "react-native"
import { ThemedText } from "@/components/common/ThemedText"
import { MaterialIcons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import type { Food } from "@/types/food"
import { loadFoods, deleteFood, addFood, updateFood } from "@/utils/foodStorage"
import { AddEditFoodModal } from "@/components/ui/modals/AddEditFoodModal"

interface FoodManagerViewProps {
  visible: boolean
  onClose: () => void
}

export function FoodManagerView({ visible, onClose }: FoodManagerViewProps) {
  const [foods, setFoods] = useState<Food[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFood, setSelectedFood] = useState<Food | undefined>()
  const [isAddEditModalVisible, setIsAddEditModalVisible] = useState(false)

  useEffect(() => {
    if (visible) {
      loadFoodData()
    }
  }, [visible])

  const loadFoodData = async () => {
    setIsLoading(true)
    const result = await loadFoods()
    if (result.success) {
      setFoods(result.foods || [])
    } else {
      Alert.alert("Errore", result.error || "Errore nel caricamento degli alimenti")
    }
    setIsLoading(false)
  }

  const filteredFoods = foods
    .filter((food) => food.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  const handleDelete = async (foodId: string) => {
    Alert.alert("Conferma", "Sei sicuro di voler eliminare questo alimento?", [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: async () => {
          const result = await deleteFood(foodId)
          if (result.success) {
            loadFoodData()
          } else {
            Alert.alert("Errore", result.error || "Errore durante l'eliminazione")
          }
        },
      },
    ])
  }

  const handleAddEdit = async (food: Food) => {
    const result = await (food.id === selectedFood?.id ? updateFood(food) : addFood(food))
    if (result.success) {
      loadFoodData()
    } else {
      Alert.alert("Errore", result.error || "Errore durante il salvataggio")
    }
  }

  const handleEdit = (food: Food) => {
    setSelectedFood(food)
    setIsAddEditModalVisible(true)
  }

  const handleAdd = () => {
    setSelectedFood(undefined)
    setIsAddEditModalVisible(true)
  }

  const renderFoodItem = ({ item }: { item: Food }) => (
    <View style={styles.foodItem}>
      <View style={styles.foodInfo}>
        <ThemedText style={styles.foodName}>{item.name}</ThemedText>
        <ThemedText style={styles.foodDetails}>
          Score: {item.score} • Unità: {item.defaultUnit}
        </ThemedText>
        {item.nutritionPer100g && (
          <ThemedText style={styles.nutritionInfo}>
            {item.nutritionPer100g.calories ? `${item.nutritionPer100g.calories} kcal • ` : ""}
            {item.nutritionPer100g.proteins ? `P: ${item.nutritionPer100g.proteins}g • ` : ""}
            {item.nutritionPer100g.carbs ? `C: ${item.nutritionPer100g.carbs}g • ` : ""}
            {item.nutritionPer100g.fats ? `G: ${item.nutritionPer100g.fats}g` : ""}
          </ThemedText>
        )}
      </View>
      <View style={styles.foodActions}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEdit(item)}>
          <MaterialIcons name="edit" size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item.id)}>
          <MaterialIcons name="delete" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <BlurView intensity={20} style={styles.backdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <MaterialIcons name="restaurant-menu" size={24} color="#4CAF50" />
              <ThemedText style={styles.title}>Gestione Alimenti</ThemedText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={24} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cerca alimenti..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>

          {/* Food List */}
          <FlatList
            data={filteredFoods}
            renderItem={renderFoodItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialIcons name="no-meals" size={48} color="#ccc" />
                <ThemedText style={styles.emptyText}>
                  {isLoading ? "Caricamento..." : "Nessun alimento trovato"}
                </ThemedText>
              </View>
            }
          />

          {/* FAB */}
          <TouchableOpacity style={styles.fab} onPress={handleAdd}>
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <AddEditFoodModal
          visible={isAddEditModalVisible}
          onClose={() => setIsAddEditModalVisible(false)}
          onSave={handleAddEdit}
          food={selectedFood}
        />
      </BlurView>
    </Modal>
  )
}

const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  modalContainer: {
    width: width,
    height: height * 0.9,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 24,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    marginTop: 12,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f1f1f",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    padding: 8,
  },
  listContent: {
    padding: 20,
  },
  foodItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  foodDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  nutritionInfo: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  foodActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  editButton: {
    backgroundColor: "#E3F2FD",
  },
  deleteButton: {
    backgroundColor: "#FFEBEE",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
  },
})

