import { 
  ApiResponse, 
  FoodApiItem, 
  FoodItemResponse, 
  FoodListResponse, 
  RequestOptions, 
  UserPreferencesApiItem, 
  UserPreferencesResponse 
} from './types';

/**
 * Base API service interface
 */
export interface ApiService {
  get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>;
  post<T, D>(endpoint: string, data: D, options?: RequestOptions): Promise<ApiResponse<T>>;
  put<T, D>(endpoint: string, data: D, options?: RequestOptions): Promise<ApiResponse<T>>;
  delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>;
}

/**
 * Food API service interface
 */
export interface FoodApiService {
  getAllFoods(options?: RequestOptions): Promise<FoodListResponse>;
  getFoodById(id: string, options?: RequestOptions): Promise<FoodItemResponse>;
  createFood(food: Omit<FoodApiItem, 'id'>, options?: RequestOptions): Promise<FoodItemResponse>;
  updateFood(id: string, food: Partial<FoodApiItem>, options?: RequestOptions): Promise<FoodItemResponse>;
  deleteFood(id: string, options?: RequestOptions): Promise<ApiResponse<void>>;
  searchFoods(query: string, options?: RequestOptions): Promise<FoodListResponse>;
}

/**
 * User preferences API service interface
 */
export interface UserPreferencesApiService {
  getUserPreferences(options?: RequestOptions): Promise<UserPreferencesResponse>;
  updateUserPreferences(preferences: UserPreferencesApiItem, options?: RequestOptions): Promise<UserPreferencesResponse>;
}