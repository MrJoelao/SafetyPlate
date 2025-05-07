import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserPreferences, UserPreferencesAction } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const USER_PREFERENCES_KEY = '@safetyplate_user_preferences';

// Initial state
const initialState: UserPreferences = {
  allergies: [],
  intolerances: [],
  dietaryRestrictions: [],
};

// Create context
const UserPreferencesContext = createContext<{
  state: UserPreferences;
  dispatch: React.Dispatch<UserPreferencesAction>;
  setAllergies: (allergies: string[]) => Promise<void>;
  setIntolerances: (intolerances: string[]) => Promise<void>;
  setDietaryRestrictions: (restrictions: string[]) => Promise<void>;
} | undefined>(undefined);

// Reducer function
function userPreferencesReducer(
  state: UserPreferences,
  action: UserPreferencesAction
): UserPreferences {
  switch (action.type) {
    case 'SET_ALLERGIES':
      return {
        ...state,
        allergies: action.payload,
      };
    case 'SET_INTOLERANCES':
      return {
        ...state,
        intolerances: action.payload,
      };
    case 'SET_DIETARY_RESTRICTIONS':
      return {
        ...state,
        dietaryRestrictions: action.payload,
      };
    default:
      return state;
  }
}

// Provider component
export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userPreferencesReducer, initialState);

  // Load user preferences on initial render
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const storedPreferences = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
        if (storedPreferences) {
          const preferences = JSON.parse(storedPreferences) as UserPreferences;
          if (preferences.allergies) {
            dispatch({ type: 'SET_ALLERGIES', payload: preferences.allergies });
          }
          if (preferences.intolerances) {
            dispatch({ type: 'SET_INTOLERANCES', payload: preferences.intolerances });
          }
          if (preferences.dietaryRestrictions) {
            dispatch({ type: 'SET_DIETARY_RESTRICTIONS', payload: preferences.dietaryRestrictions });
          }
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };

    loadUserPreferences();
  }, []);

  // Save preferences when they change
  useEffect(() => {
    const saveUserPreferences = async () => {
      try {
        await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Error saving user preferences:', error);
      }
    };

    saveUserPreferences();
  }, [state]);

  // Action creators
  const setAllergies = async (allergies: string[]) => {
    dispatch({ type: 'SET_ALLERGIES', payload: allergies });
  };

  const setIntolerances = async (intolerances: string[]) => {
    dispatch({ type: 'SET_INTOLERANCES', payload: intolerances });
  };

  const setDietaryRestrictions = async (restrictions: string[]) => {
    dispatch({ type: 'SET_DIETARY_RESTRICTIONS', payload: restrictions });
  };

  return (
    <UserPreferencesContext.Provider value={{ 
      state, 
      dispatch, 
      setAllergies, 
      setIntolerances, 
      setDietaryRestrictions 
    }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

// Custom hook for using the user preferences context
export function useUserPreferencesContext() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferencesContext must be used within a UserPreferencesProvider');
  }
  return context;
}