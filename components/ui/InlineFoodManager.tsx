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
import { MaterialIcons, Feather } from "@expo/vector-icons"
import type { Food } from "@/types/food"
import { loadFoods, deleteFood } from "@/utils/foodStorage"
import { AddEditFoodModal } from "./AddEditFoodModal"

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
      Alert.alert("Errore", result.error || "Errore nel caricamento degli alimenti")
    }
    setIsLoading(false)
  }

  const handleEdit = (food: Food) => {
    setEditingFood(food)
    setIsAddEditModalVisible(true)
  }

  const handleDelete = useCallback((foodId: string) => {
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
        swipeAnim.setValue(dx)
      },
      onPanResponderRelease: (_, { dx }) => {
        const swipeAnim = getSwipeAnimation(id)
        if (dx < -100) {
          // Swipe left to delete
          Animated.timing(swipeAnim, {
            toValue: -200,
            duration: 200,
            useNativeDriver: true,
          }).start(() => handleDelete(id))
        } else if (dx > 100) {
          // Swipe right to edit
          Animated.timing(swipeAnim, {
            toValue: 200,
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

    return (
      <Animated.View
        style={[
          styles.foodItem,
          {
            transform: [{ translateX: swipeAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Background actions */}
        <View style={styles.foodItemBackground}>
          <View style={styles.actionLeft}>
            <Feather name="edit-2" size={20} color="#fff" />
          </View>
          <View style={styles.actionRight}>
            <Feather name="x" size={20} color="#fff" />
          </View>
        </View>

        {/* Content */}
        <View style={styles.foodContent}>
          <View style={styles.foodIconContainer}>
            <MaterialIcons name="eco" size={20} color="#000" />
          </View>
          <ThemedText style={styles.foodName}>{item.name}</ThemedText>
          <View style={styles.foodActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)}>
              <Feather name="edit-2" size={18} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id)}>
              <Feather name="x" size={18} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    )
  }

  const filteredFoods = foods
    .filter((food) => food.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Search Bar - Redesigned to match mockup */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for foods..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#888"
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingFood(undefined)
            setIsAddEditModalVisible(true)
          }}
        >
          <Feather name="plus" size={24} color="#000" />
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
            <MaterialIcons name="no-meals" size={48} color="#ccc" />
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
    paddingVertical: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  foodItem: {
    marginBottom: 12,
    borderRadius: 24,
    backgroundColor: "#e0e0e0",
    overflow: "hidden",
  },
  foodItemBackground: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 24,
    overflow: "hidden",
  },
  actionLeft: {
    backgroundColor: "#4CAF50",
    width: width * 0.3,
    justifyContent: "center",
    alignItems: "center",
  },
  actionRight: {
    backgroundColor: "#F44336",
    width: width * 0.3,
    justifyContent: "center",
    alignItems: "center",
  },
  foodContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 24,
  },
  foodIconContainer: {
    marginRight: 12,
  },
  foodName: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  foodActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
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

