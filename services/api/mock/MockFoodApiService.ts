import { FoodApiService } from '../interfaces';
import { ApiResponse, FoodApiItem, FoodItemResponse, FoodListResponse, RequestOptions } from '../types';
import { BaseApiService } from '../BaseApiService';

/**
 * Mock implementation of the Food API service
 * Simulates API responses for development and testing
 */
export class MockFoodApiService extends BaseApiService implements FoodApiService {
  private foods: FoodApiItem[] = [];
  
  constructor() {
    super('https://mock-api.example.com');
    // Initialize with some mock data
    this.initializeMockData();
  }
  
  /**
   * Get all foods
   */
  public async getAllFoods(options?: RequestOptions): Promise<FoodListResponse> {
    // Simulate network delay
    await this.delay();
    
    return {
      success: true,
      data: [...this.foods],
      statusCode: 200,
    };
  }
  
  /**
   * Get a food by ID
   */
  public async getFoodById(id: string, options?: RequestOptions): Promise<FoodItemResponse> {
    await this.delay();
    
    const food = this.foods.find(f => f.id === id);
    
    if (!food) {
      return {
        success: false,
        error: 'Food not found',
        statusCode: 404,
      };
    }
    
    return {
      success: true,
      data: { ...food },
      statusCode: 200,
    };
  }
  
  /**
   * Create a new food
   */
  public async createFood(food: Omit<FoodApiItem, 'id'>, options?: RequestOptions): Promise<FoodItemResponse> {
    await this.delay();
    
    const newFood: FoodApiItem = {
      ...food,
      id: `food-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    this.foods.push(newFood);
    
    return {
      success: true,
      data: newFood,
      statusCode: 201,
    };
  }
  
  /**
   * Update an existing food
   */
  public async updateFood(id: string, food: Partial<FoodApiItem>, options?: RequestOptions): Promise<FoodItemResponse> {
    await this.delay();
    
    const index = this.foods.findIndex(f => f.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Food not found',
        statusCode: 404,
      };
    }
    
    const updatedFood: FoodApiItem = {
      ...this.foods[index],
      ...food,
      id, // Ensure ID doesn't change
    };
    
    this.foods[index] = updatedFood;
    
    return {
      success: true,
      data: updatedFood,
      statusCode: 200,
    };
  }
  
  /**
   * Delete a food
   */
  public async deleteFood(id: string, options?: RequestOptions): Promise<ApiResponse<void>> {
    await this.delay();
    
    const index = this.foods.findIndex(f => f.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Food not found',
        statusCode: 404,
      };
    }
    
    this.foods.splice(index, 1);
    
    return {
      success: true,
      statusCode: 204,
    };
  }
  
  /**
   * Search foods by name
   */
  public async searchFoods(query: string, options?: RequestOptions): Promise<FoodListResponse> {
    await this.delay();
    
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      return this.getAllFoods(options);
    }
    
    const filteredFoods = this.foods.filter(food => 
      food.name.toLowerCase().includes(normalizedQuery)
    );
    
    return {
      success: true,
      data: filteredFoods,
      statusCode: 200,
    };
  }
  
  /**
   * Initialize mock data
   */
  private initializeMockData(): void {
    this.foods = [
      {
        id: 'food-1',
        name: 'Apple',
        score: 90,
        defaultUnit: 'g',
        nutritionPer100g: {
          calories: 52,
          proteins: 0.3,
          carbs: 14,
          fats: 0.2,
        },
      },
      {
        id: 'food-2',
        name: 'Banana',
        score: 85,
        defaultUnit: 'g',
        nutritionPer100g: {
          calories: 89,
          proteins: 1.1,
          carbs: 22.8,
          fats: 0.3,
        },
      },
      {
        id: 'food-3',
        name: 'Chicken Breast',
        score: 95,
        defaultUnit: 'g',
        nutritionPer100g: {
          calories: 165,
          proteins: 31,
          carbs: 0,
          fats: 3.6,
        },
      },
      {
        id: 'food-4',
        name: 'Salmon',
        score: 90,
        defaultUnit: 'g',
        nutritionPer100g: {
          calories: 208,
          proteins: 20,
          carbs: 0,
          fats: 13,
        },
      },
      {
        id: 'food-5',
        name: 'Brown Rice',
        score: 80,
        defaultUnit: 'g',
        nutritionPer100g: {
          calories: 112,
          proteins: 2.6,
          carbs: 23,
          fats: 0.9,
        },
      },
    ];
  }
  
  /**
   * Simulate network delay
   */
  private async delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export a singleton instance
export const mockFoodApiService = new MockFoodApiService();