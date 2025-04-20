import { useEffect, useState } from "react"
import { Modal, StyleSheet, View, TouchableOpacity, FlatList, Alert, Dimensions } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { ThemedText } from "@/components/common/ThemedText"
import { BlurView } from "expo-blur"
import type { Food } from "@/types/food"
import { loadFoods, deleteFood, addFood, updateFood } from "@/utils/foodStorage"
import { AddEditFoodModal } from "@/components/ui/modals/AddEditFoodModal"
import { ModalHeader } from "@/components/ui/common/ModalHeader"
import { SearchBar } from "@/components/ui/forms/SearchBar"
import { FoodListItem } from "@/components/ui/food/FoodListItem"
import { green } from "react-native-reanimated/lib/typescript/Colors"

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
    <FoodListItem food={item} onEdit={handleEdit} onDelete={handleDelete} />
  )

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <BlurView intensity={20} style={styles.backdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHandle} />

          <ModalHeader
            title="Gestione Alimenti"
            onClose={onClose}
            icon={{
              name: "restaurant-menu",
              color: "#4CAF50",
            }}
          />

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Cerca alimenti..."
              onClear={() => setSearchQuery("")}
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
    backgroundColor: "#f5f5f5",
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listContent: {
    padding: 16,
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
})
