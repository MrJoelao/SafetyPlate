"use client"

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import { Appearance } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import "react-native-reanimated"

import { RootProvider, useAppContext } from "@/store/context"

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

// App layout component that uses the context
function AppLayout() {
  const { state: appState } = useAppContext();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  })

  // Always use the theme from app state, regardless of device theme
  const colorScheme = appState.theme;

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
          // Default animation for all screens
          animation: "fade_from_bottom",
          // Animation duration
          animationDuration: 300,
          // Gesture enabled for better UX
          gestureEnabled: true,
          // Presentation style for modals
          presentation: "card",
        }}
      >
        {/* Onboarding Screens - Always accessible */}
        <Stack.Screen
          name="(onboarding)/Welcome"
          options={{
            headerShown: false,
            contentStyle: {
              flex: 1,
            },
            // No animation for the welcome screen
            animation: "none",
          }}
        />
        <Stack.Screen 
          name="(onboarding)/Tutorial1" 
          options={{
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen 
          name="(onboarding)/Tutorial2" 
          options={{
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen 
          name="(onboarding)/PlannerSetup" 
          options={{
            animation: "slide_from_right",
          }}
        />

        {/* Main App Screens - Protected by onboarding guard */}
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

        {/* Settings Group */}
        <Stack.Screen 
          name="(settings)" 
          options={{
            animation: "slide_from_right",
          }}
        />

        {/* Modal Screens */}
        <Stack.Screen
          name="modals/meal-entry"
          options={{
            presentation: "modal",
            headerShown: false,
            animation: "slide_from_bottom",
            contentStyle: { backgroundColor: "rgba(0,0,0,0.5)" },
          }}
        />

        {/* Settings Screen */}
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  )
}

// Root layout component that provides the context
export default function RootLayout() {
  return (
    <RootProvider>
      <AppLayout />
    </RootProvider>
  )
}
