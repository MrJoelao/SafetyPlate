import React from "react"
import { StyleSheet } from "react-native"
// Rimuovi Appbar
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { InlineFoodManager } from "@/components/ui/modals/InlineFoodManager"
import { ScreenHeader } from "@/components/ui/layout/ScreenHeader" // Importa ScreenHeader

export default function ManageFoodScreen() {
  const router = useRouter()

  return (
    // Rimuovi edges={["top"]}
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Gestisci Alimenti"
        showBackButton={true}
        onBackPress={() => router.back()}
        showSearch={false} // Potremmo voler abilitare la ricerca qui in futuro?
        showOptions={false} // Potremmo voler aggiungere opzioni (es. export)?
      />
      {/* Utilizziamo il componente esistente per la UI di gestione */}
      <InlineFoodManager />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Manteniamo lo sfondo coerente
  },
})