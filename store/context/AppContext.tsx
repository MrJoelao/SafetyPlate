import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppAction } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const APP_SETTINGS_KEY = '@safetyplate_app_settings';

// Initial state
const initialState: AppState = {
  theme: 'system',
  language: 'en',
};

// Create context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
} | undefined>(undefined);

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.payload,
      };
    default:
      return state;
  }
}

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load app settings on initial render
  useEffect(() => {
    const loadAppSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem(APP_SETTINGS_KEY);
        if (storedSettings) {
          const settings = JSON.parse(storedSettings) as AppState;
          if (settings.theme) {
            dispatch({ type: 'SET_THEME', payload: settings.theme });
          }
          if (settings.language) {
            dispatch({ type: 'SET_LANGUAGE', payload: settings.language });
          }
        }
      } catch (error) {
        console.error('Error loading app settings:', error);
      }
    };

    loadAppSettings();
  }, []);

  // Save settings when they change
  useEffect(() => {
    const saveAppSettings = async () => {
      try {
        await AsyncStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Error saving app settings:', error);
      }
    };

    saveAppSettings();
  }, [state]);

  // Action creators
  const setTheme = async (theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const setLanguage = async (language: string) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  };

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch, 
      setTheme, 
      setLanguage 
    }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook for using the app context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}