import React, { useState, useEffect } from "react"
import { StyleSheet, View, ScrollView, Alert } from "react-native"
import { useRouter } from "expo-router"
import { ScreenHeader } from "@/components/ui/layout/ScreenHeader"
import { List, RadioButton, Text, Divider } from "react-native-paper"
import { useAppContext } from "@/store/context"

// Theme options
const THEME_OPTIONS = [
  { label: "Chiaro", value: "light", icon: "white-balance-sunny" },
  { label: "Scuro", value: "dark", icon: "moon-waning-crescent" },
]

export default function ThemeScreen() {
  const router = useRouter()
  const { state: appState, setTheme } = useAppContext()
  const [selectedTheme, setSelectedTheme] = useState<string>(appState.theme)
  const [isLoading, setIsLoading] = useState(false)

  // Update local state when app state changes
  useEffect(() => {
    setSelectedTheme(appState.theme)
  }, [appState.theme])

  // Handle theme selection
  const handleThemeChange = async (value: string) => {
    setSelectedTheme(value)
    try {
      // Use the AppContext's setTheme function to update the theme
      await setTheme(value as 'light' | 'dark' | 'system')
      // Show a message that the theme has been changed
      Alert.alert(
        "Tema Cambiato",
        "Il tema è stato cambiato e verrà applicato immediatamente.",
        [{ text: "OK" }]
      )
    } catch (error) {
      console.error("Error saving theme:", error)
      Alert.alert(
        "Errore",
        "Si è verificato un errore durante il salvataggio del tema.",
        [{ text: "OK" }]
      )
    }
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Tema"
        showBackButton={true}
        onBackPress={() => router.back()}
        showSearch={false}
        showOptions={false}
      />
      <ScrollView style={styles.scrollView}>
        <List.Section title="Seleziona Tema">
          <Text style={styles.description}>
            Scegli il tema dell'applicazione. Le modifiche saranno applicate immediatamente.
          </Text>
          <RadioButton.Group onValueChange={handleThemeChange} value={selectedTheme}>
            {THEME_OPTIONS.map((option) => (
              <List.Item
                key={option.value}
                title={option.label}
                left={(props) => <List.Icon {...props} icon={option.icon} />}
                right={() => <RadioButton value={option.value} />}
                onPress={() => handleThemeChange(option.value)}
              />
            ))}
          </RadioButton.Group>
        </List.Section>
        <Divider />
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Informazioni sul tema</Text>
          <Text style={styles.infoText}>
            Il tema chiaro è ottimizzato per l'uso durante il giorno, mentre il tema scuro è ideale per l'uso in ambienti con poca luce.
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  description: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    color: "#666",
  },
  infoSection: {
    padding: 16,
    backgroundColor: "#e3f2fd",
    margin: 16,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    color: "#333",
    marginBottom: 8,
  },
})
