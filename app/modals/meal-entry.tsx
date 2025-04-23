"use client"

import React, { useState, useEffect } from "react"
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Dimensions, Platform, SafeAreaView } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { ThemedText } from "@/components/common/ThemedText"
import DateTimePicker from "@react-native-community/datetimepicker"
import { SearchBar } from "@/components/ui/forms/SearchBar"
import { QuantityInput } from "@/components/ui/forms/QuantityInput"
import { NutritionInput } from "@/components/ui/forms/NutritionInput"
import { ActionButton } from "@/components/ui/buttons/ActionButton"
import type { Food } from "@/types/food"
import { loadFoods } from "@/utils/foodStorage"
import { useLocalSearchParams, useRouter } from "expo-router"

// Interfacce definite come prima
interface DishItem {
  id: string
  name: string
  quantity: string
  unit: string
  isCustom: boolean
  nutrition?: {
    calories?: string
    proteins?: string
    carbs?: string
    fats?: string
  }
}

export interface MealData {
  dishes: DishItem[]
  datetime: Date
}

interface SuggestedMeal {
  id: string
  name: string
  icon: string
  color: string
  score: number
}

// Suggested meals data (come prima)
const SUGGESTED_MEALS: SuggestedMeal[] = [
  { id: "1", name: "Pasta", icon: "restaurant", color: "#FF9800", score: 70 },
  { id: "2", name: "Insalata", icon: "eco", color: "#4CAF50", score: 90 },
  { id: "3", name: "Pollo", icon: "set-meal", color: "#F44336", score: 85 },
  { id: "4", name: "Yogurt", icon: "breakfast-dining", color: "#2196F3", score: 80 },
  { id: "5", name: "Frutta", icon: "nutrition", color: "#9C27B0", score: 95 },
  { id: "6", name: "Riso", icon: "rice-bowl", color: "#FF5722", score: 75 },
]

