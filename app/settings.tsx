import React from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { Appbar, List, Divider, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { ThemedView } from "@/components/common/ThemedView"
import { ThemedText } from "@/components/common/ThemedText"

export default function SettingsScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Impostazioni" />
      </Appbar.Header>
      <ScrollView style={styles.scrollView}>
        {/* Sezione Profilo (Segnaposto) */}
        <List.Section title="Profilo">
          <List.Item
            title="Informazioni Utente"
            description="Modifica i tuoi dati"
            left={(props) => <List.Icon {...props} icon="account-circle-outline" />}
            onPress={() => console.log("Naviga a Profilo")} // Azione segnaposto
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
        </List.Section>
        <Divider />

        {/* Sezione Aspetto (Segnaposto) */}
        <List.Section title="Aspetto">
          <List.Item
            title="Tema"
            description="Scegli tema chiaro o scuro"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            onPress={() => console.log("Apri selezione Tema")} // Azione segnaposto
          />
        </List.Section>
        <Divider />

        {/* Aggiungere altre sezioni se necessario */}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Sfondo leggermente grigio per coerenza
  },
  scrollView: {
    flex: 1,
  },
  // Aggiungere altri stili se necessario
})