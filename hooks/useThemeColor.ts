/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Colors } from '@/constants/Colors';

// Theme storage key (must match the one in theme.tsx)
const THEME_STORAGE_KEY = "app_theme";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const systemTheme = useColorScheme() ?? 'light';
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

  // Determine the actual theme to use
  let theme: 'light' | 'dark';
  if (appTheme === 'system') {
    theme = systemTheme as 'light' | 'dark';
  } else {
    theme = appTheme as 'light' | 'dark';
  }

  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
