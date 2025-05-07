import React, { useState, useEffect } from "react"
import { ScrollView, StyleSheet, Alert } from "react-native"
import { List, Divider, Switch } from "react-native-paper"
import { useRouter } from "expo-router"
import { ScreenHeader } from "@/components/ui/layout/ScreenHeader" 
import { View, ActivityIndicator } from "react-native"
import * as presentationMode from "@/utils/presentationMode"

export default function SettingsScreen() {
  const router = useRouter()
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // Check if presentation mode is enabled on component mount
  useEffect(() => {
    const checkPresentationMode = async () => {
      try {
        const enabled = await presentationMode.isPresentationModeEnabled()
        setIsPresentationMode(enabled)
      } catch (error) {
        console.error('Error checking presentation mode:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    checkPresentationMode()
  }, [])

  // Handle presentation mode toggle
  const handlePresentationModeToggle = async (value: boolean) => {
    setIsLoading(true)
    try {
      if (value) {
        // Enable presentation mode
        const success = await presentationMode.enablePresentationMode()
        if (success) {
          setIsPresentationMode(true)
          Alert.alert(
            'Modalità Presentazione Attivata',
            'Dati di esempio sono stati generati per tutte le sezioni dell\'app.'
          )
        } else {
          Alert.alert(
            'Errore',
            'Impossibile attivare la modalità presentazione.'
          )
        }
      } else {
        // Disable presentation mode
        const success = await presentationMode.disablePresentationMode()
        if (success) {
          setIsPresentationMode(false)
          Alert.alert(
            'Modalità Presentazione Disattivata',
            'La modalità presentazione è stata disattivata, ma i dati di esempio rimangono. Usa "Elimina tutti i dati" per rimuoverli.'
          )
        } else {
          Alert.alert(
            'Errore',
            'Impossibile disattivare la modalità presentazione.'
          )
        }
      }
    } catch (error) {
      console.error('Error toggling presentation mode:', error)
      Alert.alert(
        'Errore',
        'Si è verificato un errore durante la modifica della modalità presentazione.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Handle clear all data
  const handleClearAllData = () => {
    Alert.alert(
      'Elimina Tutti i Dati',
      'Sei sicuro di voler eliminare tutti i dati? Questa azione non può essere annullata.',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true)
            try {
              const success = await presentationMode.clearAllData()
              if (success) {
                setIsPresentationMode(false)
                Alert.alert(
                  'Dati Eliminati',
                  'Tutti i dati sono stati eliminati con successo.'
                )
              } else {
                Alert.alert(
                  'Errore',
                  'Impossibile eliminare i dati.'
                )
              }
            } catch (error) {
              console.error('Error clearing data:', error)
              Alert.alert(
                'Errore',
                'Si è verificato un errore durante l\'eliminazione dei dati.'
              )
            } finally {
              setIsLoading(false)
            }
          },
        },
      ]
    )
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Impostazioni"
        showBackButton={true}
        onBackPress={() => router.back()}
        showSearch={false}
        showOptions={false}
      />
      {isInitializing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* Sezione Profilo (Segnaposto) */}
          <List.Section title="Profilo">
            <List.Item
              title="Informazioni Utente"
              description="Modifica i tuoi dati"
              left={(props) => <List.Icon {...props} icon="account-circle-outline" />}
              onPress={() => router.push("/(settings)/user-info")}
            />
          </List.Section>
          <Divider />

          {/* Sezione Dati */}
          <List.Section title="Dati Applicazione">
            <List.Item
              title="Importa Alimenti"
              description="Carica alimenti da un file"
              left={(props) => <List.Icon {...props} icon="upload" />}
              onPress={() => router.push("/(settings)/import-food")}
            />
            <List.Item
              title="Gestisci Alimenti"
              description="Visualizza e modifica i tuoi alimenti"
              left={(props) => <List.Icon {...props} icon="food-apple-outline" />}
              onPress={() => router.push("/(settings)/manage-food")}
            />
            <List.Item
              title="Modalità Presentazione"
              description="Popola l'app con dati di esempio"
              left={(props) => <List.Icon {...props} icon="presentation" />}
              right={() => (
                <Switch
                  value={isPresentationMode}
                  onValueChange={handlePresentationModeToggle}
                  disabled={isLoading}
                />
              )}
            />
            <List.Item
              title="Elimina Tutti i Dati"
              description="Rimuovi tutti i dati salvati"
              left={(props) => <List.Icon {...props} icon="delete" color="#e74c3c" />}
              onPress={handleClearAllData}
              disabled={isLoading}
            />
          </List.Section>
          <Divider />

          {/* Sezione Aspetto (Segnaposto) */}
          <List.Section title="Aspetto">
            <List.Item
              title="Tema"
              description="Scegli tema chiaro o scuro"
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              onPress={() => router.push("/(settings)/theme")}
            />
          </List.Section>
          <Divider />

          {/* Sezione Onboarding */}
          <List.Section title="Onboarding">
            <List.Item
              title="Ricomincia configurazione iniziale"
              description="Ripeti il setup guidato e il tutorial"
              left={(props) => <List.Icon {...props} icon="restart" />}
              onPress={async () => {
                const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
                await AsyncStorage.setItem('onboardingCompleted', 'false');
                router.replace('/(onboarding)/Welcome');
              }}
            />
          </List.Section>
        </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
