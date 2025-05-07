/**
 * @deprecated This module is maintained for backward compatibility.
 * New code should use the FoodStorage class from @/store/data/FoodStorage.ts directly.
 */
import type { Food } from "@/types/food"
import type { ParseResult, StorageResult } from "@/types/storage"
import { toLegacyResult } from "@/types/storage"
import { foodStorage } from "@/store/data/FoodStorage"

// Keep the constant for reference, but we're using the FoodStorage class internally
const FOODS_STORAGE_KEY = "@safetyplate_foods"

/**
 * Parse food data from text
 * @deprecated Use foodStorage.parseFoodFromText instead
 */
export const parseFoodFromText = (content: string): ParseResult => {
  console.log("Using deprecated parseFoodFromText, consider migrating to foodStorage.parseFoodFromText")

  // Delegate to the new implementation and convert the result to the old format
  return toLegacyResult(foodStorage.parseFoodFromText(content)) as ParseResult;
}

/**
 * Save foods to storage
 * @deprecated Use foodStorage.saveFoods instead
 */
export const saveFoods = async (foods: Food[]): Promise<StorageResult> => {
  console.log("Using deprecated saveFoods, consider migrating to foodStorage.saveFoods")

  if (!Array.isArray(foods)) {
    return {
      success: false,
      error: "Formato dati non valido",
    }
  }

  // Delegate to the new implementation and convert the result to the old format
  return toLegacyResult(await foodStorage.saveFoods(foods));
}

/**
 * Add a food item to storage
 * @deprecated Use foodStorage.addFood instead
 */
export const addFood = async (food: Food): Promise<StorageResult> => {
  console.log("Using deprecated addFood, consider migrating to foodStorage.addFood")

  // Delegate to the new implementation
  const result = await foodStorage.addFood(food)

  // If successful, load all foods to return in the response
  if (result.success) {
    return toLegacyResult(await foodStorage.loadFoods());
  } 

  // If failed, return the error
  return toLegacyResult(result);
}

/**
 * Update a food item in storage
 * @deprecated Use foodStorage.updateFood instead
 */
export const updateFood = async (updatedFood: Food): Promise<StorageResult> => {
  console.log("Using deprecated updateFood, consider migrating to foodStorage.updateFood")

  // Delegate to the new implementation
  const result = await foodStorage.updateFood(updatedFood)

  // If successful, load all foods to return in the response
  if (result.success) {
    return toLegacyResult(await foodStorage.loadFoods());
  } 

  // If failed, return the error
  return toLegacyResult(result);
}

/**
 * Delete a food item from storage
 * @deprecated Use foodStorage.deleteFood instead
 */
export const deleteFood = async (foodId: string): Promise<StorageResult> => {
  console.log("Using deprecated deleteFood, consider migrating to foodStorage.deleteFood")

  // Delegate to the new implementation
  const result = await foodStorage.deleteFood(foodId)

  // If successful, load all foods to return in the response
  if (result.success) {
    return toLegacyResult(await foodStorage.loadFoods());
  } 

  // If failed, return the error
  return toLegacyResult(result);
}

/**
 * Load all foods from storage
 * @deprecated Use foodStorage.loadFoods instead
 */
export const loadFoods = async (): Promise<StorageResult> => {
  console.log("Using deprecated loadFoods, consider migrating to foodStorage.loadFoods")

  // Delegate to the new implementation and convert the result to the old format
  return toLegacyResult(await foodStorage.loadFoods());
}
