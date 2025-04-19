"use client"

import { useState, useEffect } from "react"
import {
  Modal,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { ThemedText } from "@/components/common/ThemedText"
import { Feather } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import type { Food } from "@/types/food"
import { ActionButton } from "@/components/ui/buttons/ActionButton"
import { QuantityInput } from "@/components/ui/forms/QuantityInput"
import { NutritionInput } from "@/components/ui/forms/NutritionInput"
import { ImagePicker } from "@/components/ui/forms/ImagePicker"

interface AddEditFoodModalProps {
  visible: boolean
  onClose: () => void
  food?: Food
  onSave: (food: Food) => Promise<void>
}

export function AddEditFoodModal({ visible, onClose, food, onSave }: AddEditFoodModalProps) {
  const [name, setName] = useState("")
  const [score, setScore] = useState("")
  const [defaultUnit, setDefaultUnit] = useState("")
  const [calories, setCalories] = useState("")
  const [proteins, setProteins] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fats, setFats] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [imageUri, setImageUri] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false) // Track submission state

  useEffect(() => {
    if (food) {
      setName(food.name)
      setScore(food.score.toString())
      setDefaultUnit(food.defaultUnit)
      setImageUri(food.imageUri)
      if (food.nutritionPer100g) {
        setCalories(food.nutritionPer100g.calories?.toString() || "")
        setProteins(food.nutritionPer100g.proteins?.toString() || "")
        setCarbs(food.nutritionPer100g.carbs?.toString() || "")
        setFats(food.nutritionPer100g.fats?.toString() || "")
      }
    } else {
      resetForm()
    }
  }, [food, visible])

  const resetForm = () => {
    setName("")
    setScore("")
    setDefaultUnit("")
    setCalories("")
    setProteins("")
    setCarbs("")
    setFats("")
    setImageUri(undefined)
  }

  const handleSave = async () => {
    if (isSubmitting) return // Prevent multiple submissions

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
      setIsSubmitting(true)
      const foodData: Food = {
        id: food?.id || `food-${Date.now()}`,
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

      await onSave(foodData)
      resetForm()
      onClose()
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred")
    } finally {
      setIsLoading(false)
      setIsSubmitting(false)
    }
  }

  const handleBackPress = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={handleBackPress}>
      <BlurView intensity={20} style={styles.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboardView}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Feather name={food ? "edit" : "plus-circle"} size={24} color={food ? "#2196F3" : "#4CAF50"} />
                <ThemedText style={styles.title}>{food ? "Edit Food" : "New Food"}</ThemedText>
              </View>
              <TouchableOpacity onPress={handleBackPress} style={styles.closeButton} disabled={isSubmitting}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
              {/* Image Picker */}
              <View style={styles.imagePickerSection}>
                <ImagePicker imageUri={imageUri} onImageSelected={(uri) => setImageUri(uri)} />
              </View>

              {/* Required Fields */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Basic Information *</ThemedText>
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder="Food name"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#999"
                  />
                  <QuantityInput
                    quantity={score}
                    unit={defaultUnit}
                    onQuantityChange={setScore}
                    onUnitChange={setDefaultUnit}
                    label="Score & Unit"
                  />
                </View>
              </View>

              {/* Optional Fields */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Nutrition per 100g</ThemedText>
                <NutritionInput
                  calories={calories}
                  proteins={proteins}
                  carbs={carbs}
                  fats={fats}
                  onCaloriesChange={setCalories}
                  onProteinsChange={setProteins}
                  onCarbsChange={setCarbs}
                  onFatsChange={setFats}
                />
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <ActionButton
                onPress={handleSave}
                label="Save"
                icon="save"
                variant="primary"
                disabled={isLoading || isSubmitting}
                style={styles.saveButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  keyboardView: {
    flex: 1,
    marginTop: "5%",
  },
  modalContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    maxHeight: "95%",
    marginHorizontal: 10,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80, // Space for the footer
  },
  section: {
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
  inputGroup: {
    gap: 12,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  footer: {
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
    backgroundColor: "#4CAF50",
  },
  imagePickerSection: {
    alignItems: "center",
    marginBottom: 16,
  },
})
