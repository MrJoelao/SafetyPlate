import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Food } from "@/types/food"
import type { ParseResult, StorageResult } from "@/types/storage"

const FOODS_STORAGE_KEY = "@safetyplate_foods"

export const parseFoodFromText = (content: string): ParseResult => {
  try {
    console.log("Parsing content:", content)

    if (!content || typeof content !== "string") {
      return {
        success: false,
        error: "Il contenuto del file non è valido",
      }
    }

    const foods = content
      .split("\n")
      .map((line) => {
        const trimmedLine = line.trim()
        if (trimmedLine.length === 0) {
          console.log("Saltando linea vuota")
          return null
        }

        const parts = trimmedLine.split(" ")
        if (parts.length !== 2) {
          console.log("Invalid line format (wrong number of parts):", trimmedLine)
          return null
        }

        const [name, scoreStr] = parts
        const score = Number.parseInt(scoreStr, 10)

        if (!name || isNaN(score)) {
          console.log("Invalid line format:", trimmedLine)
          return null
        }

        const food = {
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          name: name.replace(/_/g, " "),
          score,
          defaultUnit: "g",
        }
        console.log("Parsed food:", food)
        return food
      })
      .filter((food): food is Food => food !== null)

    if (foods.length === 0) {
      return {
        success: false,
        error: "Nessun alimento valido trovato nel file",
      }
    }

    console.log("Total foods parsed:", foods.length)
    return { success: true, foods }
  } catch (error) {
    console.error("Error parsing food text:", error)
    return {
      success: false,
      error: "Errore durante la lettura del file",
    }
  }
}

export const saveFoods = async (foods: Food[]): Promise<StorageResult> => {
  try {
    if (!Array.isArray(foods)) {
      return {
        success: false,
        error: "Formato dati non valido",
      }
    }

    const jsonData = JSON.stringify(foods, null, 2)
    console.log("Saving foods to AsyncStorage:", jsonData)
    await AsyncStorage.setItem(FOODS_STORAGE_KEY, jsonData)
    console.log("Foods saved successfully")

    return {
      success: true,
      foods,
    }
  } catch (error) {
    console.error("Error saving foods:", error)
    return {
      success: false,
      error: "Errore durante il salvataggio degli alimenti",
    }
  }
}

export const addFood = async (food: Food): Promise<StorageResult> => {
  try {
    const result = await loadFoods()
    if (!result.success) {
      return result
    }

    const foods = result.foods || []
    const updatedFoods = [...foods, food]
    return saveFoods(updatedFoods)
  } catch (error) {
    console.error("Error adding food:", error)
    return {
      success: false,
      error: "Errore durante l'aggiunta dell'alimento",
    }
  }
}

export const updateFood = async (updatedFood: Food): Promise<StorageResult> => {
  try {
    const result = await loadFoods()
    if (!result.success) {
      return result
    }

    const foods = result.foods || []
    const foodIndex = foods.findIndex((f) => f.id === updatedFood.id)

    if (foodIndex === -1) {
      return {
        success: false,
        error: "Alimento non trovato",
      }
    }

    const updatedFoods = [...foods]
    updatedFoods[foodIndex] = updatedFood
    return saveFoods(updatedFoods)
  } catch (error) {
    console.error("Error updating food:", error)
    return {
      success: false,
      error: "Errore durante l'aggiornamento dell'alimento",
    }
  }
}

export const deleteFood = async (foodId: string): Promise<StorageResult> => {
  try {
    const result = await loadFoods()
    if (!result.success) {
      return result
    }

    const foods = result.foods || []
    const updatedFoods = foods.filter((f) => f.id !== foodId)
    return saveFoods(updatedFoods)
  } catch (error) {
    console.error("Error deleting food:", error)
    return {
      success: false,
      error: "Errore durante l'eliminazione dell'alimento",
    }
  }
}

export const loadFoods = async (): Promise<StorageResult> => {
  try {
    console.log("Loading foods from AsyncStorage")
    const storedFoods = await AsyncStorage.getItem(FOODS_STORAGE_KEY)
    if (storedFoods) {
      try {
        const foods = JSON.parse(storedFoods)
        if (!Array.isArray(foods)) {
          throw new Error("Stored data is not an array")
        }
        console.log("Loaded foods:", JSON.stringify(foods, null, 2))
        return { success: true, foods }
      } catch (parseError) {
        console.error("Error parsing stored foods:", parseError)
        return {
          success: false,
          error: "Errore nel formato dei dati salvati",
        }
      }
    }
    console.log("No foods found in storage")
    return { success: true, foods: [] }
  } catch (error) {
    console.error("Error loading foods:", error)
    return {
      success: false,
      error: "Errore durante il caricamento degli alimenti",
    }
  }
}

