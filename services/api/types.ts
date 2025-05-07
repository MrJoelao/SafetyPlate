// Common API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

// Food API types
export interface FoodApiItem {
  id: string;
  name: string;
  score: number;
  defaultUnit: string;
  imageUri?: string;
  nutritionPer100g?: {
    calories?: number;
    proteins?: number;
    carbs?: number;
    fats?: number;
  };
}

export interface FoodListResponse extends ApiResponse<FoodApiItem[]> {}
export interface FoodItemResponse extends ApiResponse<FoodApiItem> {}

// User preferences API types
export interface UserPreferencesApiItem {
  allergies: string[];
  intolerances: string[];
  dietaryRestrictions: string[];
}

export interface UserPreferencesResponse extends ApiResponse<UserPreferencesApiItem> {}

// Request options
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  timeout?: number;
  cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache';
}