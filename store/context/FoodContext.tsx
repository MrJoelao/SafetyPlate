import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Food } from '@/types/food';
import type { FoodState, FoodAction } from './types';
import { loadFoods, addFood, updateFood, deleteFood } from '@/utils/foodStorage';

// Initial state
const initialState: FoodState = {
  foods: [],
  loading: false,
  error: null,
};

// Create context
const FoodContext = createContext<{
  state: FoodState;
  dispatch: React.Dispatch<FoodAction>;
  loadAllFoods: () => Promise<void>;
  addNewFood: (food: Food) => Promise<void>;
  updateExistingFood: (food: Food) => Promise<void>;
  removeFood: (id: string) => Promise<void>;
} | undefined>(undefined);

// Reducer function
function foodReducer(state: FoodState, action: FoodAction): FoodState {
  switch (action.type) {
    case 'LOAD_FOODS_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOAD_FOODS_SUCCESS':
      return {
        ...state,
        foods: action.payload,
        loading: false,
        error: null,
      };
    case 'LOAD_FOODS_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'ADD_FOOD_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'ADD_FOOD_SUCCESS':
      return {
        ...state,
        foods: [...state.foods, action.payload],
        loading: false,
        error: null,
      };
    case 'ADD_FOOD_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'UPDATE_FOOD_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'UPDATE_FOOD_SUCCESS':
      return {
        ...state,
        foods: state.foods.map(food => 
          food.id === action.payload.id ? action.payload : food
        ),
        loading: false,
        error: null,
      };
    case 'UPDATE_FOOD_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'DELETE_FOOD_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'DELETE_FOOD_SUCCESS':
      return {
        ...state,
        foods: state.foods.filter(food => food.id !== action.payload),
        loading: false,
        error: null,
      };
    case 'DELETE_FOOD_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}

// Provider component
export function FoodProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(foodReducer, initialState);

  // Load foods on initial render
  useEffect(() => {
    loadAllFoods();
  }, []);

  // Action creators
  const loadAllFoods = async () => {
    dispatch({ type: 'LOAD_FOODS_REQUEST' });
    try {
      const result = await loadFoods();
      if (result.success && result.foods) {
        dispatch({ type: 'LOAD_FOODS_SUCCESS', payload: result.foods });
      } else {
        dispatch({ 
          type: 'LOAD_FOODS_FAILURE', 
          payload: result.error || 'Failed to load foods' 
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'LOAD_FOODS_FAILURE', 
        payload: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const addNewFood = async (food: Food) => {
    dispatch({ type: 'ADD_FOOD_REQUEST', payload: food });
    try {
      const result = await addFood(food);
      if (result.success) {
        dispatch({ type: 'ADD_FOOD_SUCCESS', payload: food });
      } else {
        dispatch({ 
          type: 'ADD_FOOD_FAILURE', 
          payload: result.error || 'Failed to add food' 
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'ADD_FOOD_FAILURE', 
        payload: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const updateExistingFood = async (food: Food) => {
    dispatch({ type: 'UPDATE_FOOD_REQUEST', payload: food });
    try {
      const result = await updateFood(food);
      if (result.success) {
        dispatch({ type: 'UPDATE_FOOD_SUCCESS', payload: food });
      } else {
        dispatch({ 
          type: 'UPDATE_FOOD_FAILURE', 
          payload: result.error || 'Failed to update food' 
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'UPDATE_FOOD_FAILURE', 
        payload: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const removeFood = async (id: string) => {
    dispatch({ type: 'DELETE_FOOD_REQUEST', payload: id });
    try {
      const result = await deleteFood(id);
      if (result.success) {
        dispatch({ type: 'DELETE_FOOD_SUCCESS', payload: id });
      } else {
        dispatch({ 
          type: 'DELETE_FOOD_FAILURE', 
          payload: result.error || 'Failed to delete food' 
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'DELETE_FOOD_FAILURE', 
        payload: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  return (
    <FoodContext.Provider value={{ 
      state, 
      dispatch, 
      loadAllFoods, 
      addNewFood, 
      updateExistingFood, 
      removeFood 
    }}>
      {children}
    </FoodContext.Provider>
  );
}

// Custom hook for using the food context
export function useFoodContext() {
  const context = useContext(FoodContext);
  if (context === undefined) {
    throw new Error('useFoodContext must be used within a FoodProvider');
  }
  return context;
}