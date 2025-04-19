import { useState, useEffect } from "react"
import { Alert } from "react-native"
import type { Food } from "@/types/food"

interface UseFoodFormResult {
  name: string
  score: string
  defaultUnit: string
  calories: string
  proteins: string
  carbs: string
  fats: string
  imageUri: string | undefined
  setName: (value: string) => void
  setScore: (value: string) => void
  setDefaultUnit: (value: string) => void
  setCalories: (value: string) => void
  setProteins: (value: string) => void
  setCarbs: (value: string) => void
  setFats: (value: string) => void
  setImageUri: (value: string | undefined) => void
  resetForm: () => void
  validateForm: () => boolean
  getFormData: (id?: string) => Food
}

export function useFoodForm(initialFood?: Food): UseFoodFormResult {
  const [name, setName] = useState("")
  const [score, setScore] = useState("")
  const [defaultUnit, setDefaultUnit] = useState("")
  const [calories, setCalories] = useState("")
  const [proteins, setProteins] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fats, setFats] = useState("")
  const [imageUri, setImageUri] = useState<string | undefined>()

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

  return {
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
  }
}