export default function MealEntryModalScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ mealType?: string }>()
  const mealType = params.mealType || "Pasto" // Default se non passato

  const [dishes, setDishes] = useState<DishItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [availableFoods, setAvailableFoods] = useState<Food[]>([])

  const scrollViewRef = React.useRef<ScrollView>(null)

  useEffect(() => {
    const fetchFoods = async () => {
      const result = await loadFoods()
      if (result.success) {
        setAvailableFoods(result.foods || [])
      } else {
        console.error("Error loading foods:", result.error)
      }
    }
    fetchFoods()
  }, []) // Carica i cibi solo una volta all'apertura

  const handleAddDish = (item?: Food) => {
    const newDish: DishItem = {
      id: Date.now().toString(),
      name: item?.name || "",
      quantity: "",
      unit: item?.defaultUnit || "g",
      isCustom: !item,
      nutrition: {
        calories: "",
        proteins: "",
        carbs: "",
        fats: "",
      },
    }
    setDishes([newDish, ...dishes])
    setShowQuickAdd(false)
    setSearchQuery("")

    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true })
    }, 100)
  }

  const handleUpdateDish = (id: string, field: keyof DishItem, value: string) => {
    setDishes(dishes.map((dish) => (dish.id === id ? { ...dish, [field]: value } : dish)))
  }

  const handleUpdateNutrition = (id: string, field: keyof NonNullable<DishItem["nutrition"]>, value: string) => {
    setDishes(
      dishes.map((dish) => {
        if (dish.id === id && dish.nutrition) {
          return {
            ...dish,
            nutrition: {
              ...dish.nutrition,
              [field]: value,
            },
          }
        }
        return dish
      }),
    )
  }

  const handleRemoveDish = (id: string) => {
    setDishes(dishes.filter((dish) => dish.id !== id))
  }

  const handleConfirmCustomDish = (id: string) => {
    setDishes(
      dishes.map((dish) => {
        if (dish.id === id) {
          return {
            ...dish,
            isCustom: false,
          }
        }
        return dish
      }),
    )
  }

  const handleSave = () => {
    const mealData: MealData = {
      dishes,
      datetime: selectedDate,
    }
    console.log("Salvataggio pasto (da router modal):", { type: mealType, ...mealData })
    // Qui andrebbe la logica effettiva di salvataggio o passaggio dati
    router.back() // Chiude il modale
  }

  const filteredItems = availableFoods.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const renderDishItem = (dish: DishItem) => (
    <View key={dish.id} style={styles.dishItem}>
      <View style={styles.dishNameContainer}>
        <TextInput
          style={styles.dishNameInput}
          value={dish.name}
          onChangeText={(text) => handleUpdateDish(dish.id, "name", text)}
          placeholder="Nome piatto"
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={() => handleRemoveDish(dish.id)} style={styles.removeButton}>
          <MaterialIcons name="close" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <QuantityInput
        quantity={dish.quantity}
        unit={dish.unit}
        onQuantityChange={(text) => handleUpdateDish(dish.id, "quantity", text)}
        onUnitChange={(text) => handleUpdateDish(dish.id, "unit", text)}
      />

      {dish.isCustom && (
        <>
          <NutritionInput
            calories={dish.nutrition?.calories || ""}
            proteins={dish.nutrition?.proteins || ""}
            carbs={dish.nutrition?.carbs || ""}
            fats={dish.nutrition?.fats || ""}
            onCaloriesChange={(text) => handleUpdateNutrition(dish.id, "calories", text)}
            onProteinsChange={(text) => handleUpdateNutrition(dish.id, "proteins", text)}
            onCarbsChange={(text) => handleUpdateNutrition(dish.id, "carbs", text)}
            onFatsChange={(text) => handleUpdateNutrition(dish.id, "fats", text)}
          />
          <ActionButton
            onPress={() => handleConfirmCustomDish(dish.id)}
            label="Conferma valori"
            icon="check-circle"
            variant="success"
            style={styles.confirmButton}
          />
        </>
      )}
    </View>
  )

  return (
    // Usiamo SafeAreaView per evitare sovrapposizioni con notch/barra stato
    <SafeAreaView style={styles.safeArea}>
      {/* Applichiamo lo stile del contenitore modale qui */}
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <MaterialIcons name={getMealTypeIcon(mealType)} size={24} color="#4CAF50" />
            <ThemedText style={styles.title}>{getMealTypeLabel(mealType)}</ThemedText>
          </View>
          {/* Bottone chiusura ora usa router.back() */}
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Search bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <SearchBar
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text)
                  setShowQuickAdd(true)
                }}
                placeholder="Cerca un alimento..."
                onClear={() => setSearchQuery("")}
              />
              <TouchableOpacity style={styles.addCustomButton} onPress={() => handleAddDish()}>
                <MaterialIcons name="add" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>

            {/* Search suggestions */}
            {showQuickAdd && searchQuery.length > 0 && (
              <View style={styles.quickAddContainer}>
                {filteredItems.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.quickAddItem} onPress={() => handleAddDish(item)}>
                    <MaterialIcons name="add-circle-outline" size={20} color="#4CAF50" />
                    <ThemedText style={styles.quickAddText}>{item.name}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Suggested meals */}
          <View style={styles.suggestedSection}>
            <ThemedText style={styles.suggestedTitle}>Suggeriti</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestedScrollContent}
            >
              {SUGGESTED_MEALS.map((meal) => (
                <TouchableOpacity
                  key={meal.id}
                  style={styles.suggestedCard}
                  onPress={() =>
                    handleAddDish({
                      id: meal.id,
                      name: meal.name,
                      defaultUnit: "g",
                      score: meal.score,
                    })
                  }
                >
                  <View style={[styles.suggestedIconContainer, { backgroundColor: meal.color }]}>
                    <MaterialIcons name={meal.icon as keyof typeof MaterialIcons.glyphMap} size={24} color="#fff" />
                  </View>
                  <ThemedText style={styles.suggestedText}>{meal.name}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Dish list */}
          <ScrollView ref={scrollViewRef} style={styles.dishList}>
            {dishes.map(renderDishItem)}
          </ScrollView>

          {/* Empty state */}
          {dishes.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="restaurant" size={48} color="#ddd" />
              <ThemedText style={styles.emptyStateTitle}>Aggiungi i tuoi piatti</ThemedText>
              <ThemedText style={styles.emptyStateText}>
                Cerca tra gli alimenti disponibili o aggiungi un piatto personalizzato
              </ThemedText>
            </View>
          )}

          {/* Date/time selection */}
          <View style={styles.dateTimeSection}>
            <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
              <MaterialIcons name="calendar-today" size={18} color="#666" />
              <ThemedText style={styles.dateTimeText}>
                {selectedDate.toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "short",
                })}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowTimePicker(true)}>
              <MaterialIcons name="access-time" size={18} color="#666" />
              <ThemedText style={styles.dateTimeText}>
                {selectedDate.toLocaleTimeString("it-IT", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Date/time pickers */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false)
                if (date) {
                  const newDate = new Date(date)
                  newDate.setHours(selectedDate.getHours())
                  newDate.setMinutes(selectedDate.getMinutes())
                  setSelectedDate(newDate)
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, date) => {
                setShowTimePicker(false)
                if (date) {
                  setSelectedDate(date)
                }
              }}
            />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ActionButton
            onPress={handleSave} // handleSave ora usa router.back()
            label={
              dishes.length > 0
                ? `Salva ${getMealTypeLabel(mealType).toLowerCase()} (${dishes.length})`
                : `Salva ${getMealTypeLabel(mealType).toLowerCase()}`
            }
            icon="check"
            variant="primary"
            style={styles.saveButton}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const { width, height } = Dimensions.get("window")

