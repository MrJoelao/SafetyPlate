"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  FlatList,
  PanResponder,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { MaterialIcons } from "@expo/vector-icons"
import type { Food } from "@/types/food"
import { loadFoods, deleteFood } from "@/utils/foodStorage"
import { AddEditFoodModal } from "./AddEditFoodModal"
import { ScoreBadge } from "./ScoreBadge"

interface SwipeableRow {
  rowRef: React.RefObject<View>
  rowMap: Map<string, Animated.Value>
}

export function InlineFoodManager() {
  const isMounted = useRef(true)
  const flatListRef = useRef<FlatList>(null)

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
  const [isAddEditModalVisible, setIsAddEditModalVisible] = useState(false)

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
    setEditingFood(food)
    setIsAddEditModalVisible(true)
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
        // Limite lo swipe tra -100 e 100
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

    // Calcola l'opacità delle azioni basata sulla posizione dello swipe
    const leftActionOpacity = swipeAnim.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    })
    
    const rightActionOpacity = swipeAnim.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp'
    })

    // Calcola la scala degli elementi per un feedback tattile
    const contentScale = swipeAnim.interpolate({
      inputRange: [-100, 0, 100],
      outputRange: [0.97, 1, 0.97],
      extrapolate: 'clamp'
    })

    return (
      <View style={styles.foodItemContainer}>
        {/* Indicatori di azione swipe */}
        <View style={styles.swipeIndicatorsContainer}>
          <Animated.View 
            style={[
              styles.swipeIndicator, 
              styles.editIndicator, 
              { opacity: leftActionOpacity }
            ]}
          >
            <MaterialIcons name="edit" size={18} color="#fff" />
            <ThemedText style={styles.swipeIndicatorText}>Modifica</ThemedText>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.swipeIndicator, 
              styles.deleteIndicator,
              { opacity: rightActionOpacity }
            ]}
          >
            <MaterialIcons name="delete-outline" size={18} color="#fff" />
            <ThemedText style={styles.swipeIndicatorText}>Elimina</ThemedText>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.foodItem,
            {
              transform: [
                { translateX: swipeAnim },
                { scale: contentScale }
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.foodContent}>
            <View style={styles.foodIconContainer}>
              <MaterialIcons name="fastfood" size={22} color="#333" />
            </View>
            
            <View style={styles.foodTextContainer}>
              <View style={styles.nameScoreContainer}>
                <ThemedText style={styles.foodName}>{item.name}</ThemedText>
                <ScoreBadge score={item.score} size="small" />
              </View>
              
              {item.nutritionPer100g?.calories && (
                <ThemedText style={styles.caloriesText}>
                  {item.nutritionPer100g.calories} kcal/100g
                </ThemedText>
              )}
            </View>
            
            <View style={styles.foodActions}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => handleEdit(item)}
                hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
              >
                <MaterialIcons name="edit" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => handleDelete(item.id)}
                hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
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

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Search Bar - Redesigned */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={22} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cerca alimenti..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#888"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="cancel" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingFood(undefined)
            setIsAddEditModalVisible(true)
          }}
        >
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

      {/* Add/Edit Modal */}
      <AddEditFoodModal
        visible={isAddEditModalVisible}
        onClose={() => setIsAddEditModalVisible(false)}
        food={editingFood}
        onSave={async (food: Food) => {
          await loadFoodData()
          setIsAddEditModalVisible(false)
        }}
      />
    </KeyboardAvoidingView>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12, // Ridotto da 16 a 12
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 28,
    paddingHorizontal: 16,
    height: 42, // Ridotto da 48 a 42
    borderWidth: 1,
    borderColor: "#d0d0d0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
  },
  addButton: {
    width: 42, // Ridotto da 48 a 42
    height: 42, // Ridotto da 48 a 42
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
    position: 'relative',
    marginBottom: 10,
    height: 60,  // Ridotta da 80 a 60
  },
  swipeIndicatorsContainer: {
    position: 'absolute', 
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  swipeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,  // Ridotto da 16 a 12
    paddingVertical: 6,     // Ridotto da 8 a 6
    borderRadius: 20,       // Ridotto da 20 a 16
    gap: 6,
  },
  swipeIndicatorText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,  // Ridotto da 14 a 13
  },
  editIndicator: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  deleteIndicator: {
    backgroundColor: '#E53935',
    borderRadius: 8,
  },
  foodItem: {
    height: '100%',
    borderRadius: 24,
    backgroundColor: "#f8f8f8",  // Leggermente più chiaro per un look più moderno
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  foodContent: {
    flexDirection: "row",
    alignItems: "center",
    height: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  foodIconContainer: {
    width: 38, // Aumentato da 32 a 38
    height: 38, // Aumentato da 32 a 38
    borderRadius: 22, // Aumentato proporzionalmente
    backgroundColor: "#d5d5d5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  foodTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: "#000",
  },
  caloriesText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  scoreText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  foodActions: {
    flexDirection: "row",
    gap: 12,
    paddingLeft: 6,
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
})

