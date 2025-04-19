"use client"

import { useRef, useEffect, useState } from "react"
import { View, StyleSheet, TouchableOpacity, FlatList, Alert, KeyboardAvoidingView, Platform } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import type { Food } from "@/types/food"
import { loadFoods, deleteFood, addFood, updateFood } from "@/utils/foodStorage"
import { SearchBar } from "@/components/ui/forms/SearchBar"
import { ThemedText } from "@/components/common/ThemedText"
import { FoodListItem } from "@/components/ui/food/FoodListItem"
import { InlineFoodEditor } from "@/components/ui/food/InlineFoodEditor"
import { useFoodForm } from "@/hooks/useFoodForm"
import { useSlideAnimation } from "@/hooks/useSlideAnimation"

interface InlineFoodManagerProps {
  onEditStart?: () => void
  onEditEnd?: () => void
}

export function InlineFoodManager({ onEditStart, onEditEnd }: InlineFoodManagerProps) {
  const [viewMode, setViewMode] = useState<"list" | "edit">("list")
  const [foods, setFoods] = useState<Food[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [editingFood, setEditingFood] = useState<Food | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { slideAnim, slideLeft, slideRight } = useSlideAnimation()
  const {
    name,
    score,
    defaultUnit,
    calories,
    proteins,
    carbs,
    fats,
    imageUri,
    setName,
    setScore,
    setDefaultUnit,
    setCalories,
    setProteins,
    setCarbs,
    setFats,
    setImageUri,
    resetForm,
    validateForm,
    getFormData,
  } = useFoodForm(editingFood)

  useEffect(() => {
    loadFoodData()
  }, [])

  const loadFoodData = async () => {
    setIsLoading(true)
    const result = await loadFoods()
    if (result.success) {
      setFoods(result.foods || [])
    } else {
      Alert.alert("Error", result.error || "Error loading foods")
    }
    setIsLoading(false)
  }

  const handleAdd = () => {
    if (isSubmitting) return

    setEditingFood(undefined)
    resetForm()

    onEditStart?.()
    slideLeft(() => setViewMode("edit"))
  }

  const handleEdit = (food: Food) => {
    if (isSubmitting) return

    setEditingFood(food)
    onEditStart?.()
    slideLeft(() => setViewMode("edit"))
  }

  const handleCancel = () => {
    if (isSubmitting) return

    slideRight(() => {
      setViewMode("list")
      onEditEnd?.()
    })
  }

  const handleSave = async () => {
    if (isSubmitting || !validateForm()) return

    try {
      setIsSubmitting(true)
      const foodData = getFormData(editingFood?.id)
      const result = await (editingFood ? updateFood(foodData) : addFood(foodData))

      if (result.success) {
        await loadFoodData()
        slideRight(() => {
          setViewMode("list")
          onEditEnd?.()
        })
      } else {
        Alert.alert("Error", result.error || "Error saving food")
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (foodId: string) => {
    Alert.alert("Confirm", "Are you sure you want to delete this food?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const result = await deleteFood(foodId)
          if (result.success) {
            loadFoodData()
          } else {
            Alert.alert("Error", result.error || "Error deleting food")
          }
        },
      },
    ])
  }

  const filteredFoods = foods
    .filter((food) => food.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  const renderFoodItem = ({ item }: { item: Food }) => (
    <FoodListItem food={item} onEdit={handleEdit} onDelete={handleDelete} compact />
  )

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {viewMode === "list" ? (
        <View style={styles.listContainer}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Cerca alimenti..."
                onClear={() => setSearchQuery("")}
              />
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={isSubmitting}>
              <MaterialIcons name="add" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Food List */}
          <FlatList
            data={filteredFoods}
            renderItem={renderFoodItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialIcons name="food-bank" size={48} color="#bbb" />
                <ThemedText style={styles.emptyText}>{isLoading ? "Loading..." : "No foods found"}</ThemedText>
              </View>
            }
          />
        </View>
      ) : (
        <InlineFoodEditor
          name={name}
          score={score}
          defaultUnit={defaultUnit}
          calories={calories}
          proteins={proteins}
          carbs={carbs}
          fats={fats}
          imageUri={imageUri}
          onNameChange={setName}
          onScoreChange={setScore}
          onUnitChange={setDefaultUnit}
          onCaloriesChange={setCalories}
          onProteinsChange={setProteins}
          onCarbsChange={setCarbs}
          onFatsChange={setFats}
          onImageSelected={setImageUri}
          slideAnim={slideAnim}
          onSave={handleSave}
          onClose={handleCancel}
          isSubmitting={isSubmitting}
          editMode={!!editingFood}
        />
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 28,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d0d0d0",
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    opacity: 0.8,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
  },
})
