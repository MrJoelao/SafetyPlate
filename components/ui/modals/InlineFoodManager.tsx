"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  FlatList,
  PanResponder,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native"
import { ThemedText } from "@/components/common/ThemedText"
import { MaterialIcons, Feather } from "@expo/vector-icons"
import type { Food } from "@/types/food"
import { loadFoods, deleteFood, addFood, updateFood } from "@/utils/foodStorage"
import { SearchBar } from "@/components/ui/forms/SearchBar"
import { ImagePicker } from "@/components/ui/forms/ImagePicker"

// Function to determine color based on score
const getScoreColor = (score: number) => {
  if (score <= 40) return "#F44336" // red for low scores
  if (score < 70) return "#FFC107" // yellow for medium scores
  return "#4CAF50" // green for high scores
}

interface InlineFoodManagerProps {
  onEditStart?: () => void
  onEditEnd?: () => void
}

export function InlineFoodManager({ onEditStart, onEditEnd }: InlineFoodManagerProps) {
  const isMounted = useRef(true)
  const flatListRef = useRef<FlatList>(null)
  const scrollViewRef = useRef<ScrollView>(null)

  // View mode: 'list' or 'edit'
  const [viewMode, setViewMode] = useState<"list" | "edit">("list")
  const slideAnim = useRef(new Animated.Value(0)).current
  const [isAnimating, setIsAnimating] = useState(false) // Track animation state to prevent multiple clicks

  useEffect(() => {
    loadFoodData()
    return () => {
      isMounted.current = false
    }
  }, [])

  const [foods, setFoods] = useState<Food[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [editingFood, setEditingFood] = useState<Food | undefined>()

  // Form state for editing
  const [name, setName] = useState("")
  const [score, setScore] = useState("")
  const [defaultUnit, setDefaultUnit] = useState("")
  const [calories, setCalories] = useState("")
  const [proteins, setProteins] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fats, setFats] = useState("")
  const [imageUri, setImageUri] = useState<string | undefined>("")

  // Define the SwipeableRow interface
  interface SwipeableRow {
    rowRef: React.RefObject<View>
    rowMap: Map<string, Animated.Value>
  }

  // Animation refs
  const swipeableRow = useRef<SwipeableRow>({
    rowRef: React.createRef<View>(),
    rowMap: new Map(),
  }).current

  const loadFoodData = async () => {
    setIsLoading(true)
    const result = await loadFoods()
    if (result.success) {
      setFoods(result.foods || [])
    } else {
      Alert.alert("Error", "Error loading foods")
    }
    setIsLoading(false)
  }

  const handleEdit = (food: Food) => {
    if (isAnimating) return // Prevent multiple clicks during animation

    setEditingFood(food)
    setName(food.name)
    setScore(food.score.toString())
    setDefaultUnit(food.defaultUnit)
    setImageUri(food.imageUri)
    if (food.nutritionPer100g) {
      setCalories(food.nutritionPer100g.calories?.toString() || "")
      setProteins(food.nutritionPer100g.proteins?.toString() || "")
      setCarbs(food.nutritionPer100g.carbs?.toString() || "")
      setFats(food.nutritionPer100g.fats?.toString() || "")
    } else {
      setCalories("")
      setProteins("")
      setCarbs("")
      setFats("")
    }

    // Notify edit start
    onEditStart?.()

    // Set animating flag
    setIsAnimating(true)

    // Animate to edit view
    Animated.timing(slideAnim, {
      toValue: -Dimensions.get("window").width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setViewMode("edit")
      slideAnim.setValue(0)
      setIsAnimating(false) // Reset animation flag
    })
  }

  const handleAdd = () => {
    if (isAnimating) return // Prevent multiple clicks during animation

    setEditingFood(undefined)
    setName("")
    setScore("")
    setDefaultUnit("g")
    setCalories("")
    setProteins("")
    setCarbs("")
    setFats("")
    setImageUri(undefined)

    // Notify edit start
    onEditStart?.()

    // Set animating flag
    setIsAnimating(true)

    // Animate to edit view
    Animated.timing(slideAnim, {
      toValue: -Dimensions.get("window").width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setViewMode("edit")
      slideAnim.setValue(0)
      setIsAnimating(false) // Reset animation flag
    })
  }

  const handleCancel = () => {
    if (isAnimating) return // Prevent multiple clicks during animation

    // Set animating flag
    setIsAnimating(true)

    // Animate back to list view
    Animated.timing(slideAnim, {
      toValue: Dimensions.get("window").width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setViewMode("list")
      slideAnim.setValue(0)
      setIsAnimating(false) // Reset animation flag

      // Notify edit end
      onEditEnd?.()
    })
  }

  const handleSave = async () => {
    if (isAnimating || isLoading) return // Prevent actions during animation or loading

    if (!name.trim()) {
      Alert.alert("Error", "Name is required")
      return
    }

    if (!score || isNaN(Number(score))) {
      Alert.alert("Error", "Score must be a valid number")
      return
    }

    if (!defaultUnit.trim()) {
      Alert.alert("Error", "Unit is required")
      return
    }

    try {
      setIsLoading(true)
      const foodData: Food = {
        id: editingFood?.id || `food-${Date.now()}`,
        name: name.trim(),
        score: Number(score),
        defaultUnit: defaultUnit.trim(),
        imageUri: imageUri,
        nutritionPer100g: {
          calories: calories ? Number(calories) : undefined,
          proteins: proteins ? Number(proteins) : undefined,
          carbs: carbs ? Number(carbs) : undefined,
          fats: fats ? Number(fats) : undefined,
        },
      }

      const result = await (editingFood ? updateFood(foodData) : addFood(foodData))
      if (result.success) {
        await loadFoodData()

        // Set animating flag
        setIsAnimating(true)

        // Animate back to list view
        Animated.timing(slideAnim, {
          toValue: Dimensions.get("window").width,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setViewMode("list")
          slideAnim.setValue(0)
          setIsAnimating(false) // Reset animation flag

          // Notify edit end
          onEditEnd?.()
        })
      } else {
        Alert.alert("Error", result.error || "Error saving food")
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = useCallback((foodId: string) => {
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
  }, [])

  const getSwipeAnimation = (id: string) => {
    if (!swipeableRow.rowMap.has(id)) {
      swipeableRow.rowMap.set(id, new Animated.Value(0))
    }
    return swipeableRow.rowMap.get(id)!
  }

  const createPanResponder = (id: string) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, { dx }) => {
        const swipeAnim = getSwipeAnimation(id)
        // Limit swipe between -100 and 100
        const newValue = Math.max(-100, Math.min(100, dx))
        swipeAnim.setValue(newValue)
      },
      onPanResponderRelease: (_, { dx }) => {
        const swipeAnim = getSwipeAnimation(id)
        if (dx < -80) {
          // Swipe left to delete
          Animated.timing(swipeAnim, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }).start(() => handleDelete(id))
        } else if (dx > 80) {
          // Swipe right to edit
          Animated.timing(swipeAnim, {
            toValue: 100,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            const food = foods.find((f) => f.id === id)
            if (food) handleEdit(food)
          })
        } else {
          // Reset position
          Animated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 5,
          }).start()
        }
      },
    })

  const renderFoodItem = ({ item }: { item: Food }) => {
    const swipeAnim = getSwipeAnimation(item.id)
    const panResponder = createPanResponder(item.id)

    // Calculate action opacity based on swipe position
    const leftActionOpacity = swipeAnim.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: "clamp",
    })

    const rightActionOpacity = swipeAnim.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    })

    // Calculate element scale for tactile feedback
    const contentScale = swipeAnim.interpolate({
      inputRange: [-100, 0, 100],
      outputRange: [0.97, 1, 0.97],
      extrapolate: "clamp",
    })

    // Determine score color
    const scoreColor = getScoreColor(item.score)

    return (
      <View style={styles.foodItemContainer}>
        {/* Swipe action indicators */}
        <View style={styles.swipeIndicatorsContainer}>
          <Animated.View style={[styles.swipeIndicator, styles.editIndicator, { opacity: leftActionOpacity }]}>
            <MaterialIcons name="edit" size={18} color="#fff" />
            <ThemedText style={styles.swipeIndicatorText}>Modifica</ThemedText>
          </Animated.View>

          <Animated.View style={[styles.swipeIndicator, styles.deleteIndicator, { opacity: rightActionOpacity }]}>
            <MaterialIcons name="delete-outline" size={18} color="#fff" />
            <ThemedText style={styles.swipeIndicatorText}>Elimina</ThemedText>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.foodItem,
            {
              transform: [{ translateX: swipeAnim }, { scale: contentScale }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.foodContent}>
            <View style={styles.foodIconContainer}>
              {item.imageUri ? (
                <Image source={{ uri: item.imageUri }} style={styles.foodImage} />
              ) : (
                <MaterialIcons name="fastfood" size={18} color="#333" />
              )}
            </View>

            <View style={styles.foodTextContainer}>
              <View style={styles.nameScoreContainer}>
                <ThemedText style={styles.foodName}>{item.name}</ThemedText>
                <View style={[styles.scoreBadge, { backgroundColor: `${scoreColor}20` }]}>
                  <ThemedText style={[styles.scoreText, { color: scoreColor }]}>Score: {item.score}</ThemedText>
                </View>
              </View>

              {item.nutritionPer100g?.calories && (
                <ThemedText style={styles.caloriesText}>{item.nutritionPer100g.calories} kcal/100g</ThemedText>
              )}
            </View>

            <View style={styles.foodActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEdit(item)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <MaterialIcons name="edit" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete(item.id)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <MaterialIcons name="delete-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    )
  }

  const filteredFoods = foods
    .filter((food) => food.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  // Render the edit view
  const renderEditView = () => (
    <Animated.View style={[styles.editContainer, { transform: [{ translateX: slideAnim }] }]}>
      <View style={styles.editHeader}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton} disabled={isAnimating || isLoading}>
          <Feather name="arrow-left" size={24} color="#666" />
        </TouchableOpacity>

        <View style={styles.editHeaderContent}>
          <ThemedText style={styles.editTitle}>{editingFood ? "Modifica Alimento" : "Nuovo Alimento"}</ThemedText>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.editContent}
        contentContainerStyle={styles.editContentInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Picker */}
        <View style={styles.editSection}>
          <ImagePicker imageUri={imageUri} onImageSelected={(uri) => setImageUri(uri)} />
        </View>

        {/* Basic Information */}
        <View style={styles.editSection}>
          <View style={styles.formGroup}>
            <ThemedText style={styles.formLabel}>Nome Alimento *</ThemedText>
            <TextInput
              style={styles.formInput}
              placeholder="Nome alimento"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, styles.formGroupHalf]}>
              <ThemedText style={styles.formLabel}>Punteggio *</ThemedText>
              <TextInput
                style={styles.formInput}
                placeholder="0-100"
                value={score}
                onChangeText={setScore}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={[styles.formGroup, styles.formGroupHalf]}>
              <ThemedText style={styles.formLabel}>Unità *</ThemedText>
              <TextInput
                style={styles.formInput}
                placeholder="g"
                value={defaultUnit}
                onChangeText={setDefaultUnit}
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>

        {/* Nutrition Information */}
        <View style={styles.editSection}>
          <ThemedText style={styles.sectionTitle}>Valori Nutrizionali (per 100g)</ThemedText>

          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <ThemedText style={styles.nutritionLabel}>Calorie</ThemedText>
              <TextInput
                style={styles.nutritionInput}
                value={calories}
                onChangeText={setCalories}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.nutritionItem}>
              <ThemedText style={styles.nutritionLabel}>Proteine</ThemedText>
              <TextInput
                style={styles.nutritionInput}
                value={proteins}
                onChangeText={setProteins}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.nutritionItem}>
              <ThemedText style={styles.nutritionLabel}>Carboidrati</ThemedText>
              <TextInput
                style={styles.nutritionInput}
                value={carbs}
                onChangeText={setCarbs}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.nutritionItem}>
              <ThemedText style={styles.nutritionLabel}>Grassi</ThemedText>
              <TextInput
                style={styles.nutritionInput}
                value={fats}
                onChangeText={setFats}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.editFooter}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isAnimating || isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.saveButtonText}>Salva</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  )

  // Render the list view
  const renderListView = () => (
    <Animated.View style={[styles.listContainer, { transform: [{ translateX: slideAnim }] }]}>
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
        <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={isAnimating}>
          <MaterialIcons name="add" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Food List */}
      <FlatList
        ref={flatListRef}
        data={filteredFoods}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="food-bank" size={48} color="#bbb" />
            <ThemedText style={styles.emptyText}>{isLoading ? "Caricamento..." : "Nessun alimento trovato"}</ThemedText>
          </View>
        }
      />
    </Animated.View>
  )

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {viewMode === "list" ? renderListView() : renderEditView()}
    </KeyboardAvoidingView>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    flex: 1,
  },
  editContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  foodItemContainer: {
    position: "relative",
    marginBottom: 10,
    height: 60,
  },
  swipeIndicatorsContainer: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    height: "100%",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  swipeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  swipeIndicatorText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  editIndicator: {
    backgroundColor: "#4CAF50",
  },
  deleteIndicator: {
    backgroundColor: "#E53935",
  },
  foodItem: {
    height: "100%",
    borderRadius: 24,
    backgroundColor: "#e0e0e0",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#d0d0d0",
  },
  foodContent: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  foodIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 20,
    backgroundColor: "#d5d5d5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
  },
  foodTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  nameScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  foodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  caloriesText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: "500",
  },
  foodActions: {
    flexDirection: "row",
    gap: 12,
    paddingLeft: 6,
  },
  scoreBadge: {
    backgroundColor: "#cce6cd",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    marginLeft: 8,
  },
  actionButton: {
    padding: 6,
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
  // Edit view styles - Improved for a more compact interface
  editHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f5f5f5",
    position: "relative",
  },
  editHeaderContent: {
    alignItems: "center",
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f1f1f",
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    left: 12,
    padding: 8,
    borderRadius: 20,
  },
  editContent: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  editContentInner: {
    padding: 16,
    paddingBottom: 80, // Space for the footer
  },
  editSection: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 12,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
  },
  formLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    fontWeight: "500",
  },
  formInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  nutritionItem: {
    width: "50%",
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  nutritionLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    fontWeight: "500",
  },
  nutritionInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    textAlign: "center",
  },
  editFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 16, // Adjusted for iOS safe area
    backgroundColor: "#f5f5f5",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButton: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  foodImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
})
