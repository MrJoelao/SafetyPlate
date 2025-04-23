"use client"

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import "react-native-reanimated"

import { useColorScheme } from "@/hooks/useColorScheme"

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            flex: 1,
          },
          animation: "fade",
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            contentStyle: {
              flex: 1,
            },
          }}
        />
        <Stack.Screen name="+not-found" />
        {/* Modal Screens */}
        <Stack.Screen
          name="modals/meal-entry"
          options={{
            presentation: "modal",
            headerShown: false,
            animation: "slide_from_bottom", // O un'altra animazione per replicare l'originale
            contentStyle: { backgroundColor: "rgba(0,0,0,0.5)" }, // Sfondo semi-trasparente
          }}
        />
        <Stack.Screen
          name="modals/options"
          options={{
            presentation: "transparentModal", // Per OptionsMenu che appare sopra
            headerShown: false,
            animation: "fade",
            contentStyle: { backgroundColor: "rgba(0,0,0,0.5)" },
          }}
        />
        <Stack.Screen
          name="modals/import-food"
          options={{
            presentation: "modal",
            headerShown: false,
            animation: "slide_from_bottom",
            contentStyle: { backgroundColor: "rgba(0,0,0,0.5)" },
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  )
}