// Stili copiati da MealEntryModal.tsx, con piccole modifiche
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent", // Sfondo trasparente gestito da Expo Router
  },
  modalContainer: {
    flex: 1, // Occupa tutto lo spazio disponibile nella route modale
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    // Rimuoviamo position: 'absolute' e bottom: 0
    paddingTop: 6,
    marginTop: height * 0.05, // Simula il posizionamento originale
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f1f1f",
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  searchSection: {
    padding: 12,
    paddingBottom: 0,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  addCustomButton: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  quickAddContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    maxHeight: height * 0.3,
  },
  quickAddItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  quickAddText: {
    fontSize: 16,
    color: "#1f1f1f",
  },
  suggestedSection: {
    paddingTop: 0,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  suggestedTitle: {
    display: "none",
  },
  suggestedScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 6,
  },
  suggestedCard: {
    width: 56,
    alignItems: "center",
    marginHorizontal: 3,
  },
  suggestedIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  suggestedText: {
    fontSize: 10,
    color: "#1f1f1f",
    textAlign: "center",
  },
  dishList: {
    flex: 1,
    padding: 12,
    paddingBottom: 80, // Spazio per evitare sovrapposizione con footer
  },
  dishItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 1,
  },
  dishNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  dishNameInput: {
    flex: 1,
    fontSize: 15,
    color: "#1f1f1f",
    fontWeight: "500",
  },
  removeButton: {
    padding: 2,
  },
  confirmButton: {
    marginTop: 12,
  },
  emptyState: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    zIndex: -1,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    maxWidth: "80%",
  },
  dateTimeSection: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dateTimeText: {
    fontSize: 13,
    color: "#1f1f1f",
    flex: 1,
  },
  footer: {
    padding: 12,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 4,
  },
  saveButton: {
    minHeight: 44,
  },
})

// Helper functions (copiate)
const getMealTypeIcon = (type: string): keyof typeof MaterialIcons.glyphMap => {
  switch (type) {
    case "breakfast":
      return "free-breakfast"
    case "lunch":
      return "restaurant"
    case "dinner":
      return "dinner-dining"
    case "snack":
      return "icecream"
    default:
      return "restaurant"
  }
}

const getMealTypeLabel = (type: string) => {
  switch (type) {
    case "breakfast":
      return "Colazione"
    case "lunch":
      return "Pranzo"
    case "dinner":
      return "Cena"
    case "snack":
      return "Spuntino"
    default:
      return "Pasto"
  }
}