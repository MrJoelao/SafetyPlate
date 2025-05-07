import { Food } from '@/types/food';
import { BaseStorage, StorageResult } from './BaseStorage';

// Food data validators
const isFoodArray = (data: any): boolean => {
  return Array.isArray(data);
};

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

export class FoodStorage extends BaseStorage<Food[]> {
  private static instance: FoodStorage;
  
  private constructor() {
    super('@safetyplate_foods', 1, [isFoodArray, hasFoodProperties]);
  }
  
  public static getInstance(): FoodStorage {
    if (!FoodStorage.instance) {
      FoodStorage.instance = new FoodStorage();
    }
    return FoodStorage.instance;
  }
  
  /**
   * Load all foods from storage
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
   */
  public async saveFoods(foods: Food[]): Promise<StorageResult<Food[]>> {
    return this.saveData(foods);
  }
  
  /**
   * Add a new food item
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
   */
  protected async migrateData(data: any, fromVersion: number): Promise<Food[]> {
    // Handle migrations from older versions when needed
    // For now, just return the data as is
    return data as Food[];
  }
}

// Export a singleton instance
export const foodStorage = FoodStorage.getInstance();