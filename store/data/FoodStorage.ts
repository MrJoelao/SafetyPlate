/**
 * Food storage module for managing food data persistence
 * 
 * This module provides a singleton class for storing and retrieving food data
 * with validation, versioning, and migration capabilities. It extends the
 * BaseStorage class to provide specific functionality for food data.
 */
import { Food } from '@/types/food';
import { BaseStorage, StorageResult } from './BaseStorage';

/**
 * Validator function to check if data is an array
 * @param data The data to validate
 * @returns true if the data is an array, false otherwise
 */
const isFoodArray = (data: any): boolean => {
  return Array.isArray(data);
};

/**
 * Validator function to check if data has required food properties
 * @param data The data to validate
 * @returns true if all items in the array have required food properties, false otherwise
 */
const hasFoodProperties = (data: any): boolean => {
  if (!Array.isArray(data)) return false;

  for (const item of data) {
    if (!item.id || typeof item.id !== 'string') return false;
    if (!item.name || typeof item.name !== 'string') return false;
    if (item.score === undefined || typeof item.score !== 'number') return false;
    if (!item.defaultUnit || typeof item.defaultUnit !== 'string') return false;
  }

  return true;
};

/**
 * Food storage class for managing food data persistence
 * 
 * This class provides methods for loading, saving, adding, updating, and deleting
 * food items, as well as parsing food data from text. It uses the Singleton pattern
 * to ensure only one instance exists.
 */
export class FoodStorage extends BaseStorage<Food[]> {
  /** Singleton instance */
  private static instance: FoodStorage;

  /**
   * Private constructor to prevent direct instantiation
   * Use getInstance() instead
   */
  private constructor() {
    super('@safetyplate_foods', 1, [isFoodArray, hasFoodProperties]);
  }

  /**
   * Get the singleton instance of FoodStorage
   * @returns The singleton instance
   */
  public static getInstance(): FoodStorage {
    if (!FoodStorage.instance) {
      FoodStorage.instance = new FoodStorage();
    }
    return FoodStorage.instance;
  }

  /**
   * Load all foods from storage
   * 
   * This method retrieves all food items from storage. If no data is found,
   * it returns an empty array instead of undefined to simplify usage.
   * 
   * @returns A promise that resolves to a StorageResult containing the loaded foods or an error
   */
  public async loadFoods(): Promise<StorageResult<Food[]>> {
    const result = await this.loadData();

    if (result.success && !result.data) {
      // Return empty array if no data found
      return {
        success: true,
        data: [],
      };
    }

    return result;
  }

  /**
   * Save all foods to storage
   * 
   * This method saves the provided array of food items to storage.
   * It validates the data before saving and handles versioning.
   * 
   * @param foods The array of food items to save
   * @returns A promise that resolves to a StorageResult containing the saved foods or an error
   */
  public async saveFoods(foods: Food[]): Promise<StorageResult<Food[]>> {
    return this.saveData(foods);
  }

  /**
   * Add a new food item
   * 
   * This method adds a new food item to the existing collection.
   * It first loads the current foods, adds the new item, and saves the updated collection.
   * 
   * @param food The food item to add
   * @returns A promise that resolves to a StorageResult containing all foods or an error
   */
  public async addFood(food: Food): Promise<StorageResult<Food[]>> {
    const result = await this.loadFoods();

    if (!result.success) {
      return result;
    }

    const foods = result.data || [];
    const updatedFoods = [...foods, food];

    return this.saveFoods(updatedFoods);
  }

  /**
   * Update an existing food item
   * 
   * This method updates an existing food item in the collection.
   * It first loads the current foods, finds the item by ID, updates it,
   * and saves the updated collection. If the item is not found, it returns an error.
   * 
   * @param updatedFood The updated food item (must have the same ID as the original)
   * @returns A promise that resolves to a StorageResult containing all foods or an error
   */
  public async updateFood(updatedFood: Food): Promise<StorageResult<Food[]>> {
    const result = await this.loadFoods();

    if (!result.success) {
      return result;
    }

    const foods = result.data || [];
    const foodIndex = foods.findIndex(f => f.id === updatedFood.id);

    if (foodIndex === -1) {
      return {
        success: false,
        error: 'Food item not found',
      };
    }

    const updatedFoods = [...foods];
    updatedFoods[foodIndex] = updatedFood;

    return this.saveFoods(updatedFoods);
  }

