"use client"

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import "react-native-reanimated"

import { useColorScheme } from "@/hooks/useColorScheme"

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  })
  const [onboardingCompleted, setOnboardingCompleted] = useState<null | boolean>(null)

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem("onboardingCompleted")
        setOnboardingCompleted(value === "true")
      } catch (e) {
        setOnboardingCompleted(false)
      }
    }
    checkOnboarding()
  }, [])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded || onboardingCompleted === null) {
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
        {onboardingCompleted ? (
          <>
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
            <Stack.Screen name="(settings)" />
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
            {/* Schermata Impostazioni */}
            <Stack.Screen
              name="settings"
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="(onboarding)/Welcome"
              options={{
                headerShown: false,
                contentStyle: {
                  flex: 1,
                },
              }}
            />
            <Stack.Screen name="(onboarding)/Tutorial1" />
            <Stack.Screen name="(onboarding)/Tutorial2" />
            <Stack.Screen name="(onboarding)/PlannerSetup" />
          </>
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  )
}

