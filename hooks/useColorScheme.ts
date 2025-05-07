import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme storage key (must match the one in theme.tsx)
const THEME_STORAGE_KEY = "app_theme";

export function useColorScheme() {
  const deviceColorScheme = useDeviceColorScheme();
  const [appTheme, setAppTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on hook mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
          setAppTheme(savedTheme as 'light' | 'dark' | 'system');
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Determine the actual color scheme to use
  if (appTheme === 'system') {
    return deviceColorScheme;
  } else {
    return appTheme;
  }
}
