/**
 * Hook to get colors based on the current theme
 * Uses the AppContext for theme management
 */

import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useAppContext } from '@/store/context';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { state: appState } = useAppContext();
  const deviceTheme = useDeviceColorScheme() ?? 'light';

  // Determine the actual theme to use based on app settings
  let theme: 'light' | 'dark';
  if (appState.theme === 'system') {
    theme = deviceTheme as 'light' | 'dark';
  } else {
    theme = appState.theme as 'light' | 'dark';
  }

  // First check if the color is provided in props
  const colorFromProps = props[theme];
  if (colorFromProps) {
    return colorFromProps;
  } 

  // Otherwise use the color from the theme
  return Colors[theme][colorName];
}
