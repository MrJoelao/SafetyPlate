/**
 * Food form management hook
 * 
 * This hook manages the state and validation for a food item form.
 * It provides methods for setting form values, validating the form,
 * and getting the form data as a Food object.
 */
import { useState, useEffect } from "react"
import { Alert } from "react-native"
import type { Food } from "@/types/food"
import { useFoodContext } from "@/store/context"

/**
 * Options for the useFoodForm hook
 */
interface UseFoodFormOptions {
  /** Initial food data to populate the form */
  initialFood?: Food
  /** Callback when form is saved successfully */
  onSaveSuccess?: () => void
  /** Callback when form save fails */
  onSaveError?: (error: string) => void
}

/**
 * Result object returned by the useFoodForm hook
 */
interface UseFoodFormResult {
  // Form values
  name: string
  score: string
  defaultUnit: string
  calories: string
  proteins: string
  carbs: string
  fats: string
  imageUri: string | undefined

  // Form setters
  setName: (value: string) => void
  setScore: (value: string) => void
  setDefaultUnit: (value: string) => void
  setCalories: (value: string) => void
  setProteins: (value: string) => void
  setCarbs: (value: string) => void
  setFats: (value: string) => void
  setImageUri: (value: string | undefined) => void

  // Form actions
  resetForm: () => void
  validateForm: () => boolean
  getFormData: (id?: string) => Food
  saveFood: () => Promise<boolean>
  isLoading: boolean
}

export function useFoodForm(options: UseFoodFormOptions = {}): UseFoodFormResult {
  const { initialFood, onSaveSuccess, onSaveError } = options
  const { addNewFood, updateExistingFood, state } = useFoodContext()
  const [isLoading, setIsLoading] = useState(false)
  // Form state
  const [name, setName] = useState("")
  const [score, setScore] = useState("")
  const [defaultUnit, setDefaultUnit] = useState("")
  const [calories, setCalories] = useState("")
  const [proteins, setProteins] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fats, setFats] = useState("")
  const [imageUri, setImageUri] = useState<string | undefined>()

  /**
   * Initialize form with food data when available
   */
  useEffect(() => {
    if (initialFood) {
      setName(initialFood.name)
      setScore(initialFood.score.toString())
      setDefaultUnit(initialFood.defaultUnit)
      setImageUri(initialFood.imageUri)
      if (initialFood.nutritionPer100g) {
        setCalories(initialFood.nutritionPer100g.calories?.toString() || "")
        setProteins(initialFood.nutritionPer100g.proteins?.toString() || "")
        setCarbs(initialFood.nutritionPer100g.carbs?.toString() || "")
        setFats(initialFood.nutritionPer100g.fats?.toString() || "")
      }
    } else {
      resetForm()
    }
  }, [initialFood])

  /**
   * Reset form to initial empty state
   */
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

  /**
   * Validate form data
   * @returns true if form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required")
      return false
    }

    if (!score || isNaN(Number(score))) {
      Alert.alert("Error", "Score must be a valid number")
      return false
    }

    if (!defaultUnit.trim()) {
      Alert.alert("Error", "Unit is required")
      return false
    }

    return true
  }

  /**
   * Get form data as a Food object
   * @param id Optional ID for the food item
   * @returns Food object with form data
   */
  const getFormData = (id?: string): Food => ({
    id: id || `food-${Date.now()}`,
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
  })

  /**
   * Save food data to storage
   * Uses the FoodContext to add or update food
   * @returns Promise that resolves to true if save was successful
   */
  const saveFood = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false
    }

    try {
      setIsLoading(true)

      if (initialFood) {
        // Update existing food
        const updatedFood = getFormData(initialFood.id)
        await updateExistingFood(updatedFood)
      } else {
        // Add new food
        const newFood = getFormData()
        await addNewFood(newFood)
      }

      // Call success callback if provided
      onSaveSuccess?.()
      return true
    } catch (error) {
      // Handle error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error saving food:', errorMessage)

      // Call error callback if provided
      onSaveError?.(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    // Form values
    name,
    score,
    defaultUnit,
    calories,
    proteins,
    carbs,
    fats,
    imageUri,

    // Form setters
    setName,
    setScore,
    setDefaultUnit,
    setCalories,
    setProteins,
    setCarbs,
    setFats,
    setImageUri,

    // Form actions
    resetForm,
    validateForm,
    getFormData,
    saveFood,
    isLoading,
  }
}
