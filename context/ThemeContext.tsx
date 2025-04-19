"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useColorScheme } from "react-native"

// Define theme colors
export interface ThemeColors {
  primary: string
  secondary: string
  background: string
  card: string
  text: string
  border: string
  notification: string
  success: string
  warning: string
  danger: string
  info: string
}

// Define light and dark themes
const lightTheme: ThemeColors = {
  primary: "#4CAF50",
  secondary: "#2196F3",
  background: "#FFFFFF",
  card: "#F5F5F5",
  text: "#1F1F1F",
  border: "#E0E0E0",
  notification: "#FF9800",
  success: "#4CAF50",
  warning: "#FFC107",
  danger: "#F44336",
  info: "#2196F3",
}

const darkTheme: ThemeColors = {
  primary: "#4CAF50",
  secondary: "#2196F3",
  background: "#121212",
  card: "#1E1E1E",
  text: "#FFFFFF",
  border: "#333333",
  notification: "#FF9800",
  success: "#4CAF50",
  warning: "#FFC107",
  danger: "#F44336",
  info: "#2196F3",
}

// Define theme context
interface ThemeContextType {
  theme: ThemeColors
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme()
  const [isDark, setIsDark] = useState(colorScheme === "dark")

  // Update theme when system theme changes
  useEffect(() => {
    setIsDark(colorScheme === "dark")
  }, [colorScheme])

  // Toggle theme function
  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  // Current theme
  const theme = isDark ? darkTheme : lightTheme

  return <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>{children}</ThemeContext.Provider>
}

// Hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
