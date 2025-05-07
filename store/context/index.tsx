import React from 'react';
import type { ReactNode } from 'react';
import { AppProvider } from './AppContext';
import { FoodProvider } from './FoodContext';
import { UserPreferencesProvider } from './UserPreferencesContext';

// Root provider that combines all context providers
export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <UserPreferencesProvider>
        <FoodProvider>
          {children}
        </FoodProvider>
      </UserPreferencesProvider>
    </AppProvider>
  );
}

// Re-export all context hooks for easier imports
export { useAppContext } from './AppContext';
export { useFoodContext } from './FoodContext';
export { useUserPreferencesContext } from './UserPreferencesContext';