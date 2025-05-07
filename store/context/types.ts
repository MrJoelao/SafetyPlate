import type { Food } from "@/types/food";

// App state types
export interface AppState {
  theme: 'light' | 'dark' | 'system';
  language: string;
}

// User preferences types
export interface UserPreferences {
  allergies: string[];
  intolerances: string[];
  dietaryRestrictions: string[];
}

// Food state types
export interface FoodState {
  foods: Food[];
  loading: boolean;
  error: string | null;
}

// Food context actions
export type FoodAction = 
  | { type: 'LOAD_FOODS_REQUEST' }
  | { type: 'LOAD_FOODS_SUCCESS', payload: Food[] }
  | { type: 'LOAD_FOODS_FAILURE', payload: string }
  | { type: 'ADD_FOOD_REQUEST', payload: Food }
  | { type: 'ADD_FOOD_SUCCESS', payload: Food }
  | { type: 'ADD_FOOD_FAILURE', payload: string }
  | { type: 'UPDATE_FOOD_REQUEST', payload: Food }
  | { type: 'UPDATE_FOOD_SUCCESS', payload: Food }
  | { type: 'UPDATE_FOOD_FAILURE', payload: string }
  | { type: 'DELETE_FOOD_REQUEST', payload: string }
  | { type: 'DELETE_FOOD_SUCCESS', payload: string }
  | { type: 'DELETE_FOOD_FAILURE', payload: string };

// App context actions
export type AppAction =
  | { type: 'SET_THEME', payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_LANGUAGE', payload: string };

// User preferences context actions
export type UserPreferencesAction =
  | { type: 'SET_ALLERGIES', payload: string[] }
  | { type: 'SET_INTOLERANCES', payload: string[] }
  | { type: 'SET_DIETARY_RESTRICTIONS', payload: string[] };