import React from "react"
import { StyleSheet } from "react-native"
// Rimuovi Appbar
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { FoodImportView } from "@/components/ui/modals/FoodImportView"
import { ScreenHeader } from "@/components/ui/layout/ScreenHeader" // Importa ScreenHeader

export default function ImportFoodScreen() {
  const router = useRouter()

  // Funzione da chiamare quando l'importazione ha successo
  const handleSuccess = () => {
    // Potremmo mostrare un messaggio di successo prima di tornare indietro
    router.back()
  }

  return (
    // Rimuovi edges={["top"]}
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Importa Alimenti"
        showBackButton={true}
        onBackPress={() => router.back()}
        showSearch={false}
        showOptions={false}
      />
      {/* Utilizziamo il componente esistente per la UI di importazione */}
      <FoodImportView onSuccess={handleSuccess} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Manteniamo lo sfondo coerente
  },
})