  /**
   * Delete a food item
   * 
   * This method removes a food item from the collection by its ID.
   * It first loads the current foods, filters out the item with the specified ID,
   * and saves the updated collection. If no item is removed (ID not found),
   * it returns an error.
   * 
   * @param foodId The ID of the food item to delete
   * @returns A promise that resolves to a StorageResult containing all remaining foods or an error
   */
  public async deleteFood(foodId: string): Promise<StorageResult<Food[]>> {
    const result = await this.loadFoods();

    if (!result.success) {
      return result;
    }

    const foods = result.data || [];
    const updatedFoods = foods.filter(f => f.id !== foodId);

    if (updatedFoods.length === foods.length) {
      return {
        success: false,
        error: 'Food item not found',
      };
    }

    return this.saveFoods(updatedFoods);
  }

  /**
   * Parse food data from text
   * 
   * This method parses a text string containing food data and converts it to Food objects.
   * The expected format is one food item per line, with name and score separated by a space.
   * For example: "Apple 90"
   * 
   * It handles validation and error cases such as empty content, invalid format, etc.
   * 
   * @param content The text content to parse
   * @returns A StorageResult containing the parsed food items or an error
   */
  public parseFoodFromText(content: string): StorageResult<Food[]> {
    try {
      if (!content || typeof content !== 'string') {
        return {
          success: false,
          error: 'Invalid file content',
        };
      }

      const foods = content
        .split('\n')
        .map(line => {
          const trimmedLine = line.trim();
          if (trimmedLine.length === 0) {
            return null;
          }

          const parts = trimmedLine.split(' ');
          if (parts.length !== 2) {
            return null;
          }

          const [name, scoreStr] = parts;
          const score = Number.parseInt(scoreStr, 10);

          if (!name || isNaN(score)) {
            return null;
          }

          return {
            id: `food-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: name.replace(/_/g, ' '),
            score,
            defaultUnit: 'g',
          } as Food;
        })
        .filter((food): food is Food => food !== null);

      if (foods.length === 0) {
        return {
          success: false,
          error: 'No valid food items found in the file',
        };
      }

      return {
        success: true,
        data: foods,
      };
    } catch (error) {
      console.error('Error parsing food text:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error parsing food data',
      };
    }
  }

  /**
   * Import foods from text and save them
   * 
   * This method combines parsing food data from text and saving it to storage.
   * It first parses the text content, then loads existing foods, combines them
   * with the newly parsed foods, and saves the combined collection.
   * 
   * @param content The text content containing food data to import
   * @returns A promise that resolves to a StorageResult containing all foods or an error
   */
  public async importFoodsFromText(content: string): Promise<StorageResult<Food[]>> {
    const parseResult = this.parseFoodFromText(content);

    if (!parseResult.success || !parseResult.data) {
      return parseResult;
    }

    const loadResult = await this.loadFoods();

    if (!loadResult.success) {
      return loadResult;
    }

    const existingFoods = loadResult.data || [];
    const newFoods = [...existingFoods, ...parseResult.data];

    return this.saveFoods(newFoods);
  }

  /**
   * Override the migration method to handle future schema changes
   * 
   * This method is responsible for migrating data from older versions to the current version.
   * It's called automatically when data with an older version is loaded.
   * 
   * Currently, there are no migrations implemented as this is the first version,
   * but this method provides a framework for future schema changes.
   * 
   * @param data The data to migrate
   * @param fromVersion The version of the data being migrated
   * @returns A promise that resolves to the migrated data
   * @override
   */
  protected async migrateData(data: any, fromVersion: number): Promise<Food[]> {
    // Handle migrations from older versions when needed
    // For now, just return the data as is
    return data as Food[];
  }
}

// Export a singleton instance
export const foodStorage = FoodStorage.getInstance();
