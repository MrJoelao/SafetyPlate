import React from "react"
import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { InlineFoodManager } from "@/components/ui/modals/InlineFoodManager"
import { ScreenHeader } from "@/components/ui/layout/ScreenHeader" // Importa ScreenHeader

export default function ManageFoodScreen() {
  const router = useRouter()

  return (
    // Rimuovi edges={["top"]}
    <View style={styles.container}>
      <ScreenHeader
        title="Gestisci Alimenti"
        showBackButton={true}
        onBackPress={() => router.back()}
        showSearch={false} // Potremmo voler abilitare la ricerca qui in futuro?
        showOptions={false} // Potremmo voler aggiungere opzioni (es. export)?
      />
      {/* Utilizziamo il componente esistente per la UI di gestione */}
      <InlineFoodManager />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Manteniamo lo sfondo coerente
  },
})